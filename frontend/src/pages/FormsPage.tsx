import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, message, Empty, Button, Popconfirm, Input, Space } from 'antd';
import { Plus, Users, BarChart3, Edit, Delete, Eye } from 'lucide-react';
import moment from 'moment';
import { apiGet, apiDelete } from '../api/apiUtils';

const fetchWithToken = async (url: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, { ...options, headers });
};

export default function FormsPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmTexts, setDeleteConfirmTexts] = useState<{ [key: number]: string }>({});
  const [deletingFormId, setDeletingFormId] = useState<number | null>(null);

  const fetchForms = async () => {
    try {
      setLoading(true);
      
      // Get current user's email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        navigate('/login');
        return;
      }
      
      // Fetch forms for the current user
      const data = await apiGet(`/forms?userEmail=${encodeURIComponent(userEmail)}`);
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      message.error('Error loading forms. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // Refresh forms when returning to this page
  useEffect(() => {
    const handleFocus = () => {
      fetchForms();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleDeleteForm = async (formId: number) => {
    if (deleteConfirmTexts[formId] !== 'DELETE') {
      message.error('Please type DELETE to confirm deletion');
      return;
    }

    try {
      setDeletingFormId(formId);
      await apiDelete(`/forms/${formId}`);
      message.success('Form deleted successfully!');
      setDeleteConfirmTexts(prev => ({ ...prev, [formId]: '' }));
      setDeletingFormId(null);
      fetchForms(); // Refresh the list
    } catch (error) {
      console.error('Error deleting form:', error);
      message.error('Error deleting form');
    } finally {
      setDeletingFormId(null);
    }
  };

  const handleEditForm = (formId: number) => {
    navigate(`/forms/new/${formId}`);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Button
          type="link"
          className="p-0 h-auto text-indigo-600 hover:text-indigo-800"
          onClick={() => navigate(`/forms/${record.id}`)}
        >
          {text || `Form ${record.id}`}
        </Button>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Number of Fields',
      dataIndex: 'fields',
      key: 'fields',
      render: (fields: any) => fields?.length || 0,
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: any) => {
        return date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => navigate(`/forms/${record.id}`)}
            title="View Form"
          >
            View
          </Button>
          <Button
            type="text"
            size="small"
            icon={<Edit size={14} />}
            onClick={() => handleEditForm(record.id)}
            title="Edit Form"
          >
            Edit
          </Button>
          <Button
            type="text"
            size="small"
            icon={<Users size={14} />}
            onClick={() => navigate(`/forms/${record.id}/assign`)}
            title="Assign to Groups"
          >
            Assign
          </Button>
          <Button
            type="text"
            size="small"
            icon={<BarChart3 size={14} />}
            onClick={() => navigate(`/reports/${record.id}`)}
            title="View Reports"
          >
            Reports
          </Button>
          <Popconfirm
            title={
              <div>
                <p>Are you sure you want to delete this form?</p>
                <p className="text-sm text-gray-500 mt-2">
                  Type <strong>DELETE</strong> to confirm:
                </p>
                                 <Input
                   value={deleteConfirmTexts[record.id] || ''}
                   onChange={(e) => setDeleteConfirmTexts(prev => ({ ...prev, [record.id]: e.target.value }))}
                   placeholder="Type DELETE"
                   className="mt-2"
                 />
              </div>
            }
            onConfirm={() => handleDeleteForm(record.id)}
            okText="Delete"
            cancelText="Cancel"
                         okButtonProps={{ 
               danger: true,
               disabled: deleteConfirmTexts[record.id] !== 'DELETE' || deletingFormId === record.id,
               loading: deletingFormId === record.id
             }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<Delete size={14} />}
              title="Delete Form"
              loading={deletingFormId === record.id}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-indigo-700">Forms</h1>
      <div className="flex gap-4 mb-6">
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={() => navigate('/forms/new')}
        >
          Create New Form
        </Button>
        <Button
          onClick={() => fetchForms()}
          loading={loading}
        >
          Refresh Forms
        </Button>
      </div>
      {loading ? (
        <Empty description="Loading forms..." />
      ) : forms.length === 0 ? (
        <div className="text-center py-8">
          <Empty description="No forms found. Create a new one!" />
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={() => navigate('/forms/new')}
            className="mt-4"
          >
            Create Your First Form
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={forms}
          rowKey="id"
          pagination={false}
          className="bg-white rounded-2xl shadow-2xl"
          scroll={{ x: 'max-content' }}
        />
      )}
    </div>
  );
}
