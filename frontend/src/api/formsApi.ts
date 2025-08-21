const API_BASE_URL = 'http://localhost:8081/api';

// Helper function to get JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export interface Form {
  id: number;
  name: string;
  description: string;
  fields: FormField[];
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

export const formsApi = {
  // Get a specific form by ID
  async getForm(formId: string | number): Promise<Form> {
    const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch form: ${response.status}`);
    }
    
    return response.json();
  },

  // Get all forms
  async getForms(): Promise<Form[]> {
    const response = await fetch(`${API_BASE_URL}/forms`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch forms: ${response.status}`);
    }
    
    return response.json();
  },

  // Create a new form
  async createForm(formData: Partial<Form>): Promise<Form> {
    const response = await fetch(`${API_BASE_URL}/forms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create form: ${response.status}`);
    }
    
    return response.json();
  },

  // Update a form
  async updateForm(formId: string | number, formData: Partial<Form>): Promise<Form> {
    const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update form: ${response.status}`);
    }
    
    return response.json();
  },

  // Delete a form
  async deleteForm(formId: string | number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete form: ${response.status}`);
    }
  }
};

export const userManagementApi = {
  async forgotPassword(email: string): Promise<{ message: string; newPassword?: string }> {
    const response = await fetch(`${API_BASE_URL}/user-managements/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },
}; 