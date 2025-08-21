import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Card, Spin, DatePicker, Select, Checkbox, Radio, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import moment from 'moment';
import { apiGet, apiPut } from '../api/apiUtils';

const { Option } = Select;

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  defaultValue?: any;
  placeholder?: string;
  options?: string[];
}

interface Submission {
  id: number;
  formId: number;
  formName: string;
  formDescription?: string;
  submittedAt: string;
  status: string;
  answers?: Array<{
    fieldId: string;
    value: any;
  }>;
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

export default function EditSubmissionPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [formValues, setFormValues] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!submissionId) return;
      
      try {
        setLoading(true);
        
        // Fetch submission details
        const submissionData = await apiGet(`/form-submissions/${submissionId}`);
        setSubmission(submissionData);
        
        // Fetch form details
        const formDetails = await apiGet(`/forms/${submissionData.formId}`);
        setFormData(formDetails);
        
        // Set form values from submission answers
        const values: any = {};
        
        // Create a mapping from fieldId to field for easier lookup
        const fieldMap = new Map();
        formDetails.fields?.forEach((field: any) => {
          fieldMap.set(field.id, field);
        });
        
        submissionData.answers?.forEach((answer: any) => {
          // Check if this field exists in the form
          if (fieldMap.has(answer.fieldId)) {
            const field = fieldMap.get(answer.fieldId);
            
            // Handle different field types
            let processedValue = answer.value;
            if (field.type === 'date' && answer.value) {
              processedValue = moment(answer.value);
            }
            
            values[answer.fieldId] = processedValue;
          }
        });
        
        setFormValues(values);
        
        // Set form values
        setTimeout(() => {
          form.setFieldsValue(values);
        }, 100);
        
      } catch (error) {
        console.error('Error fetching submission data:', error);
        message.error('Failed to load submission');
        navigate('/submitted-forms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId, navigate, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      if (!submission) {
        message.error('No submission data available');
        return;
      }
      
      const updatedAnswers = Object.entries(values).map(([fieldId, value]) => ({
        fieldId,
        value: (value as any) instanceof moment ? (value as any).format('YYYY-MM-DD') : value
      }));
      
      const updateData = {
        ...submission,
        answers: updatedAnswers,
        submittedAt: new Date().toISOString()
      };
      
      await apiPut(`/form-submissions/${submissionId}`, updateData);
      
      message.success('Submission updated successfully!');
      navigate('/submitted-forms');
    } catch (error) {
      console.error('Error updating submission:', error);
      message.error('Failed to update submission');
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

      case 'dropdown':
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
                <Option key={option} value={option}>
                  {option}
                </Option>
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

  if (!formData || !submission) {
    return (
      <div className="text-center">
        <p>Submission not found</p>
        <Button onClick={() => navigate('/submitted-forms')}>
          Back to Submissions
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/submitted-forms')}
          className="mb-4"
        >
          Back to Submissions
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
          Edit Submission
        </h1>
        <p className="text-gray-600 mb-6">
          {formData.name} - Submitted on {moment(submission.submittedAt).format('YYYY-MM-DD HH:mm')}
        </p>
      </div>

      <Card className="bg-white rounded-2xl shadow-2xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-2xl mx-auto"
        >
          {formData.fields?.map((field) => renderField(field))}

          <Form.Item className="mt-8">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<Save size={16} />}
                loading={submitting}
                size="large"
              >
                Update Submission
              </Button>
              <Button
                onClick={() => navigate('/submitted-forms')}
                size="large"
              >
                Cancel
              </Button>

            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 