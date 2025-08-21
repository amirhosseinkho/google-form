const API_BASE_URL = 'http://localhost:8081/api';

// Helper function to get JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export interface FormAnalytics {
  formId: number;
  formTitle: string;
  totalSubmissions: number;
  numericalFields: NumericalField[];
  chartData: ChartData;
  recentSubmissions: RecentSubmission[];
}

export interface NumericalField {
  id: string;
  label: string;
  average?: number;
  min?: number;
  max?: number;
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface RecentSubmission {
  id: number;
  submittedBy: string;
  submittedAt: string;
  fieldCount: number;
}

export interface FormWithStats {
  id: number;
  name: string;
  description: string;
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
  submissionCount: number;
  lastSubmissionDate?: string;
}

export const reportsApi = {
  // Get form analytics for a specific form
  async getFormAnalytics(formId: string | number, userEmail?: string): Promise<FormAnalytics> {
    const url = userEmail 
      ? `${API_BASE_URL}/reports/form/${formId}/analytics?userEmail=${encodeURIComponent(userEmail)}`
      : `${API_BASE_URL}/reports/form/${formId}/analytics`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch form analytics: ${response.status}`);
    }
    
    return response.json();
  },

  // Get all forms with statistics
  async getFormsWithStats(userEmail?: string): Promise<FormWithStats[]> {
    const url = userEmail 
      ? `${API_BASE_URL}/reports/forms-with-stats?userEmail=${encodeURIComponent(userEmail)}`
      : `${API_BASE_URL}/reports/forms-with-stats`;
    
    console.log('DEBUG: Fetching forms with stats from:', url);
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    console.log('DEBUG: Response status:', response.status);
    console.log('DEBUG: Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DEBUG: Error response:', errorText);
      throw new Error(`Failed to fetch forms with stats: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('DEBUG: Received data:', data);
    return data;
  },

  // Get system statistics
  async getSystemStats(userEmail?: string) {
    const url = userEmail 
      ? `${API_BASE_URL}/reports/system-stats?userEmail=${encodeURIComponent(userEmail)}`
      : `${API_BASE_URL}/reports/system-stats`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch system stats: ${response.status}`);
    }
    
    return response.json();
  },

  // Get recent activity
  async getRecentActivity(userEmail?: string) {
    const url = userEmail 
      ? `${API_BASE_URL}/reports/recent-activity?userEmail=${encodeURIComponent(userEmail)}`
      : `${API_BASE_URL}/reports/recent-activity`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recent activity: ${response.status}`);
    }
    
    return response.json();
  },

  // Get total submissions count
  async getSubmissionsCount(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/reports/submissions-count`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch submissions count: ${response.status}`);
    }
    
    return response.json();
  }
}; 