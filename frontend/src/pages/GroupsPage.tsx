import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, message, Empty, Button, Modal, Form, Input, Space, Popconfirm } from 'antd';
import { Plus, Edit, Delete, UserPlus } from 'lucide-react';
import moment from 'moment';
import { apiGet, apiPost, apiDelete } from '../api/apiUtils';

interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
}

interface CreateGroupForm {
  name: string;
  description: string;
}

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createForm] = Form.useForm();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // Get current user's email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        navigate('/login');
        return;
      }
      
      const data = await apiGet(`/groups?userEmail=${encodeURIComponent(userEmail)}`);
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      message.error('Error loading groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (values: CreateGroupForm) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        return;
      }
      
      await apiPost('/groups', {
        name: values.name,
        description: values.description,
        createdBy: userEmail
      });

      message.success('Group created successfully!');
      setCreateModalVisible(false);
      createForm.resetFields();
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      message.error('Error creating group');
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        return;
      }
      
      await apiDelete(`/groups/${groupId}?userEmail=${encodeURIComponent(userEmail)}`);
      message.success('Group deleted successfully!');
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      if (error.message?.includes('403')) {
        message.error('You do not have permission to delete this group');
      } else {
        message.error('Error deleting group');
      }
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Members',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Group) => (
        <Space>
          <Button
            type="text"
            icon={<UserPlus size={16} />}
            onClick={() => navigate(`/groups/${record.id}/members`)}
            title="Add Member"
          />
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => navigate(`/groups/${record.id}/edit`)}
            title="Edit Group"
          />
          <Popconfirm
            title="Are you sure you want to delete this group?"
            onConfirm={() => handleDeleteGroup(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<Delete size={16} />}
              title="Delete Group"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-indigo-700">Groups</h1>
      <Button
        type="primary"
        icon={<Plus size={18} />}
        onClick={() => setCreateModalVisible(true)}
        className="mb-6"
      >
        Create New Group
      </Button>
      {loading ? (
        <Empty description="Loading groups..." />
      ) : groups.length === 0 ? (
        <Empty description="No groups found. Create a new one!" />
      ) : (
        <Table
          columns={columns}
          dataSource={groups}
          rowKey="id"
          pagination={false}
          className="bg-white rounded-2xl shadow-2xl"
        />
      )}

      <Modal
        title="Create New Group"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateGroup}
        >
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: 'Please enter group name!' }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter group description!' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter group description" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Group
              </Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                createForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
