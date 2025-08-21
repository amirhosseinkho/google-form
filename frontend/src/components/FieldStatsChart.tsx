import React, { useState, useEffect } from 'react';
import { Card, Select, Space, Empty, message, Spin } from 'antd';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { apiGet } from '../api/apiUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { Option } = Select;

interface FieldStats {
  type: 'categorical' | 'numerical';
  label: string;
  chartData: {
    labels: string[];
    values: number[];
  };
}

interface FieldStatsData {
  formId: number;
  formTitle: string;
  totalSubmissions: number;
  fieldStats: Record<string, FieldStats>;
}

interface FieldStatsChartProps {
  formId: string | number;
}

export default function FieldStatsChart({ formId }: FieldStatsChartProps) {
  const [fieldStats, setFieldStats] = useState<FieldStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<string>('');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'doughnut'>('bar');

  useEffect(() => {
    fetchFieldStats();
  }, [formId]);

  const fetchFieldStats = async () => {
    try {
      setLoading(true);
      
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        message.error('User not logged in');
        return;
      }
      
      const data = await apiGet(`/reports/form/${formId}/field-stats?userEmail=${encodeURIComponent(userEmail)}`);
      setFieldStats(data);
      // Set first field as default
      const firstField = Object.keys(data.fieldStats)[0];
      if (firstField) {
        setSelectedField(firstField);
      }
    } catch (error) {
      console.error('Error fetching field stats:', error);
      if (error.message?.includes('403')) {
        message.error('You do not have permission to view field statistics for this form');
      } else {
        message.error('Error loading field statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <div className="flex justify-center items-center h-32">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!fieldStats || Object.keys(fieldStats.fieldStats).length === 0) {
    return (
      <Card className="mb-6">
        <Empty description="No field statistics available" />
      </Card>
    );
  }

  const selectedFieldData = fieldStats.fieldStats[selectedField];
  if (!selectedFieldData) {
    return (
      <Card className="mb-6">
        <Empty description="Selected field not found" />
      </Card>
    );
  }

  const chartData = {
    labels: selectedFieldData.chartData.labels,
    datasets: [
      {
        label: selectedFieldData.label,
        data: selectedFieldData.chartData.values,
        backgroundColor: [
          '#6366f1', '#22d3ee', '#f59e42', '#f43f5e', '#10b981',
          '#eab308', '#a78bfa', '#f87171', '#34d399', '#fbbf24',
        ],
        borderColor: [
          '#4f46e5', '#06b6d4', '#d97706', '#dc2626', '#059669',
          '#ca8a04', '#7c3aed', '#ef4444', '#10b981', '#f59e0b',
        ],
        borderWidth: 1,
      },
    ],
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: selectedFieldData.label,
          },
        },
      },
    };

    switch (chartType) {
      case 'bar':
        return <Bar {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      default:
        return <Bar {...commonProps} />;
    }
  };

  return (
    <Card
      className="mb-6 shadow"
      title={
        <Space>
          <BarChart3 size={20} />
          <span>Field Statistics</span>
        </Space>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap>
          <Select
            value={selectedField}
            onChange={setSelectedField}
            placeholder="Select field"
            style={{ minWidth: 200 }}
          >
            {Object.entries(fieldStats.fieldStats).map(([fieldKey, fieldData]) => (
              <Option key={fieldKey} value={fieldKey}>
                {fieldData.label} ({fieldData.type})
              </Option>
            ))}
          </Select>
          <Select
            value={chartType}
            onChange={setChartType}
            style={{ minWidth: 120 }}
          >
            <Option value="bar">
              <Space>
                <BarChart3 size={16} />
                Bar Chart
              </Space>
            </Option>
            <Option value="pie">
              <Space>
                <PieChart size={16} />
                Pie Chart
              </Space>
            </Option>
            <Option value="doughnut">
              <Space>
                <TrendingUp size={16} />
                Doughnut Chart
              </Space>
            </Option>
          </Select>
        </Space>

        <div className="flex justify-center" style={{ maxWidth: 600, maxHeight: 400, margin: '0 auto' }}>
          {renderChart()}
        </div>

        {/* Field Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card size="small" className="text-center">
            <div className="text-lg font-semibold text-blue-600">Total Responses</div>
            <div className="text-2xl font-bold">{selectedFieldData.chartData.values.reduce((a, b) => a + b, 0)}</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-lg font-semibold text-green-600">Categories</div>
            <div className="text-2xl font-bold">{selectedFieldData.chartData.labels.length}</div>
          </Card>
          <Card size="small" className="text-center">
            <div className="text-lg font-semibold text-purple-600">Field Type</div>
            <div className="text-lg font-bold capitalize">{selectedFieldData.type}</div>
          </Card>
        </div>
      </Space>
    </Card>
  );
} 