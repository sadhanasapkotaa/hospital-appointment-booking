import React from "react";
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiLogOut, FiFilter, FiSearch } from "react-icons/fi";

export default function ReceptionistDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-2xl">❤</span>
          <span className="text-xl font-semibold text-blue-600">HealthPal</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Welcome, Mary Wilson (receptionist)</span>
          <button className="flex items-center space-x-1 px-3 py-1 border rounded-md hover:bg-gray-100 text-sm">
            <FiLogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-1">Receptionist Dashboard</h1>
        <p className="text-sm text-gray-600 mb-6">Manage appointments and doctor schedules</p>

        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiCalendar className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Total Appointments</span>
            </div>
            <p className="text-2xl font-bold">2</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiClock className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Pending Review</span>
            </div>
            <p className="text-2xl font-bold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiCheckCircle className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Confirmed Today</span>
            </div>
            <p className="text-2xl font-bold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center mb-2">
              <FiUsers className="text-blue-600 mr-2" size={20} />
              <span className="text-sm font-medium text-gray-700">Today's Appointments</span>
            </div>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>

        {/* Appointment Management */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-1">Appointment Management</h2>
          <p className="text-sm text-gray-600 mb-6">Review and manage all patient appointments</p>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search patients, doctors, or specialties..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400" size={16} />
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <FiCalendar className="text-gray-400" size={16} />
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Dates</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Doctor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Specialty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Row 1 */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-blue-600 font-medium">John Doe</td>
                  <td className="px-4 py-4 text-sm text-gray-900">Dr. Sarah Johnson</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">Cardiology</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <FiCalendar className="mr-1 text-gray-400" size={14} />
                      9/1/2025
                    </div>
                    <div className="flex items-center mt-1">
                      <FiClock className="mr-1 text-gray-400" size={14} />
                      10:00
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">confirmed</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">Regular checkup</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <FiCheckCircle size={16} />
                      </button>
                      <span className="text-xs text-gray-500">Complete</span>
                      <button className="p-1 text-gray-600 hover:bg-gray-50 rounded ml-2">
                        <FiClock size={16} />
                      </button>
                      <span className="text-xs text-gray-500">Cancel</span>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded ml-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-blue-600 font-medium">Jane Smith</td>
                  <td className="px-4 py-4 text-sm text-gray-900">Dr. Michael Chen</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">Dermatology</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      <FiCalendar className="mr-1 text-gray-400" size={14} />
                      9/2/2025
                    </div>
                    <div className="flex items-center mt-1">
                      <FiClock className="mr-1 text-gray-400" size={14} />
                      14:00
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">pending</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">Skin consultation</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <FiCheckCircle size={16} />
                      </button>
                      <span className="text-xs text-gray-500">Confirm</span>
                      <button className="p-1 text-gray-600 hover:bg-gray-50 rounded ml-2">
                        <FiClock size={16} />
                      </button>
                      <span className="text-xs text-gray-500">Cancel</span>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded ml-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}