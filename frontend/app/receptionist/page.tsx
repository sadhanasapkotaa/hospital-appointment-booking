import React from "react";
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiLogOut, FiFilter, FiSearch, FiHeart, FiTrash2 } from "react-icons/fi";

export default function ReceptionistDashboard() {
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
                <p className="text-sm text-gray-600">Receptionist Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl">
                <span className="text-sm font-medium text-blue-700">Mary Wilson (Receptionist)</span>
              </div>
              <button className="btn-primary flex items-center space-x-2">
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Receptionist Dashboard
          </h1>
          <p className="text-gray-600">Manage appointments and doctor schedules</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stats-card fade-in stagger-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FiCalendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="stats-card fade-in stagger-2">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>

          <div className="stats-card fade-in stagger-3">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <FiCheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed Today</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>

          <div className="stats-card fade-in stagger-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Management */}
        <div className="animate-card fade-in stagger-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-3">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Appointment Management</h2>
                <p className="text-sm text-gray-600">Review and manage all patient appointments</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-8">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search patients, doctors, or specialties..."
                  className="search-input w-full pl-12 pr-4 py-3"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FiFilter className="text-gray-400" size={16} />
                  <select className="filter-select">
                    <option>All Status</option>
                    <option>Confirmed</option>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-gray-400" size={16} />
                  <select className="filter-select">
                    <option>All Dates</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Doctor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Specialty</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Reason</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Row 1 */}
                  <tr className="table-row fade-in stagger-1">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          JD
                        </div>
                        <div className="text-sm font-medium text-gray-900">John Doe</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Dr. Sarah Johnson</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                        Cardiology
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <FiCalendar className="mr-2 text-gray-400" size={14} />
                        9/1/2025
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2 text-gray-400" size={14} />
                        10:00
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800">
                        confirmed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Regular checkup</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="icon-btn icon-btn-success" title="Complete">
                          <FiCheckCircle size={16} />
                        </button>
                        <button className="icon-btn icon-btn-edit" title="Reschedule">
                          <FiClock size={16} />
                        </button>
                        <button className="icon-btn icon-btn-delete" title="Cancel">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Row 2 */}
                  <tr className="table-row fade-in stagger-2">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          JS
                        </div>
                        <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Dr. Michael Chen</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                        Dermatology
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <FiCalendar className="mr-2 text-gray-400" size={14} />
                        9/2/2025
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2 text-gray-400" size={14} />
                        14:00
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800">
                        pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Skin consultation</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="icon-btn icon-btn-success" title="Confirm">
                          <FiCheckCircle size={16} />
                        </button>
                        <button className="icon-btn icon-btn-edit" title="Reschedule">
                          <FiClock size={16} />
                        </button>
                        <button className="icon-btn icon-btn-delete" title="Cancel">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}