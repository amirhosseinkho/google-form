import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, message, Empty, Button, Tag, Space, Modal, Descriptions } from 'antd';
import { Eye, Trash2, FileText, Edit } from 'lucide-react';
import moment from 'moment';
import { apiGet, apiDelete } from '../api/apiUtils';

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

export default function MySubmissionsPage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        message.error('User not logged in');
        return;
      }

      const data = await apiGet(`/form-submissions/user/${userId}`);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      message.error('Error loading submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewModalVisible(true);
  };

  const handleDeleteSubmission = async (submissionId: number) => {
    try {
      await apiDelete(`/form-submissions/${submissionId}`);
      message.success('Submission deleted successfully!');
      fetchSubmissions();
    } catch (error) {
      console.error('Error deleting submission:', error);
      message.error('Failed to delete submission');
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
        <div className="text-gray-600 max-w-md truncate">{description || 'No description'}</div>
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
      render: (_: any, record: Submission) => (
        <Space>
          <Button
            type="text"
            icon={<Eye size={16} />}
            onClick={() => handleViewSubmission(record)}
            title="View Details"
          >
            View
          </Button>
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => navigate(`/submitted-forms/${record.id}/edit`)}
            title="Edit Submission"
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => handleDeleteSubmission(record.id)}
            title="Delete Submission"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
          My Submissions
        </h1>
        <p className="text-gray-600">
          View and manage your form submissions
        </p>
      </div>

      {loading ? (
        <Empty description="Loading submissions..." />
      ) : submissions.length === 0 ? (
        <Empty 
          description="No submissions found. Submit a form to see it here!" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
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
          className="bg-white rounded-2xl shadow-2xl"
        />
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
            <Descriptions title="Form Information" bordered className="mb-6">
              <Descriptions.Item label="Form Name" span={3}>
                {selectedSubmission.formName}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={3}>
                {selectedSubmission.formDescription || 'No description'}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted At">
                {moment(selectedSubmission.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedSubmission.status)}>
                  {selectedSubmission.status.replace('_', ' ')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Submission ID">
                {selectedSubmission.id}
              </Descriptions.Item>
            </Descriptions>

            {selectedSubmission.answers && selectedSubmission.answers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Answers</h3>
                <div className="space-y-3">
                  {selectedSubmission.answers.map((answer, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="font-medium text-gray-900 mb-1">
                        {answer.fieldId}
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
