import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, message, Spin, Select, Checkbox, Radio, DatePicker, Space } from 'antd';
import { ArrowLeft, Save, Send } from 'lucide-react';
import moment from 'moment';
import { apiGet, apiPost } from '../api/apiUtils';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  defaultValue?: any;
  placeholder?: string;
  options?: string[];
}

interface FormData {
  id: number;
  name: string;
  description: string;
  fields: FormField[];
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
}

export default function FillFormPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formInstance] = Form.useForm();

  const fetchForm = async () => {
    try {
      setLoading(true);
      const data = await apiGet(`/forms/${formId}`);
      setForm(data);
      
      // Set default values
      const defaultValues: any = {};
      data.fields?.forEach((field: FormField) => {
        if (field.defaultValue !== undefined && field.defaultValue !== null) {
          defaultValues[field.id] = field.defaultValue;
        }
      });
      formInstance.setFieldsValue(defaultValues);
    } catch (error) {
      console.error('Error fetching form:', error);
      message.error('Error loading form');
      navigate('/assigned-forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      
      // Debug: Log localStorage values
      console.log('DEBUG: localStorage values:');
      console.log('userId:', userId);
      console.log('userName:', userName);
      console.log('userEmail:', userEmail);
      
      const submittedBy = userName || userEmail || 'Unknown User';
      console.log('DEBUG: Final submittedBy:', submittedBy);
      
      const submissionData = {
        formId: parseInt(formId!),
        userId: userId ? parseInt(userId) : null,
        submittedBy: submittedBy,
        submittedAt: new Date().toISOString(),
        answers: Object.entries(values).map(([fieldId, value]) => ({
          fieldId,
          value: (value as any) instanceof moment ? (value as any).format('YYYY-MM-DD') : value
        }))
      };
      
      console.log('DEBUG: Submission data:', submissionData);

      await apiPost('/form-submissions', submissionData);
      
      message.success('Form submitted successfully!');
      navigate('/submitted-forms');
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const rules = [
      {
        required: field.required,
        message: `${field.label} is required!`,
      },
    ];

    switch (field.type) {
      case 'text':
        return (
          <Form.Item
            key={field.id}
            name={field.id}
            label={field.label}
            rules={rules}
          >
            <Input placeholder={field.placeholder} />
          </Form.Item>
        );

      case 'textarea':
        return (
          <Form.Item
            key={field.id}
            name={field.id}
            label={field.label}
            rules={rules}
          >
            <Input.TextArea rows={4} placeholder={field.placeholder} />
          </Form.Item>
        );

      case 'email':
        return (
          <Form.Item
            key={field.id}
            name={field.id}
            label={field.label}
            rules={[
              ...rules,
              {
                type: 'email',
                message: 'Please enter a valid email!',
              },
            ]}
          >
            <Input placeholder={field.placeholder} />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item
            key={field.id}
            name={field.id}
            label={field.label}
            rules={rules}
          >
            <Input type="number" placeholder={field.placeholder} />
          </Form.Item>
        );

      case 'select':
        return (
          <Form.Item
            key={field.id}
            name={field.id}
            label={field.label}
            rules={rules}
          >
            <Select placeholder={field.placeholder}>
              {field.options?.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'radio':
        return (
          <Form.Item
            key={field.id}
            name={field.id}
            label={field.label}
            rules={rules}
          >
            <Radio.Group>
              {field.options?.map((option) => (
                <Radio key={option} value={option}>
                  {option}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );

      case 'checkbox':
        return (
          <Form.Item
            key={field.id}
            name={field.id}
            label={field.label}
            valuePropName="checked"
            rules={rules}
          >
            <Checkbox>{field.label}</Checkbox>
          </Form.Item>
        );

      case 'date':
        return (
          <Form.Item
            key={field.id}
            name={field.id}
            label={field.label}
            rules={rules}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        );

      default:
        return (
          <Form.Item
            key={field.id}
            name={field.id}
            label={field.label}
            rules={rules}
          >
            <Input placeholder={field.placeholder} />
          </Form.Item>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center">
        <p>Form not found</p>
        <Button onClick={() => navigate('/assigned-forms')}>
          Back to Assigned Forms
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/assigned-forms')}
          className="mb-4"
        >
          Back to Assigned Forms
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
          {form.name}
        </h1>
        {form.description && (
          <p className="text-gray-600 mb-6">{form.description}</p>
        )}
      </div>

      <Card className="bg-white rounded-2xl shadow-2xl">
        <Form
          form={formInstance}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-2xl mx-auto"
        >
          {form.fields?.map((field) => renderField(field))}

          <Form.Item className="mt-8">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<Send size={16} />}
                loading={submitting}
                size="large"
              >
                Submit Form
              </Button>
              <Button
                icon={<Save size={16} />}
                onClick={() => {
                  // TODO: Implement save draft functionality
                  message.info('Draft saved');
                }}
                size="large"
              >
                Save Draft
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 