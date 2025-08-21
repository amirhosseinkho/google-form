import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message, Empty, Spin, Tag, Space } from 'antd';
import { ArrowLeft, BarChart3, FileText, Users } from 'lucide-react';
import ChartReport from '../components/ChartReport';
import FieldStatsChart from '../components/FieldStatsChart';
import { reportsApi, FormAnalytics } from '../api/reportsApi';
import { formsApi, Form } from '../api/formsApi';

export default function ReportPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<FormAnalytics | null>(null);
  const [formData, setFormData] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [selectedField, setSelectedField] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!formId) return;
      
      try {
        setLoading(true);
        
        // Fetch form data
        try {
          const form = await formsApi.getForm(formId);
          setFormData(form);
        } catch (error) {
          console.error('Error fetching form:', error);
          // Continue without form data
        }
        
        // Get current user's email from localStorage
        const userEmail = localStorage.getItem('userEmail');
        
        if (!userEmail) {
          message.error('User not logged in');
          navigate('/login');
          return;
        }
        
        // Fetch analytics data from reports API
        try {
          const analyticsData = await reportsApi.getFormAnalytics(formId, userEmail);
          setReportData(analyticsData);
          // Set default selected field
          if (analyticsData.numericalFields && analyticsData.numericalFields.length > 0) {
            setSelectedField(analyticsData.numericalFields[0].id);
          }
        } catch (error) {
          console.error('Error fetching analytics:', error);
          if (error instanceof Error && error.message.includes('403')) {
            message.error('You do not have permission to view this report');
            navigate('/reports');
            return;
          }
          // Fallback to mock data if API fails
          const mockReport: FormAnalytics = {
            formId: parseInt(formId),
            formTitle: formData?.name || `Form ${formId}`,
            totalSubmissions: 25,
            numericalFields: [
              { id: 'submission_age', label: 'Submission Age (Days)', average: 5.2, min: 1.0, max: 10.0 },
              { id: 'day_of_week', label: 'Submissions by Day of Week', average: 3.5, min: 1.0, max: 7.0 },
            ],
            chartData: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              values: [5, 8, 12, 6, 9, 3, 7],
            },
            recentSubmissions: []
          };
          setReportData(mockReport);
          setSelectedField('submission_age');
          message.warning('Using mock data - API connection failed');
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        message.error('Error loading report');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!reportData) {
    return <Empty description="Report not found" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            icon={<ArrowLeft size={16} />} 
            onClick={() => navigate('/reports')}
            className="mr-4"
          >
            Back to Reports
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-700">
            Report: {reportData.formTitle}
          </h1>
        </div>
        <Space>
          <Button
            icon={<FileText size={16} />}
            onClick={() => navigate(`/forms/${formId}`)}
            title="View Form"
          >
            View Form
          </Button>
          <Button
            icon={<Users size={16} />}
            onClick={() => navigate(`/reports/${formId}/submissions`)}
            title="View Submissions"
          >
            Submissions
          </Button>
          <Button
            icon={<Users size={16} />}
            onClick={() => navigate(`/forms/${formId}/assign`)}
            title="Assign to Groups"
          >
            Assign
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-indigo-600 mb-2">Total Submissions</h3>
          <p className="text-3xl font-bold text-gray-800">{reportData.totalSubmissions}</p>
        </Card>
        <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50">
          <h3 className="text-lg font-semibold text-green-600 mb-2">Form Fields</h3>
          <p className="text-3xl font-bold text-gray-800">{formData?.fields?.length || 0}</p>
        </Card>
        <Card className="text-center bg-gradient-to-br from-purple-50 to-violet-50">
          <h3 className="text-lg font-semibold text-purple-600 mb-2">Created By</h3>
          <p className="text-lg font-bold text-gray-800">{formData?.createdBy || 'Unknown'}</p>
        </Card>
        <Card className="text-center bg-gradient-to-br from-orange-50 to-amber-50">
          <h3 className="text-lg font-semibold text-orange-600 mb-2">Created Date</h3>
          <p className="text-sm font-bold text-gray-800">
            {formData?.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </Card>
      </div>

      {/* Field Statistics Chart */}
      {formId && <FieldStatsChart formId={formId} />}

      {/* Chart Section */}
      {reportData.numericalFields && reportData.numericalFields.length > 0 && (
        <ChartReport
          numericalFields={reportData.numericalFields}
          chartType={chartType}
          setChartType={setChartType}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
          data={reportData.chartData}
          formId={formId}
        />
      )}

      {/* Numerical Fields Statistics */}
      {reportData.numericalFields && reportData.numericalFields.length > 0 && (
        <Card title="Field Statistics" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.numericalFields.map((field: any) => (
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">{field.label}</h4>
                <div className="space-y-1 text-sm">
                  {field.average !== undefined && (
                    <p><span className="font-medium">Average:</span> {field.average.toFixed(2)}</p>
                  )}
                  {field.min !== undefined && (
                    <p><span className="font-medium">Min:</span> {field.min.toFixed(2)}</p>
                  )}
                  {field.max !== undefined && (
                    <p><span className="font-medium">Max:</span> {field.max.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Submissions */}
      {reportData.recentSubmissions && reportData.recentSubmissions.length > 0 && (
        <Card title="Recent Submissions" className="mb-6">
          <div className="space-y-3">
            {reportData.recentSubmissions.map((submission: any) => (
              <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{submission.submittedBy}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </div>
                </div>
                <Tag color="blue">{submission.fieldCount} fields</Tag>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
