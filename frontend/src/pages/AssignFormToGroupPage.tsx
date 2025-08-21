import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Select, Button, message, Table, Space, Popconfirm } from 'antd';
import { ArrowLeft, Plus, Delete } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../api/apiUtils';

interface Form {
  id: number;
  name: string;
  description: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
}

interface FormAssignment {
  id: number;
  formId: number;
  formName: string;
  groupId: number;
  groupName: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
}

export default function AssignFormToGroupPage() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<FormAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [formInstance] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch form details
      const formData = await apiGet(`/forms/${formId}`);
      setForm(formData);

      // Fetch all groups
      const groupsData = await apiGet('/groups');
      setGroups(groupsData);

      // Fetch current assignments
      const assignmentsData = await apiGet(`/form-assignments/form/${formId}`);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message?.includes('404')) {
        message.error('Form not found');
        navigate('/forms');
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

  const handleAssignForm = async (values: { groupId: number }) => {
    try {
      await apiPost('/form-assignments', {
        formId: parseInt(formId!),
        groupId: values.groupId,
        assignedBy: localStorage.getItem('username') || 'unknown'
      });

      message.success('Form assigned successfully!');
      formInstance.resetFields();
      fetchData(); // Refresh assignments
    } catch (error) {
      console.error('Error assigning form:', error);
      message.error('Error assigning form');
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      await apiDelete(`/form-assignments/${assignmentId}`);
      message.success('Assignment removed successfully!');
      fetchData(); // Refresh assignments
    } catch (error) {
      console.error('Error removing assignment:', error);
      message.error('Error removing assignment');
    }
  };

  const assignmentColumns = [
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: 'Assigned By',
      dataIndex: 'assignedBy',
      key: 'assignedBy',
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FormAssignment) => (
        <Popconfirm
          title="Are you sure you want to remove this assignment?"
          onConfirm={() => handleRemoveAssignment(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<Delete size={16} />}
            title="Remove Assignment"
          />
        </Popconfirm>
      ),
    },
  ];

  // Filter out groups that are already assigned
  const availableGroups = groups.filter(group => 
    !assignments.some(assignment => assignment.groupId === group.id)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>Loading...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center">
        <p>Form not found</p>
        <Button onClick={() => navigate('/forms')}>
          Back to Forms
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/forms')}
          className="mb-4"
        >
          Back to Forms
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
          Assign Form to Groups
        </h1>
        <p className="text-gray-600 mb-2">
          Form: <strong>{form.name}</strong>
        </p>
        {form.description && (
          <p className="text-gray-600">{form.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assign Form Form */}
        <Card title="Assign to New Group" className="bg-white rounded-2xl shadow-2xl">
          <Form
            form={formInstance}
            layout="vertical"
            onFinish={handleAssignForm}
          >
            <Form.Item
              name="groupId"
              label="Select Group"
              rules={[{ required: true, message: 'Please select a group!' }]}
            >
              <Select placeholder="Select a group...">
                {availableGroups.map(group => (
                  <Select.Option key={group.id} value={group.id}>
                    {group.name} ({group.memberCount} members)
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<Plus size={16} />}
                disabled={availableGroups.length === 0}
              >
                Assign Form
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Current Assignments */}
        <Card title="Current Assignments" className="bg-white rounded-2xl shadow-2xl">
          {assignments.length === 0 ? (
            <div>No groups assigned to this form yet.</div>
          ) : (
            <Table
              columns={assignmentColumns}
              dataSource={assignments}
              rowKey="id"
              pagination={false}
              size="small"
            />
          )}
        </Card>
      </div>
    </div>
  );
} 