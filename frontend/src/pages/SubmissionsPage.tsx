import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, message, Empty } from 'antd';
import { ArrowLeft } from 'lucide-react';
import moment from 'moment';

export default function SubmissionsPage() {
  const { formId } = useParams();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        // Mock data for now
        const mockSubmissions = [
          {
            id: 1,
            submittedBy: 'John Doe',
            submittedAt: new Date(),
            status: 'Submitted',
            data: { name: 'John Doe', email: 'john@example.com', age: 25 },
          },
          {
            id: 2,
            submittedBy: 'Jane Smith',
            submittedAt: new Date(Date.now() - 86400000),
            status: 'Submitted',
            data: { name: 'Jane Smith', email: 'jane@example.com', age: 30 },
          },
          {
            id: 3,
            submittedBy: 'Bob Johnson',
            submittedAt: new Date(Date.now() - 172800000),
            status: 'Submitted',
            data: { name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
          },
        ];
        
        setSubmissions(mockSubmissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        message.error('Error loading submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [formId]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Submitted By',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: any) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Button 
          type="link" 
          onClick={() => console.log('View submission:', record.id)}
        >
          View Details
        </Button>
      ),
    },
  ];

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
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">
          Submissions for Form {formId}
        </h1>
      </div>

      {loading ? (
        <Empty description="Loading submissions..." />
      ) : submissions.length === 0 ? (
        <Empty description="No submissions found for this form." />
      ) : (
        <Table
          columns={columns}
          dataSource={submissions}
          rowKey="id"
          pagination={false}
          className="bg-white rounded-2xl shadow-2xl"
        />
      )}
    </div>
  );
}
