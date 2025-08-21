import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [form] = Form.useForm();
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const navigate = useNavigate();

  const onValuesChange = () => {
    // Use setTimeout to ensure form validation has completed
    setTimeout(() => {
      const hasErrors = form.getFieldsError().some(({ errors }) => errors.length > 0);
      const values = form.getFieldsValue();
      const requiredFieldsFilled = values.email && values.password;
      
      setSubmitDisabled(!(requiredFieldsFilled && !hasErrors));
    }, 100);
  };

  const onFinish = async (values: any) => {
    setSubmitDisabled(true);
    try {
      const response = await fetch('http://localhost:8081/api/user-managements/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.email, // Using email as username
          password: values.password
        }),
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, navigating to /', data);
        // Store user data and JWT token
        localStorage.setItem('token', data.token || '');
        localStorage.setItem('userId', data.id?.toString() || '');
        localStorage.setItem('userEmail', data.email || '');
        localStorage.setItem('userName', data.name || '');
        message.success(data.message || 'Login successful!', 2, () => navigate('/'));
      } else {
        const error = await response.json();
        console.log('Login failed:', error);
        message.error(error.message || 'Login failed. Try again.', 3);
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Login failed. Try again.', 3);
    } finally {
      setTimeout(() => setSubmitDisabled(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <h2 className="text-4xl font-bold mb-6 text-center text-indigo-700">Login</h2>
        <Form
          form={form}
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          layout="vertical"
          className="space-y-6"
        >
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Email is required' },
              { pattern: /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Invalid email format' },
            ]}
          >
            <Input placeholder="Enter your email" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>
          <Form.Item
            label={<span className="text-lg font-semibold text-indigo-700">Password</span>}
            name="password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 6, message: 'Password too short' },
            ]}
          >
            <Input.Password placeholder="Enter your password" className="border-indigo-300 focus:border-indigo-500 rounded-lg p-2" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={submitDisabled}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300"
            >
              Log In
            </Button>
          </Form.Item>
          <div className="text-center text-gray-600 space-y-2">
            <div>
              <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-800 font-medium">Forgot Password?</Link>
            </div>
            <div>
              Don't have an account? <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign Up</Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}