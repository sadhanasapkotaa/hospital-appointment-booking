import React from "react";

export default function ReceptionistDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-2xl font-bold">❤</span>
          <span className="text-xl font-semibold">HealthPal</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, Mary Wilson (receptionist)</span>
          <button className="flex items-center space-x-1 px-3 py-1 border rounded-md hover:bg-gray-100">
            <span>⎋</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Receptionist Dashboard</h1>
        <p className="text-gray-600 mb-6">Manage appointments and doctor schedules</p>

        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <p className="font-medium">Total Appointments</p>
            <p className="text-xl font-semibold">2</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <p className="font-medium">Pending Review</p>
            <p className="text-xl font-semibold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <p className="font-medium">Confirmed Today</p>
            <p className="text-xl font-semibold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <p className="font-medium">Today's Appointments</p>
            <p className="text-xl font-semibold">0</p>
          </div>
        </div>

        {/* Appointment Management */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-2">Appointment Management</h2>
          <p className="text-gray-600 mb-4">Review and manage all patient appointments</p>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 mb-4">
            <input
              type="text"
              placeholder="Search patients, doctors, or specialties..."
              className="w-full md:flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-3 py-2 border rounded-md">
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
            <select className="px-3 py-2 border rounded-md">
              <option>All Dates</option>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Patient</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Doctor</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Specialty</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date & Time</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Reason</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr className="border-t">
                  <td className="px-4 py-2">John Doe</td>
                  <td className="px-4 py-2">Dr. Sarah Johnson</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-sm">Cardiology</span>
                  </td>
                  <td className="px-4 py-2">9/1/2025 <br /> 10:00</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-md text-sm">confirmed</span>
                  </td>
                  <td className="px-4 py-2">Regular checkup</td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">Complete</button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">Cancel</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">Delete</button>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="border-t">
                  <td className="px-4 py-2">Jane Smith</td>
                  <td className="px-4 py-2">Dr. Michael Chen</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-md text-sm">Dermatology</span>
                  </td>
                  <td className="px-4 py-2">9/2/2025 <br /> 14:00</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-md text-sm">pending</span>
                  </td>
                  <td className="px-4 py-2">Skin consultation</td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">Confirm</button>
                    <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">Cancel</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">Delete</button>
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