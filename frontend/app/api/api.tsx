// API Configuration and Services
const API_BASE_URL = 'https://hospital-appointment-booking-ed4i.onrender.com/api/';

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

// Generic API Response type
export interface APIResponse<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
  results?: T[];
  count?: number;
  next?: string;
  previous?: string;
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

export interface Patient {
  id: number;
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

  private async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
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
    const response = await this.makeRequest<LoginResponse>('login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Handle both direct response and nested data structure
    const loginData = response.data || response as unknown as LoginResponse;
    if ('token' in loginData) {
      this.setToken(loginData.token);
    }
    return loginData;
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await this.makeRequest<LoginResponse>('register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Handle both direct response and nested data structure
    const loginData = response.data || response as unknown as LoginResponse;
    if ('token' in loginData) {
      this.setToken(loginData.token);
    }
    return loginData;
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
    const response = await this.makeRequest<User>('profile/');
    return this.extractData(response);
  }

  // Helper method to extract data from API response
  private extractData<T>(response: APIResponse<T>): T {
    if (response.results) {
      return response.results as unknown as T;
    }
    if (response.data) {
      return response.data;
    }
    return response as unknown as T;
  }

  // Doctor Methods
  async getDoctors(): Promise<Doctor[]> {
    const response = await this.makeRequest<Doctor[]>('doctors/');
    return this.extractData(response);
  }

  // Appointment Methods
  async getAppointments(): Promise<Appointment[]> {
    const response = await this.makeRequest<Appointment[]>('bookings/appointments/');
    return this.extractData(response);
  }

  // Doctor Dashboard Methods
  async getDoctorDashboard(): Promise<APIResponse<{ appointments: Appointment[], stats: any }>> {
    return await this.makeRequest('bookings/doctor/dashboard/');
  }

  async updateAppointmentStatus(appointmentId: number, status: string, notes?: string): Promise<Appointment> {
    const response = await this.makeRequest<Appointment>(`bookings/appointments/${appointmentId}/update-status/`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
    return this.extractData(response);
  }

  async createMedicalRecord(recordData: {
    appointment: number;
    diagnosis: string;
    prescription: string;
    doctor_notes: string;
    follow_up_date?: string | null;
  }): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await this.makeRequest('bookings/medical-records/', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  }

  // Patient Methods
  async addPatient(patientData: Omit<Patient, 'id'>): Promise<{ patient: Patient }> {
    const response = await this.makeRequest<{ patient: Patient }>('patients/add/', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
    return this.extractData(response);
  }

  async getPatients(): Promise<Patient[]> {
    const response = await this.makeRequest<Patient[]>('patients/');
    return this.extractData(response);
  }

  async getPatient(patientId: string): Promise<Patient> {
    const response = await this.makeRequest<Patient>(`patients/${patientId}/`);
    return this.extractData(response);
  }

  async createAppointment(appointmentData: any): Promise<Appointment> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this.makeRequest<Appointment>('bookings/appointments/create/', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
    return this.extractData(response);
  }

  // Receptionist Methods
  async getReceptionistDashboard(): Promise<any> {
    return await this.makeRequest('bookings/receptionist/dashboard/');
  }

  // Admin Methods
  async getAdminDashboard(): Promise<any> {
    return await this.makeRequest('bookings/admin/dashboard/');
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
