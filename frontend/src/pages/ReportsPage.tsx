import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, message, Empty, Tag, Space } from 'antd';
import { BarChart3, Eye, FileText, Users } from 'lucide-react';
import moment from 'moment';
import { reportsApi, FormWithStats } from '../api/reportsApi';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      const data = await reportsApi.getFormsWithStats(userEmail);
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      if (error instanceof Error) {
        message.error(`Error loading forms: ${error.message}`);
      } else {
        message.error('Error loading forms');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleViewReport = (formId: number) => {
    navigate(`/reports/${formId}`);
  };

  const handleViewForm = (formId: number) => {
    navigate(`/forms/${formId}`);
  };

  const handleViewSubmissions = (formId: number) => {
    navigate(`/reports/${formId}/submissions`);
  };

  const columns = [
    {
      title: 'Form Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: FormWithStats) => (
        <div className="font-medium text-gray-900">{name || `Form ${record.id}`}</div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <div className="text-gray-600 max-w-md truncate">{description}</div>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy: string) => (
        <Tag color="blue">{createdBy || 'Unknown'}</Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div className="text-gray-500">
          {date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A'}
        </div>
      ),
    },
    {
      title: 'Submissions',
      dataIndex: 'submissionCount',
      key: 'submissionCount',
      render: (count: number) => (
        <Tag color={count && count > 0 ? 'green' : 'orange'}>
          {count || 0} submissions
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FormWithStats) => (
        <Space>
          <Button
            type="primary"
            icon={<BarChart3 size={16} />}
            onClick={() => handleViewReport(record.id)}
            size="small"
          >
            View Report
          </Button>
          <Button
            type="text"
            icon={<Users size={16} />}
            onClick={() => handleViewSubmissions(record.id)}
            size="small"
            title="View Submissions"
          >
            Submissions
          </Button>
          <Button
            type="text"
            icon={<Eye size={16} />}
            onClick={() => handleViewForm(record.id)}
            size="small"
            title="View Form"
          >
            Form
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
          Form Reports
        </h1>
        <p className="text-gray-600">
          View detailed reports and analytics for all forms
        </p>
      </div>

      <Card className="bg-white rounded-2xl shadow-2xl">
        {loading ? (
          <Empty description="Loading forms..." />
        ) : forms.length === 0 ? (
          <Empty 
            description="No forms found to generate reports" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={forms}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} forms`,
            }}
            className="bg-white"
          />
        )}
      </Card>
    </div>
  );
} 