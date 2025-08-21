import { useEffect, useState } from "react";
import { Table, Button, Modal, Tag, Space, message, Card, Input } from "antd";
import { Eye, Edit, Trash2, Plus, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../api/mockApi";

export default function FormsPage() {
    const [forms, setForms] = useState<Record<string, any>[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingForm, setDeletingForm] = useState<Record<string, any> | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [deleteError, setDeleteError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const response = await mockApi.getForms();
            setForms(response);
        } catch (err: any) {
            message.error(err.message || "Fetching forms failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const showDeleteModal = (form: Record<string, any>) => {
        setDeletingForm(form);
        setModalVisible(true);
        setConfirmTitle('');
        setDeleteError('');
    };

    const handleDelete = async () => {
        if (!deletingForm) return;

        if (confirmTitle !== deletingForm.title) {
            setDeleteError('Title does not match');
            return;
        }

        try {
            await mockApi.deleteForm(deletingForm.id);
            setForms((prev) => prev.filter((f) => f?.id !== deletingForm?.id));
            message.success("Form deleted successfully");
            setModalVisible(false);
            setDeletingForm(null);
            setConfirmTitle('');
            setDeleteError('');
        } catch (error) {
            message.error("Failed to delete form");
        }
    };

    const handleView = (id: string) => {
        navigate(`/forms/${id}`);
    };

    const handleEdit = (id: string) => {
        navigate(`/forms/${id}/edit`);
    };

    const handleReport = (id: string) => {
        navigate(`/reports/${id}`);
    };

    const handleNewForm = () => {
        navigate("/forms/new");
    };

    const columns = [
        { title: "Title", dataIndex: "title", key: "title" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "Active" ? "success" : "default"}>{status}</Tag>
            ),
        },
        { title: "Last Modified", dataIndex: "lastModified", key: "lastModified" },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="text"
                        icon={<Eye size={16} />}
                        onClick={() => handleView(record.id)}
                    />
                    <Button
                        type="text"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(record.id)}
                    />
                    <Button
                        type="text"
                        icon={<PieChart size={16} />}
                        onClick={() => handleReport(record.id)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<Trash2 size={16} />}
                        onClick={() => showDeleteModal(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="My Forms"
            extra={
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={handleNewForm}
                    className="hidden md:flex"
                >
                    Create New Form
                </Button>
            }
            actions={[
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={handleNewForm}
                    className="md:hidden"
                >
                    Create New Form
                </Button>,
            ]}
        >
            <div className="overflow-x-auto">
                <Table
                    columns={columns}
                    dataSource={forms}
                    rowKey="id"
                    pagination={false}
                    loading={loading}
                    scroll={{ x: "max-content" }}
                />
            </div>
            <Modal
                open={modalVisible}
                title="Delete Form"
                onOk={handleDelete}
                onCancel={() => {
                    setModalVisible(false);
                    setDeletingForm(null);
                    setConfirmTitle('');
                    setDeleteError('');
                }}
                okText="Confirm"
                cancelText="Cancel"
            >
                <p>Type the form title to confirm deletion:</p>
                <div className="mb-4">
                    <Input
                        value={confirmTitle}
                        onChange={(e) => {
                            setConfirmTitle(e.target.value);
                            setDeleteError('');
                        }}
                        placeholder="Enter form title"
                        status={deleteError ? 'error' : ''}
                    />
                    {deleteError && (
                        <div className="text-red-500 mt-1 text-sm">{deleteError}</div>
                    )}
                </div>
            </Modal>
        </Card>
    );
}
