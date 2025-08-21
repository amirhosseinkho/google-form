import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Alert, Select } from "antd";
import { mockApi } from "../api/mockApi";

const { Option } = Select;

export default function RegisterPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [emailError, setEmailError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (values: {
        email: string;
        password: string;
        confirmPassword: string;
        role: "admin" | "user";
    }) => {
        setLoading(true);
        setServerError("");
        setEmailError("");
        try {
            // Simulate API call
            const response = await mockApi.register(
                values.email,
                values.password,
                values.role
            );
            form.resetFields();
            message.success(
                "Registration successful! Redirecting to login...",
                2,
                () => {
                    navigate("/login");
                }
            );
        } catch (err: any) {
            if (err.cause === 409) {
                setEmailError("Email already registered");
            } else if (err.cause === 500) {
                setServerError("Registration failed. Try again.");
            } else {
                setServerError(err.message || "Registration failed. Try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            {serverError && (
                <Alert type="error" message={serverError} className="mb-4" />
            )}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleRegister}
                autoComplete="off"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    validateStatus={emailError ? "error" : undefined}
                    help={emailError ? emailError : undefined}
                    rules={[
                        { required: true, message: "Please enter your email" },
                        { type: "email", message: "Please enter a valid email" },
                    ]}
                >
                    <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        { required: true, message: "Please enter your password" },
                        { min: 6, message: "Password must be at least 6 characters" },
                    ]}
                    hasFeedback
                >
                    <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                        { required: true, message: "Please confirm your password" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Passwords do not match!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Confirm Password" />
                </Form.Item>
                <Form.Item
                    label="Role"
                    name="role"
                    rules={[{ required: true, message: "Please select your role" }]}
                >
                    <Select placeholder="Select your role">
                        <Option value="user">User</Option>
                        <Option value="admin">Admin</Option>
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full"
                    >
                        Register
                    </Button>
                </Form.Item>
                <Form.Item className="mb-0">
                    Already have an account?
                    <Button type="link" onClick={() => navigate("/login")}>
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
