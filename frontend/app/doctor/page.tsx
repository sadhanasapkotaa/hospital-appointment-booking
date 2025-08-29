import React from "react";

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-2xl font-bold">❤</span>
          <span className="text-xl font-semibold">HealthPal</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, Dr. Sarah Johnson (doctor)</span>
          <button className="flex items-center space-x-1 px-3 py-1 border rounded-md hover:bg-gray-100">
            <span>⎋</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Welcome, Dr. Sarah Johnson</h1>
        <p className="text-gray-600 mb-6">Cardiology • Today's Schedule & Patient Management</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <p className="font-medium">Total Patients</p>
            <p className="text-xl font-semibold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <p className="font-medium">Today's Appointments</p>
            <p className="text-xl font-semibold">0</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <p className="font-medium">Completed</p>
            <p className="text-xl font-semibold">0</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <p className="font-medium">Pending</p>
            <p className="text-xl font-semibold">1</p>
          </div>
        </div>

        {/* Schedule and Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <div className="bg-white border rounded-lg shadow-sm p-6 flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold mb-2">Today's Schedule</h2>
            <p className="text-gray-600 mb-6">Your appointments for today</p>
            <div className="flex flex-col items-center text-gray-400">
              <span className="text-4xl mb-2">📅</span>
              <p>No appointments scheduled for today</p>
            </div>
          </div>

          {/* Available Time Slots */}
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-2">Available Time Slots</h2>
            <p className="text-gray-600 mb-6">Your availability for appointments</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                "09:00",
                "10:00",
                "11:00",
                "14:00",
                "15:00",
              ].map((time) => (
                <div
                  key={time}
                  className="p-4 bg-green-100 text-green-700 rounded-lg text-center cursor-pointer hover:bg-green-200"
                >
                  <p className="font-semibold">{time}</p>
                  <p className="text-sm">Available</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
