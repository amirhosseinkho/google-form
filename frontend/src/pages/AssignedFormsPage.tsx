import React, { useEffect, useState } from 'react';
import { Card, Table, Button, message, Empty, Tag, Space } from 'antd';
import { FileText, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api/apiUtils';

interface AssignedForm {
  formId: number;
  formName: string;
  formDescription: string;
  assignedAt: string;
  groupName: string;
  isSubmitted: boolean;
}

export default function AssignedFormsPage() {
  const navigate = useNavigate();
  const [assignedForms, setAssignedForms] = useState<AssignedForm[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedForms = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        message.error('User not logged in');
        return;
      }

      const data = await apiGet(`/form-assignments/user/${userId}/assigned-forms`);
      setAssignedForms(data);
    } catch (error) {
      console.error('Error fetching assigned forms:', error);
      message.error('Error loading assigned forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedForms();
  }, []);

  const handleFillForm = (formId: number) => {
    navigate(`/forms/${formId}/fill`);
  };

  const columns = [
    {
      title: 'Form Name',
      dataIndex: 'formName',
      key: 'formName',
      render: (name: string) => (
        <div className="font-medium text-gray-900">{name}</div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'formDescription',
      key: 'formDescription',
      render: (description: string) => (
        <div className="text-gray-600 max-w-md truncate">{description}</div>
      ),
    },
    {
      title: 'Assigned Group',
      dataIndex: 'groupName',
      key: 'groupName',
      render: (groupName: string) => (
        <Tag color="blue">{groupName}</Tag>
      ),
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date: string) => (
        <div className="text-gray-500">
          {new Date(date).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: AssignedForm) => (
        <div>
          {record.isSubmitted ? (
            <Tag color="green" icon={<CheckCircle size={12} />}>
              Completed
            </Tag>
          ) : (
            <Tag color="orange" icon={<Clock size={12} />}>
              Pending
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AssignedForm) => (
        <Space>
          <Button
            type="primary"
            icon={<FileText size={16} />}
            onClick={() => handleFillForm(record.formId)}
            disabled={record.isSubmitted}
          >
            {record.isSubmitted ? 'View' : 'Fill Form'}
          </Button>
          <Button
            type="text"
            icon={<BarChart3 size={16} />}
            onClick={() => navigate(`/reports/${record.formId}`)}
            title="View Reports"
          >
            Reports
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
          My Assigned Forms
        </h1>
        <p className="text-gray-600">
          Forms assigned to you based on your group memberships
        </p>
      </div>

      <Card className="bg-white rounded-2xl shadow-2xl">
        {loading ? (
          <Empty description="Loading assigned forms..." />
        ) : assignedForms.length === 0 ? (
          <Empty 
            description="No forms assigned to you yet" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={assignedForms}
            rowKey="formId"
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