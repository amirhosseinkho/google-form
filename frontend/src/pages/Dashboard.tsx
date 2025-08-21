import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin, message } from "antd";
import { FileText, Users, CheckCircle, Clock } from "lucide-react";
import { reportsApi } from "../api/reportsApi";

interface DashboardStats {
    totalForms: number;
    totalUsers: number;
    totalGroups: number;
    totalSubmissions: number;
    recentSubmissions: number;
    completedForms: number;
}

interface RecentActivity {
    id: number;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    user: string;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalForms: 0,
        totalUsers: 0,
        totalGroups: 0,
        totalSubmissions: 0,
        recentSubmissions: 0,
        completedForms: 0
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Get current user's email from localStorage
            const userEmail = localStorage.getItem('userEmail');
            
            if (!userEmail) {
                message.error('User not logged in');
                return;
            }
            
            // Fetch user-specific statistics
            try {
                const statsData = await reportsApi.getSystemStats(userEmail);
                setStats({
                    totalForms: statsData.totalForms,
                    totalUsers: statsData.totalUsers,
                    totalGroups: statsData.totalGroups,
                    totalSubmissions: statsData.totalSubmissions,
                    recentSubmissions: statsData.recentSubmissions,
                    completedForms: statsData.completedForms
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                message.error('Error loading statistics');
            }
            
            // Fetch user-specific recent activity
            try {
                const activityData = await reportsApi.getRecentActivity(userEmail);
                setRecentActivity(activityData);
            } catch (error) {
                console.error('Error fetching activity:', error);
                message.error('Error loading recent activity');
            }
            
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            message.error('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-indigo-700">Dashboard</h1>
            <div className="text-2xl font-semibold mb-4">
                Welcome, {localStorage.getItem("userName") || "User"}!
            </div>
            <div className="text-gray-600 mb-8">
                Overview of your personal statistics and recent activity.
            </div>
            
            {/* Quick Stats Cards */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
                        <Statistic
                            title="My Groups"
                            value={stats.totalGroups}
                            prefix={<Users className="text-blue-500" />}
                            valueStyle={{ color: '#1e40af' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50">
                        <Statistic
                            title="My Forms"
                            value={stats.totalForms}
                            prefix={<FileText className="text-green-500" />}
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
                            title="Recent Submissions"
                            value={stats.recentSubmissions}
                            prefix={<Clock className="text-orange-500" />}
                            valueStyle={{ color: '#ea580c' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Additional Stats */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12}>
                    <Card className="text-center bg-gradient-to-br from-teal-50 to-cyan-50">
                        <Statistic
                            title="Completed Forms"
                            value={stats.completedForms}
                            prefix={<CheckCircle className="text-teal-500" />}
                            valueStyle={{ color: '#0d9488' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card className="text-center bg-gradient-to-br from-pink-50 to-rose-50">
                        <Statistic
                            title="Active Forms"
                            value={stats.totalForms - stats.completedForms}
                            prefix={<FileText className="text-pink-500" />}
                            valueStyle={{ color: '#be185d' }}
                        />
                    </Card>
                </Col>
            </Row>
            
            {/* Recent Activity */}
            <Card title="Recent Activity" className="bg-white rounded-2xl shadow-2xl">
                {recentActivity.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">
                        No recent activity to display
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentActivity.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                    {activity.type === 'form_created' && <FileText className="text-blue-500" size={20} />}
                                    {activity.type === 'form_submitted' && <CheckCircle className="text-green-500" size={20} />}
                                    {activity.type === 'user_joined' && <Users className="text-purple-500" size={20} />}
                                    {activity.type === 'group_created' && <Users className="text-orange-500" size={20} />}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{activity.title}</div>
                                    <div className="text-sm text-gray-600">{activity.description}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        by {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
