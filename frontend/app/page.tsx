import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { UserDashboard } from './components/UserDashboard';
import { ReceptionistDashboard } from './components/ReceptionistDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { Button } from './components/ui/button';
import { LogOut, Heart } from 'lucide-react';

export type UserRole = 'user' | 'receptionist' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availability: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
}

// Mock data
export const mockDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', availability: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
  { id: '2', name: 'Dr. Michael Chen', specialty: 'Dermatology', availability: ['08:00', '09:00', '13:00', '14:00', '16:00'] },
  { id: '3', name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', availability: ['09:00', '10:00', '11:00', '13:00', '15:00'] },
  { id: '4', name: 'Dr. James Wilson', specialty: 'Orthopedics', availability: ['08:00', '10:00', '14:00', '15:00', '16:00'] },
  { id: '5', name: 'Dr. Lisa Park', specialty: 'Neurology', availability: ['09:00', '11:00', '13:00', '14:00', '15:00'] },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      patientId: 'user1',
      patientName: 'John Doe',
      doctorId: '1',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2025-09-01',
      time: '10:00',
      status: 'confirmed',
      reason: 'Regular checkup'
    },
    {
      id: '2',
      patientId: 'user2',
      patientName: 'Jane Smith',
      doctorId: '2',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Dermatology',
      date: '2025-09-02',
      time: '14:00',
      status: 'pending',
      reason: 'Skin consultation'
    }
  ]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const updateAppointment = (appointmentId: string, updates: Partial<Appointment>) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId ? { ...apt, ...updates } : apt
      )
    );
  };

  const deleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-3xl text-blue-900">HealthPal</h1>
            </div>
            <p className="text-gray-600">Hospital Appointment Management System</p>
          </div>
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl text-blue-900">HealthPal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser.name} ({currentUser.role})
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentUser.role === 'user' && (
          <UserDashboard
            user={currentUser}
            appointments={appointments}
            doctors={mockDoctors}
            onAddAppointment={addAppointment}
            onUpdateAppointment={updateAppointment}
            onDeleteAppointment={deleteAppointment}
          />
        )}
        {currentUser.role === 'receptionist' && (
          <ReceptionistDashboard
            appointments={appointments}
            doctors={mockDoctors}
            onUpdateAppointment={updateAppointment}
            onDeleteAppointment={deleteAppointment}
          />
        )}
        {currentUser.role === 'doctor' && (
          <DoctorDashboard
            doctor={mockDoctors.find(d => d.name.includes(currentUser.name.split(' ')[1])) || mockDoctors[0]}
            appointments={appointments.filter(apt => apt.doctorName.includes(currentUser.name.split(' ')[1]))}
            onUpdateAppointment={updateAppointment}
          />
        )}
      </main>
    </div>
  );
}