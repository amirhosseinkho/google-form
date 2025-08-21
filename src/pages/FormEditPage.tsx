import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Input, message, Form, Spin } from 'antd';
import { Trash2 } from 'lucide-react';
import { mockApi } from '../api/mockApi';

interface FormData {
    id: string;
    title: string;
    status: string;
    lastModified: string;
}

export default function FormEditPage() {
    const { formId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [formSchema, setFormSchema] = useState<any[]>([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        if (formId) {
            setLoading(true);
            Promise.all([
                mockApi.getForm(formId),
                mockApi.getFormById(formId)
            ])
                .then(([data, schema]) => {
                    if (!data) {
                        message.error('Form not found');
                        navigate('/forms');
                        return;
                    }
                    setFormData(data);
                    setFormSchema(schema);
                    form.setFieldsValue(schema);
                })
                .catch(() => {
                    message.error('Failed to load form');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [formId, form, navigate]);

    const handleDelete = async () => {
        if (!formData) return;

        if (confirmTitle !== formData.title) {
            setDeleteError('Title does not match');
            return;
        }

        try {
            await mockApi.deleteForm(formId!);
            message.success('Form deleted successfully');
            navigate('/');
        } catch (error) {
            message.error('Failed to delete form');
        }
        setDeleteModalVisible(false);
        setConfirmTitle('');
        setDeleteError('');
    };

    if (loading) {
        return <Spin size="large" className="w-full flex justify-center" />;
    }

    if (!formData) {
        return null;
    }

    return (
        <Card 
            title={`Edit Form: ${formData.title}`}
            extra={
                <Button
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => setDeleteModalVisible(true)}
                >
                    Delete
                </Button>
            }
        >
            {/* Form edit fields will go here */}
            <div>Form editing interface coming soon...</div>

            <Modal
                title="Delete Form"
                open={deleteModalVisible}
                onOk={handleDelete}
                onCancel={() => {
                    setDeleteModalVisible(false);
                    setConfirmTitle('');
                    setDeleteError('');
                }}
                okText="Confirm"
                cancelText="Cancel"
            >
                <p>Type the form title to confirm deletion:</p>
                <Form.Item
                    validateStatus={deleteError ? 'error' : ''}
                    help={deleteError}
                >
                    <Input
                        value={confirmTitle}
                        onChange={(e) => {
                            setConfirmTitle(e.target.value);
                            setDeleteError('');
                        }}
                        placeholder="Enter form title"
                    />
                </Form.Item>
            </Modal>
        </Card>
    );
} 