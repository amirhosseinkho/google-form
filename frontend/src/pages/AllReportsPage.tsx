import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Button, Table, message, Empty, Tag } from 'antd';
import { 
  FileText, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import moment from 'moment';
import { apiGet } from '../api/apiUtils';

interface SystemStats {
  totalForms: number;
  totalUsers: number;
  totalGroups: number;
  totalSubmissions: number;
  recentSubmissions: number;
  completedForms: number;
}

interface RecentActivity {
  id: number;
  type: 'form_created' | 'form_submitted' | 'user_joined' | 'group_created';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

export default function AllReportsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats>({
    totalForms: 0,
    totalUsers: 0,
    totalGroups: 0,
    totalSubmissions: 0,
    recentSubmissions: 0,
    completedForms: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      
      // Get current user's email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        return;
      }
      
      // Fetch user-specific statistics from reports API
      const statsData = await apiGet(`/reports/system-stats?userEmail=${encodeURIComponent(userEmail)}`);
      setStats({
        totalForms: statsData.totalForms,
        totalUsers: statsData.totalUsers,
        totalGroups: statsData.totalGroups,
        totalSubmissions: statsData.totalSubmissions,
        recentSubmissions: statsData.recentSubmissions,
        completedForms: statsData.completedForms
      });
      
      // Fetch user-specific recent activity from reports API
      const activityData = await apiGet(`/reports/recent-activity?userEmail=${encodeURIComponent(userEmail)}`);
      setRecentActivity(activityData);
      
    } catch (error) {
      console.error('Error fetching user stats:', error);
      message.error('Error loading user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'form_created':
        return <FileText size={16} className="text-blue-500" />;
      case 'form_submitted':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'user_joined':
        return <Users size={16} className="text-purple-500" />;
      case 'group_created':
        return <Users size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getActivityTag = (type: string) => {
    switch (type) {
      case 'form_created':
        return <Tag color="blue">Form Created</Tag>;
      case 'form_submitted':
        return <Tag color="green">Submitted</Tag>;
      case 'user_joined':
        return <Tag color="purple">User Joined</Tag>;
      case 'group_created':
        return <Tag color="orange">Group Created</Tag>;
      default:
        return <Tag color="default">Activity</Tag>;
    }
  };

  const activityColumns = [
    {
      title: 'Activity',
      key: 'activity',
      render: (_: any, record: RecentActivity) => (
        <div className="flex items-center gap-3">
          {getActivityIcon(record.type)}
          <div>
            <div className="font-medium">{record.title}</div>
            <div className="text-sm text-gray-600">{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: string) => (
        <Tag color="blue">{user}</Tag>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (_: any, record: RecentActivity) => getActivityTag(record.type),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => (
        <div className="text-sm text-gray-500">
          {moment(timestamp).fromNow()}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>Loading system statistics...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-2">
          My Reports Dashboard
        </h1>
        <p className="text-gray-600">
          Overview of your forms, groups, and activity
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <Statistic
              title="My Forms"
              value={stats.totalForms}
              prefix={<FileText className="text-blue-500" />}
              valueStyle={{ color: '#1e40af' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50">
            <Statistic
              title="My Groups"
              value={stats.totalGroups}
              prefix={<Users className="text-green-500" />}
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-gradient-to-br from-purple-50 to-violet-50">
            <Statistic
              title="My Submissions"
              value={stats.totalSubmissions}
              prefix={<CheckCircle className="text-purple-500" />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center bg-gradient-to-br from-orange-50 to-amber-50">
            <Statistic
              title="Completed Forms"
              value={stats.completedForms}
              prefix={<CheckCircle className="text-orange-500" />}
              valueStyle={{ color: '#ea580c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" className="bg-white rounded-2xl shadow-2xl">
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="primary"
                icon={<FileText size={16} />}
                onClick={() => navigate('/forms')}
                size="large"
                block
              >
                View All Forms
              </Button>
              <Button
                icon={<BarChart3 size={16} />}
                onClick={() => navigate('/reports/forms')}
                size="large"
                block
              >
                Form Reports
              </Button>
              <Button
                icon={<Users size={16} />}
                onClick={() => navigate('/groups')}
                size="large"
                block
              >
                Manage Groups
              </Button>
              <Button
                icon={<TrendingUp size={16} />}
                onClick={() => navigate('/submitted-forms')}
                size="large"
                block
              >
                View Submissions
              </Button>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" className="bg-white rounded-2xl shadow-2xl">
            {recentActivity.length === 0 ? (
              <Empty description="No recent activity" />
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <div>
                        <div className="text-sm font-medium">{activity.title}</div>
                        <div className="text-xs text-gray-500">{activity.description}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {moment(activity.timestamp).fromNow()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Table */}
      <Card title="Detailed Activity Log" className="bg-white rounded-2xl shadow-2xl">
        <Table
          columns={activityColumns}
          dataSource={recentActivity}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
} 