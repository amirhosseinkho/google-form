import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPut } from '../api/apiUtils';

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return null;
    }
    return parseInt(userId);
  };

  const fetchUserProfile = async () => {
    try {
      setInitialLoading(true);
      const userId = getCurrentUserId();
      if (!userId) {
        return;
      }
      const data = await apiGet(`/user-managements/${userId}`);
      setUserData(data);
      form.setFieldsValue({
        name: data.name,
        email: data.email,
        username: data.username,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Failed to load profile');
      navigate('/login');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return;
      }

      // Prepare update data
      const updateData: any = {
        name: values.name,
        email: values.email,
        username: values.username,
      };

      // Only include password if it's provided
      if (values.password && values.password.trim() !== '') {
        updateData.password = values.password;
      }

      await apiPut(`/user-managements/${userId}`, updateData);
      
      message.success('Profile updated successfully!');
      // Update localStorage with new data
      localStorage.setItem('userEmail', values.email);
      localStorage.setItem('userName', values.name);
      // Refresh user data
      await fetchUserProfile();
      // Clear password field
      form.setFieldsValue({ password: '' });
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-indigo-700">Profile</h1>
        <Card className="max-w-2xl">
          <div className="text-center py-8">Loading profile...</div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-indigo-700">Profile</h1>
      
      <Card className="max-w-2xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-2 text-gray-600">
          <p><strong>User ID:</strong> {userData?.id}</p>
          <p><strong>Account Status:</strong> <span className="text-green-600">Active</span></p>
        </div>
      </Card>

      <Card className="max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="New Password (leave blank to keep current)"
            name="password"
            rules={[
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
