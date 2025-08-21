import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Card, Spin, Empty } from 'antd';
import { ArrowLeft, Save, Users } from 'lucide-react';
import moment from 'moment';
import { apiGet, apiPut } from '../api/apiUtils';

interface Group {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

export default function EditGroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        navigate('/login');
        return;
      }
      
      const data = await apiGet(`/groups/${groupId}?userEmail=${encodeURIComponent(userEmail)}`);
      setGroup(data);
      form.setFieldsValue({
        name: data.name,
        description: data.description,
      });
    } catch (error) {
      console.error('Error fetching group:', error);
      if (error.message?.includes('403')) {
        message.error('You do not have permission to edit this group');
        navigate('/groups');
      } else if (error.message?.includes('404')) {
        message.error('Group not found');
        navigate('/groups');
      } else {
        message.error('Error loading group');
        navigate('/groups');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const handleUpdateGroup = async (values: any) => {
    try {
      setSaving(true);
      
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        return;
      }
      
      await apiPut(`/groups/${groupId}?userEmail=${encodeURIComponent(userEmail)}`, {
        name: values.name,
        description: values.description,
      });

      message.success('Group updated successfully!');
      navigate('/groups');
    } catch (error) {
      console.error('Error updating group:', error);
      if (error.message?.includes('403')) {
        message.error('You do not have permission to update this group');
      } else {
        message.error('Error updating group');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!group) {
    return <Empty description="Group not found" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            icon={<ArrowLeft size={16} />} 
            onClick={() => navigate('/groups')}
            className="mr-4"
          >
            Back to Groups
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">
            Edit Group: {group.name}
          </h1>
        </div>
        <Button
          icon={<Users size={16} />}
          onClick={() => navigate(`/groups/${groupId}/members`)}
          title="Manage Members"
        >
          Manage Members
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Group Information */}
        <div className="lg:col-span-1">
          <Card title="Group Information" className="mb-6">
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-600">Group ID:</span>
                <span className="ml-2 text-gray-900">{group.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created By:</span>
                <span className="ml-2 text-gray-900">{group.createdBy}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created At:</span>
                <span className="ml-2 text-gray-900">
                  {moment(group.createdAt).format('YYYY-MM-DD HH:mm')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Modified:</span>
                <span className="ml-2 text-gray-900">
                  {moment(group.lastModified).format('YYYY-MM-DD HH:mm')}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <Card title="Edit Group Details">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateGroup}
            >
              <Form.Item
                name="name"
                label="Group Name"
                rules={[
                  { required: true, message: 'Please enter group name!' },
                  { min: 2, message: 'Group name must be at least 2 characters!' }
                ]}
              >
                <Input placeholder="Enter group name" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: 'Please enter group description!' },
                  { min: 10, message: 'Description must be at least 10 characters!' }
                ]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Enter detailed group description" 
                />
              </Form.Item>

              <Form.Item>
                <div className="flex gap-3">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={saving}
                    icon={<Save size={16} />}
                  >
                    Save Changes
                  </Button>
                  <Button onClick={() => navigate('/groups')}>
                    Cancel
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
} 