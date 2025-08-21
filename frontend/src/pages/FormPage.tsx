import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message, Empty } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { apiGet } from '../api/apiUtils';

export default function FormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        console.log('Fetching form with ID:', id);
        
        const data = await apiGet(`/forms/${id}`);
        console.log('Form data:', data);
        setForm(data);
      } catch (error) {
        console.error('Error fetching form:', error);
        if (error.message?.includes('403')) {
          message.error('You do not have permission to view this form');
        } else {
          message.error('Error loading form. Please check if backend is running.');
        }
        navigate('/forms');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id, navigate]);

  if (loading) {
    return <Empty description="Loading form..." />;
  }

  if (!form) {
    return <Empty description="Form not found" />;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button 
          icon={<ArrowLeft size={16} />} 
          onClick={() => window.history.back()}
          className="mr-4"
        >
          Back
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">{form.name}</h1>
      </div>

      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Form Details</h2>
        <div className="space-y-2">
          <p><strong>Description:</strong> {form.description}</p>
          <p><strong>Form ID:</strong> {form.id}</p>
          <p><strong>Created by:</strong> {form.createdBy}</p>
          <p><strong>Created at:</strong> {form.createdAt}</p>
          <p><strong>Last modified:</strong> {form.lastModified}</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Form Fields</h2>
        <div className="space-y-4">
          {form.fields && form.fields.length > 0 ? (
            form.fields.map((field: any, index: number) => (
              <div key={index} className="border p-4 rounded-lg">
                <p><strong>Label:</strong> {field.label}</p>
                <p><strong>Type:</strong> {field.type}</p>
                <p><strong>Required:</strong> {field.required ? 'Yes' : 'No'}</p>
                {field.placeholder && <p><strong>Placeholder:</strong> {field.placeholder}</p>}
                {field.options && field.options.length > 0 && (
                  <p><strong>Options:</strong> {field.options.join(', ')}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No fields defined for this form.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
