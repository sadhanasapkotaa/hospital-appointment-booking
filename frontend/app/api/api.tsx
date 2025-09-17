// API Configuration and Services
const API_BASE_URL = 'http://127.0.0.1:8000/api/';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'patient' | 'doctor' | 'staff' | 'admin';
  phone?: string;
  is_active: boolean;
  date_joined: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  user_type?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  user_type: 'patient' | 'doctor' | 'staff';
  phone?: string;
}

export interface Appointment {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  doctor_name: string;
  doctor_specialization: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  symptoms: string;
  diagnosis?: string;
  notes?: string;
  is_first_visit: boolean;
  created_at: string;
}

export interface Doctor {
  id: number;
  user: User;
  specialization: string;
  license_number: string;
  experience_years: number;
  consultation_fee: number;
}

export interface TimeSlot {
  id: number;
  doctor: number;
  doctor_name: string;
  doctor_specialization: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
}

// API Client Class
class APIClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private removeToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Don't send token for login/register endpoints
    const isAuthEndpoint = endpoint === 'login/' || endpoint === 'register/';
    if (this.token && !isAuthEndpoint) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
        
        // Handle Django validation errors
        if (errorData.username && errorData.username[0]) {
          throw new Error(errorData.username[0]);
        }
        if (errorData.email && errorData.email[0]) {
          throw new Error(errorData.email[0]);
        }
        if (errorData.non_field_errors && errorData.non_field_errors[0]) {
          throw new Error(errorData.non_field_errors[0]);
        }
        
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.makeRequest('login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await this.makeRequest('register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('logout/', {
        method: 'POST',
      });
    } finally {
      this.removeToken();
    }
  }

  async getProfile(): Promise<User> {
    return await this.makeRequest('profile/');
  }

  // Doctor Methods
  async getDoctors(): Promise<any> {
    return await this.makeRequest('doctors/');
  }

  // Appointment Methods
  async getAppointments(): Promise<any> {
    return await this.makeRequest('bookings/appointments/');
  }

  // Doctor Dashboard Methods
  async getDoctorDashboard(): Promise<any> {
    return await this.makeRequest('bookings/doctor/dashboard/');
  }

  async updateAppointmentStatus(appointmentId: number, status: string, notes?: string): Promise<any> {
    return await this.makeRequest(`bookings/appointments/${appointmentId}/update-status/`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  async createMedicalRecord(recordData: {
    appointment: number;
    diagnosis: string;
    prescription: string;
    doctor_notes: string;
    follow_up_date?: string | null;
  }): Promise<any> {
    return await this.makeRequest('bookings/medical-records/', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  }

  // Patient Management Methods
  async addPatient(patientData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    emergencyContact: string;
    emergencyPhone: string;
    bloodGroup?: string;
    allergies?: string;
    chronicConditions?: string;
    isFirstTime: boolean;
  }): Promise<any> {
    return await this.makeRequest('add-patient/', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async getPatients(): Promise<any> {
    return await this.makeRequest('patients/');
  }

  async createAppointment(appointmentData: {
    doctor: number;
    appointment_date: string;
    appointment_time: string;
    symptoms: string;
    priority: string;
    reason: string;
    notes?: string;
  }): Promise<any> {
    return await this.makeRequest('bookings/appointments/create/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async createAppointmentByStaff(appointmentData: {
    patient_id: string;
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    symptoms: string;
    reason: string;
    priority: string;
    notes?: string;
    is_first_visit?: boolean;
  }): Promise<any> {
    return await this.makeRequest('bookings/appointments/create-by-staff/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getAppointmentById(id: number): Promise<Appointment> {
    return await this.makeRequest(`bookings/appointments/${id}/`);
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment> {
    return await this.makeRequest(`bookings/appointments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async cancelAppointment(id: number): Promise<void> {
    await this.makeRequest(`bookings/appointments/${id}/`, {
      method: 'DELETE',
    });
  }

  // Time Slot Methods
  async getAvailableTimeSlots(doctorId?: number, date?: string): Promise<TimeSlot[]> {
    const params = new URLSearchParams();
    if (doctorId) params.append('doctor', doctorId.toString());
    if (date) params.append('date', date);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.makeRequest(`bookings/time-slots/${query}`);
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentToken(): string | null {
    return this.token;
  }
}

// Create and export the API client instance
export const apiClient = new APIClient(API_BASE_URL);

// Auth Helper Functions
export const authHelpers = {
  login: async (credentials: LoginRequest) => {
    return await apiClient.login(credentials);
  },
  
  register: async (userData: RegisterRequest) => {
    return await apiClient.register(userData);
  },
  
  logout: async () => {
    await apiClient.logout();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
  
  isAuthenticated: () => {
    return apiClient.isAuthenticated();
  },
  
  getUser: async () => {
    if (apiClient.isAuthenticated()) {
      return await apiClient.getProfile();
    }
    return null;
  }
};

// Export the API client as default
export default apiClient;