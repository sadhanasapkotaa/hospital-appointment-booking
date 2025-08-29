import React from "react";
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiLogOut } from "react-icons/fi";

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-2xl">❤</span>
          <span className="text-xl font-semibold text-blue-600">HealthPal</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Welcome, Dr. Sarah Johnson (doctor)</span>
          <button className="flex items-center space-x-1 px-3 py-1 border rounded-md hover:bg-gray-100 text-sm">
            <FiLogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-1">Welcome, Dr. Sarah Johnson</h1>
        <p className="text-sm text-gray-600 mb-6">Cardiology • Today's Schedule & Patient Management</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiUsers className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Total Patients</span>
            </div>
            <p className="text-2xl font-bold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiCalendar className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Today's Appointments</span>
            </div>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiCheckCircle className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Completed</span>
            </div>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiClock className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Pending</span>
            </div>
            <p className="text-2xl font-bold">1</p>
          </div>
        </div>

        {/* Schedule and Availability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-1">Today's Schedule</h2>
            <p className="text-sm text-gray-600 mb-6">Your appointments for today</p>
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <FiCalendar size={48} className="mb-3" />
              <p className="text-sm">No appointments scheduled for today</p>
            </div>
          </div>

          {/* Available Time Slots */}
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-1">Available Time Slots</h2>
            <p className="text-sm text-gray-600 mb-6">Your availability for appointments</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                "09:00",
                "10:00", 
                "11:00",
                "14:00",
                "15:00",
              ].map((time) => (
                <div
                  key={time}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg text-center cursor-pointer hover:bg-green-100"
                >
                  <div className="flex items-center justify-center mb-1">
                    <FiClock className="text-green-600 mr-1" size={16} />
                    <p className="font-semibold text-green-700">{time}</p>
                  </div>
                  <p className="text-xs text-green-600">Available</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
