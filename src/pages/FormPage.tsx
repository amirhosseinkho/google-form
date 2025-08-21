// src/pages/FormPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockApi } from "../api/mockApi";
import { Button, Input, Select, Checkbox, Radio, DatePicker, message, Form, Card, Spin } from "antd";
import dayjs from "dayjs";

interface FieldSchema {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
    maxLength?: number;
}

export default function FormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formSchema, setFormSchema] = useState<FieldSchema[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        setLoading(true);
        mockApi.getFormById(id!)
            .then(setFormSchema)
            .catch(() => message.error("Failed to fetch form schema"))
            .finally(() => setLoading(false));
    }, [id]);

    const onFinish = (values: Record<string, any>) => {
        setSubmitting(true);
        mockApi.submitForm(id!, values)
            .then(() => {
                message.success("Submission saved");
                navigate("/submitted-forms");
            })
            .catch(() => message.error("Submission failed"))
            .finally(() => setSubmitting(false));
    };


    const validateNumber = (min?: number, max?: number) => ({
        validator(_: any, value: any) {
            if (value === undefined || value === null || value === '') return Promise.resolve();
            if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
                return Promise.reject(new Error(`Value must be between ${min} and ${max}`));
            }
            return Promise.resolve();
        }
    });

    const validateDate = (min?: string, max?: string) => ({
        validator(_: any, value: any) {
            if (!value) return Promise.resolve();
            const date = dayjs(value);
            if ((min && date.isBefore(min)) || (max && date.isAfter(max))) {
                return Promise.reject(new Error(`Date must be between ${min} and ${max}`));
            }
            return Promise.resolve();
        }
    });

    const renderField = (field: FieldSchema) => {
        switch (field.type) {
            case "text":
                return <Input maxLength={field.maxLength} />;
            case "textarea":
                return <Input.TextArea rows={4} maxLength={field.maxLength} />;
            case "number":
                return <Input type="number" />;
            case "date":
                return <DatePicker style={{ width: '100%' }} />;
            case "dropdown":
                return (
                    <Select>
                        {field.options?.map(opt => (
                            <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                        ))}
                    </Select>
                );
            case "checkbox":
                return <Checkbox.Group options={field.options} />;
            case "radio":
                return (
                    <Radio.Group>
                        {field.options?.map(opt => <Radio key={opt} value={opt}>{opt}</Radio>)}
                    </Radio.Group>
                );
            default:
                return null;
        }
    };

    const generateRules = (field: FieldSchema) => {
        const rules = [];
        if (field.required) {
            rules.push({ required: true, message: "This field is required" });
        }
        if (field.type === "number") {
            rules.push(validateNumber(field.min, field.max));
        }
        if (field.type === "date") {
            rules.push(validateDate("1900-01-01", "2030-12-31")); // Customize as per requirement
        }
        return rules;
    };

    if (loading) return <Spin size="large" className="w-full flex justify-center" />;

    return (
        <Card title={`Form ${id}`}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                {formSchema.map(field => (
                    <Form.Item
                        key={field.id}
                        name={field.id}
                        label={<span>{field.label}{field.required && <span className="text-red-500">*</span>}</span>}
                        rules={generateRules(field)}
                    >
                        {renderField(field)}
                    </Form.Item>
                ))}

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}
