"use client";
import React from "react";
import { FiCalendar, FiClock, FiUser, FiLogOut, FiPlus, FiHeart, FiTrash2 } from "react-icons/fi";
import { authHelpers } from '../../api/api';
import { useRouter } from 'next/navigation';

export default function PatientDashboard() {
  const router = useRouter()

  // Logout handler
  const handleLogout = async () => {
    try {
      await authHelpers.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        router.push('/login')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl mr-3">
                <FiHeart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  HealthPal
                </h1>
                <p className="text-sm text-gray-600">Patient Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl">
                <span className="text-sm font-medium text-blue-700">John Doe (Patient)</span>
              </div>
              <button 
                onClick={handleLogout}
                className="btn-primary flex items-center space-x-2"
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-start mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Welcome back, John Doe
            </h1>
            <p className="text-gray-600">Manage your appointments and health records</p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <FiPlus size={18} />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats-card fade-in stagger-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FiCalendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>

          <div className="stats-card fade-in stagger-2">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>

          <div className="stats-card fade-in stagger-3">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FiUser className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="animate-card fade-in stagger-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-3">
                <FiCalendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Appointments</h2>
                <p className="text-sm text-gray-600">View and manage your scheduled appointments</p>
              </div>
            </div>

            {/* Appointment Card */}
            <div className="appointment-card fade-in stagger-1">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      SJ
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Dr. Sarah Johnson</h3>
                      <p className="text-sm text-gray-600">Cardiology Specialist</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                      Cardiology
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                      Confirmed
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg mr-3">
                        <FiCalendar size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Date</p>
                        <p>September 1, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg mr-3">
                        <FiClock size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Time</p>
                        <p>10:00 AM</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason for Visit</p>
                    <p className="text-sm text-gray-600">Regular checkup and consultation</p>
                  </div>
                </div>
                
                <div className="ml-6">
                  <button className="icon-btn icon-btn-delete" title="Cancel Appointment">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State for additional appointments */}
            <div className="mt-8 text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPlus size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No more appointments scheduled</p>
              <button className="btn-secondary mt-4">
                Book Another Appointment
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
