import React, { useState } from "react";
import { Table, Button, Modal, Space, message, Card } from "antd";
import { Edit, Trash2 } from "lucide-react";

const mockGroups = [
  { id: "1", name: "Admin", memberCount: 3 },
  { id: "2", name: "User", memberCount: 5 },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState(mockGroups);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const showDeleteModal = (id: string) => {
    setDeletingId(id);
    setModalVisible(true);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    setGroups((prev) => prev.filter((g) => g.id !== deletingId));
    setModalVisible(false);
    setDeletingId(null);
    // call api for deleting item here
    message.success("Group deleted successfully");
  };

  const handleEdit = (id: string) => {
    // navigate to group edit page
    message.info(`Edit group ${id}`);
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Member Count", dataIndex: "memberCount", key: "memberCount" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => handleEdit(record.id)}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => showDeleteModal(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Groups">
      <Table
        columns={columns}
        dataSource={groups}
        rowKey="id"
        pagination={false}
      />
      <Modal
        open={modalVisible}
        title="Confirm Deletion"
        onOk={handleDelete}
        onCancel={() => setModalVisible(false)}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this group?</p>
      </Modal>
    </Card>
  );
}
