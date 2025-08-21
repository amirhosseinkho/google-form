import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, message, Empty, Tag, Space, Modal, Descriptions, Popconfirm } from 'antd';
import { ArrowLeft, Eye, Trash2, FileText } from 'lucide-react';
import moment from 'moment';
import { apiGet, apiDelete } from '../api/apiUtils';

interface FormSubmission {
  id: number;
  formId: number;
  formName: string;
  userId: number | null;
  userName: string | null;
  submittedBy: string;
  submittedAt: string;
  status: string;
  answers: Array<{
    fieldId: string;
    value: any;
  }> | null;
}

interface Form {
  id: number;
  name: string;
  description: string;
  fields: Array<{
    id: string;
    type: string;
    label: string;
    required: boolean;
  }> | null;
  createdBy: string;
  createdAt: string;
}

export default function FormSubmissionsPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [deletingSubmissionId, setDeletingSubmissionId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get current user's email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        navigate('/login');
        return;
      }

      // Fetch form data
      const formData = await apiGet(`/forms/${formId}`);
      setForm(formData);
      
      // Check if user has access to this form
      if (formData.createdBy !== userEmail) {
        message.error('You do not have permission to view submissions for this form');
        navigate('/reports');
        return;
      }

      // Fetch submissions
      const submissionsData = await apiGet(`/form-submissions/form/${formId}?userEmail=${encodeURIComponent(userEmail)}`);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message?.includes('403')) {
        message.error('You do not have permission to view submissions for this form');
        navigate('/reports');
      } else {
        message.error('Error loading data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      fetchData();
    }
  }, [formId]);

  const handleViewSubmission = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setViewModalVisible(true);
  };

  const handleDeleteSubmission = async (submissionId: number) => {
    try {
      setDeletingSubmissionId(submissionId);
      
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        return;
      }
      
      await apiDelete(`/form-submissions/${submissionId}?userEmail=${encodeURIComponent(userEmail)}`);
      message.success('Submission deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting submission:', error);
      if (error.message?.includes('403')) {
        message.error('You do not have permission to delete this submission');
      } else {
        message.error('Failed to delete submission');
      }
    } finally {
      setDeletingSubmissionId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'green';
      case 'PENDING':
        return 'orange';
      case 'REMOVED_BY_OWNER':
        return 'red';
      default:
        return 'default';
    }
  };

  const getFieldLabel = (fieldId: string) => {
    if (!form?.fields) return fieldId;
    const field = form.fields.find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Submitted By',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      render: (submittedBy: string) => (
        <div className="font-medium text-gray-900">{submittedBy || 'Unknown User'}</div>
      ),
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: any, record: FormSubmission) => (
        <Space>
          <Button
            type="text"
            icon={<Eye size={16} />}
            onClick={() => handleViewSubmission(record)}
            title="View Details"
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this submission?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteSubmission(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              loading={deletingSubmissionId === record.id}
              title="Delete Submission"
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            icon={<ArrowLeft size={16} />} 
            onClick={() => navigate('/reports/forms')}
            className="mr-4"
          >
            Back to Reports
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">
              Form Submissions
            </h1>
            <p className="text-gray-600">
              {form?.name ? `Submissions for: ${form.name}` : 'Loading form...'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <Empty description="Loading submissions..." />
      ) : submissions.length === 0 ? (
        <Empty 
          description="No submissions found for this form" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl">
          <Table
            columns={columns}
            dataSource={submissions}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} submissions`,
            }}
            className="bg-white"
          />
        </div>
      )}

      {/* View Submission Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <span>Submission Details</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedSubmission(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setSelectedSubmission(null);
          }}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedSubmission && (
          <div>
            <Descriptions title="Submission Information" bordered className="mb-6">
              <Descriptions.Item label="Submission ID" span={3}>
                {selectedSubmission.id}
              </Descriptions.Item>
              <Descriptions.Item label="Form Name" span={3}>
                {selectedSubmission.formName}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted By">
                {selectedSubmission.submittedBy || 'Unknown User'}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted At">
                {moment(selectedSubmission.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedSubmission.status)}>
                  {selectedSubmission.status.replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedSubmission.answers && selectedSubmission.answers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Form Answers</h3>
                <div className="space-y-3">
                  {selectedSubmission.answers.map((answer, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="font-medium text-gray-800 mb-1">
                        {getFieldLabel(answer.fieldId)}
                      </div>
                      <div className="text-gray-600">
                        {answer.value !== null && answer.value !== undefined 
                          ? String(answer.value) 
                          : 'No answer provided'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
} 