import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

export default function ResetPasswordPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Get token from query string
  const params = new URLSearchParams(location.search);
  const urlToken = params.get('token') || '';

  const onFinish = async (values: { token: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user-managements/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: values.token, newPassword: values.newPassword }),
      });
      const result = await response.json();
      if (response.ok) {
        message.success(result.message || 'Password reset successful!');
        navigate('/login');
      } else {
        message.error(result.message || 'Failed to reset password.');
      }
    } catch (err) {
      message.error('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-4xl font-bold mb-6 text-center text-indigo-700">Reset Password</h2>
        <Form form={form} onFinish={onFinish} layout="vertical" initialValues={{ token: urlToken }}>
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Token</span>}
            name="token"
            rules={[{ required: true, message: 'Token is required.' }]}
          >
            <Input placeholder="Enter the token you received" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">New Password</span>}
            name="newPassword"
            rules={[{ required: true, message: 'Please enter your new password.' }]}
          >
            <Input.Password placeholder="Enter new password" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Confirm Password</span>}
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: 'Please confirm your new password.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match.'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300"
              loading={loading}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}