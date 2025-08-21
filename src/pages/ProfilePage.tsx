import React, { useEffect, useState } from "react";
import { Card, List, Button, Spin, message, Input, Modal, Avatar, Space} from "antd";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../api/mockApi";

export default function ProfilePage() {
    const [forms, setForms] = useState<any[]>([]);
    const [formsLoading, setFormsLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState("");
    const navigate = useNavigate();

    const currentUserId = Number(localStorage.getItem("userId"));

    useEffect(() => {
        fetchForms();
        fetchProfile();
    }, [currentUserId]);

    const fetchForms = () => {
        setFormsLoading(true);
        mockApi
            .getUserAllowedForms(currentUserId)
            .then(setForms)
            .catch((e) => message.error(e.message))
            .finally(() => setFormsLoading(false));
    };

    const fetchProfile = () => {
        setProfileLoading(true);
        mockApi
            .getProfile()
            .then((data) => {
                setName(data.name);
                setEmail(data.email);
            })
            .catch(() => message.error("Failed to load profile"))
            .finally(() => setProfileLoading(false));
    };

    const handleSave = () => {
        mockApi
            .updateProfile({ name })
            .then(() => {
                message.success("Profile updated");
                setIsEditing(false);
            })
            .catch(() => message.error("Update failed"));
    };

    const handleDeleteAccount = () => {
        if (confirmEmail !== email) {
            message.error("Email does not match");
            return;
        }
        mockApi
            .deleteAccount()
            .then(() => {
                message.success("Account deleted successfully");
                navigate("/login");
            })
            .catch(() => message.error("Account deletion failed"));
    };

    if (formsLoading || profileLoading) {
        return <Spin size="large" className="w-full flex justify-center" />;
    }

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <Card title="My Available Forms">
                <List
                    itemLayout="horizontal"
                    dataSource={forms}
                    renderItem={(form) => (
                        <List.Item
                            actions={[
                                <Button
                                    key="submit"
                                    type="primary"
                                    icon={<FileText size={16} />}
                                    onClick={() => navigate(`/forms/${form.id}`)}
                                >
                                    Fill Form
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                title={form.title}
                                description={`Status: ${form.status}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>

            <Card title="My Profile">
                <div className="flex flex-col items-center gap-4 mb-4">
                    <Avatar size={80}>{name.charAt(0).toUpperCase()}</Avatar>
                </div>

                <div className="mb-4">
                    <label>Name:</label>
                    {isEditing ? (
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    ) : (
                        <div>{name}</div>
                    )}
                </div>

                <div className="mb-4">
                    <label>Email:</label>
                    <div>{email}</div>
                </div>

                {isEditing ? (
                    <div className="flex gap-2">
                        <Button type="primary" onClick={handleSave}>
                            Save
                        </Button>
                        <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button danger onClick={() => setDeleteModalVisible(true)}>
                            Delete Account
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit</Button>
                )}

                <Modal
                    open={deleteModalVisible}
                    title="Confirm Account Deletion"
                    onOk={handleDeleteAccount}
                    onCancel={() => setDeleteModalVisible(false)}
                    okText="Confirm"
                    cancelText="Cancel"
                >
                    <p>Please type your email ({email}) to confirm deletion:</p>
                    <Input
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                    />
                </Modal>
            </Card>
        </div>
    );
}
