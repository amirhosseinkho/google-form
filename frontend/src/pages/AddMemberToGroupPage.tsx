import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, message, Table, Space, Popconfirm } from 'antd';
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../api/apiUtils';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
}

interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  userName: string;
  joinedAt: string;
}

export default function AddMemberToGroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      const data = await apiGet('/user-managements/list');
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        navigate('/login');
        return;
      }
      
      const data = await apiGet(`/groups/${groupId}/members?userEmail=${encodeURIComponent(userEmail)}`);
      setGroupMembers(data);
    } catch (error) {
      console.error('Error fetching group members:', error);
      if (error.message?.includes('403')) {
        message.error('You do not have permission to view this group');
        navigate('/groups');
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchGroupMembers()]);
      setLoading(false);
    };
    loadData();
  }, [groupId]);

  const handleAddMember = async (values: { userId: string }) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        return;
      }
      
      await apiPost(`/groups/members?userEmail=${encodeURIComponent(userEmail)}`, {
        groupId: parseInt(groupId!),
        userId: parseInt(values.userId)
      });

      message.success('Member added successfully!');
      form.resetFields();
      fetchGroupMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      if (error.message?.includes('403')) {
        message.error('You do not have permission to add members to this group');
      } else {
        message.error('Failed to add member');
      }
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        return;
      }
      
      await apiDelete(`/groups/members?userEmail=${encodeURIComponent(userEmail)}&groupId=${groupId}&userId=${userId}`);
      message.success('Member removed successfully!');
      fetchGroupMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      if (error.message?.includes('403')) {
        message.error('You do not have permission to remove members from this group');
      } else {
        message.error('Failed to remove member');
      }
    }
  };

  const memberColumns = [
    {
      title: 'Name',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Joined At',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: GroupMember) => (
        <Popconfirm
          title="Are you sure you want to remove this member?"
          onConfirm={() => handleRemoveMember(record.userId)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<UserMinus size={16} />}
            title="Remove Member"
          />
        </Popconfirm>
      ),
    },
  ];

  // Filter out users who are already members
  const availableUsers = users.filter(user => 
    !groupMembers.some(member => member.userId === user.id)
  );

  return (
    <div>
      <div className="mb-6">
        <Button
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/groups')}
          className="mb-4"
        >
          Back to Groups
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">
          Manage Group Members
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Member Form */}
        <Card title="Add New Member" className="bg-white rounded-2xl shadow-2xl">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddMember}
          >
            <Form.Item
              name="userId"
              label="Select User"
              rules={[{ required: true, message: 'Please select a user!' }]}
            >
              <Input.Group compact>
                <Form.Item noStyle name="userId">
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="">Select a user...</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.username})
                      </option>
                    ))}
                  </select>
                </Form.Item>
              </Input.Group>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<UserPlus size={16} />}>
                Add Member
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Current Members */}
        <Card title="Current Members" className="bg-white rounded-2xl shadow-2xl">
          {loading ? (
            <div>Loading members...</div>
          ) : groupMembers.length === 0 ? (
            <div>No members in this group yet.</div>
          ) : (
            <Table
              columns={memberColumns}
              dataSource={groupMembers}
              rowKey="id"
              pagination={false}
              size="small"
            />
          )}
        </Card>
      </div>
    </div>
  );
} 