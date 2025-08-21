import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { FileText, Users, List, User, LogOut, Home, ClipboardList, Settings, BarChart3 } from 'lucide-react';

const { Sider, Content } = Layout;

const fetchWithToken = async (url: string, options: any = {headers:{}}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  return fetch(url, { ...options, headers });
};

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = async () => {
    try {
      // For now, just check if token exists
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
    } catch (err) {
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Determine selected menu based on current path
  const getSelectedMenu = () => {
    if (location.pathname === '/') return 'dashboard';
    if (location.pathname.startsWith('/forms') && !location.pathname.includes('/assign') && !location.pathname.includes('/fill')) return 'forms';
    if (location.pathname.startsWith('/assigned-forms')) return 'assigned-forms';
    if (location.pathname.startsWith('/submitted-forms')) return 'submissions';
    if (location.pathname.startsWith('/reports')) return 'reports';
    if (location.pathname.startsWith('/groups')) return 'groups';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <Home size={18} className="text-indigo-600" />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: 'forms',
      icon: <FileText size={18} className="text-indigo-600" />,
      label: 'Forms',
      onClick: () => navigate('/forms'),
    },
    {
      key: 'assigned-forms',
      icon: <ClipboardList size={18} className="text-indigo-600" />,
      label: 'My Forms',
      onClick: () => navigate('/assigned-forms'),
    },
    {
      key: 'submissions',
      icon: <List size={18} className="text-indigo-600" />,
      label: 'Submissions',
      onClick: () => navigate('/submitted-forms'),
    },
    {
      key: 'reports',
      icon: <BarChart3 size={18} className="text-indigo-600" />,
      label: 'Reports',
      onClick: () => navigate('/reports'),
    },
    {
      key: 'groups',
      icon: <Users size={18} className="text-indigo-600" />,
      label: 'Groups',
      onClick: () => navigate('/groups'),
    },
    {
      key: 'profile',
      icon: <User size={18} className="text-indigo-600" />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      icon: <LogOut size={18} className="text-indigo-600" />,
      label: 'Logout',
      onClick: () => {
        localStorage.removeItem('token');
        navigate('/login');
      },
    },
  ];

  if (isAuthenticated === null) return <div className="text-white">Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <Layout className="min-h-screen">
      <Sider width={220} className="bg-white shadow-2xl hidden md:block">
        <div
          className="text-xl font-bold text-center py-6 cursor-pointer text-indigo-600"
          onClick={() => navigate('/')}
        >
          Dashboard
        </div>
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Welcome, {localStorage.getItem('userName') || 'User'}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedMenu()]}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: item.onClick,
          }))}
          className="bg-white"
        />
      </Sider>
      <Layout>
        <Content className="p-4 sm:p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </Content>
      </Layout>
      {/* Bottom Navigation for Mobile View */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around p-2 border-t">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`flex flex-col items-center cursor-pointer ${
              getSelectedMenu() === item.key ? "text-indigo-500" : "text-gray-500"
            }`}
            onClick={item.onClick}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}