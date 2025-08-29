import React from "react";
import { FiCalendar, FiClock, FiUser, FiLogOut, FiPlus } from "react-icons/fi";

export default function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-2xl">❤</span>
          <span className="text-xl font-semibold text-blue-600">HealthPal</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Welcome, John Doe (user)</span>
          <button className="flex items-center space-x-1 px-3 py-1 border rounded-md hover:bg-gray-100 text-sm">
            <FiLogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Welcome back, John Doe</h1>
            <p className="text-sm text-gray-600">Manage your appointments and health records</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800 text-sm">
            <FiPlus size={16} />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiCalendar className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Total Appointments</span>
            </div>
            <p className="text-2xl font-bold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiClock className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Upcoming</span>
            </div>
            <p className="text-2xl font-bold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiUser className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Completed</span>
            </div>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-1">Your Appointments</h2>
          <p className="text-sm text-gray-600 mb-6">View and manage your scheduled appointments</p>

          {/* Appointment Card */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Dr. Sarah Johnson</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                    Cardiology
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                    confirmed
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiCalendar size={14} className="mr-2" />
                    <span>9/1/2025</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock size={14} className="mr-2" />
                    <span>10:00</span>
                  </div>
                  <p className="mt-2">Reason: Regular checkup</p>
                </div>
              </div>
              <button className="flex items-center space-x-1 px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
