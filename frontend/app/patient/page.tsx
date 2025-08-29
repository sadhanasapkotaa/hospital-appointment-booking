import React from "react";
import { Calendar, Clock, User, Trash2, LogOut, Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-blue-600 text-2xl font-bold">❤</span>
          <span className="text-xl font-semibold">HealthPal</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, John Doe (user)</span>
          <button className="flex items-center space-x-1 px-3 py-1 border rounded-md hover:bg-gray-100">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Welcome back, John Doe</h1>
        <p className="text-gray-600 mb-6">Manage your appointments and health records</p>

        {/* Appointment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <Calendar className="text-blue-600 mb-2" />
            <p className="font-medium">Total Appointments</p>
            <p className="text-xl font-semibold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <Clock className="text-blue-600 mb-2" />
            <p className="font-medium">Upcoming</p>
            <p className="text-xl font-semibold">1</p>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm flex flex-col items-center">
            <User className="text-blue-600 mb-2" />
            <p className="font-medium">Completed</p>
            <p className="text-xl font-semibold">0</p>
          </div>
        </div>

        {/* Book Appointment Button */}
        <div className="flex justify-end mb-6">
          <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-gray-800">
            <Plus size={16} />
            <span>Book Appointment</span>
          </button>
        </div>

        {/* Appointments List */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Your Appointments</h2>
          <p className="text-gray-600 mb-4">
            View and manage your scheduled appointments
          </p>

          {/* Appointment Card */}
          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-lg">Dr. Sarah Johnson</p>
              <div className="flex space-x-2 my-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-sm">
                  Cardiology
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded-md text-sm">
                  confirmed
                </span>
              </div>
              <p className="text-gray-600 flex items-center space-x-2">
                <Calendar size={16} /> <span>9/1/2025</span>
              </p>
              <p className="text-gray-600 flex items-center space-x-2">
                <Clock size={16} /> <span>10:00</span>
              </p>
              <p className="text-gray-600 mt-1">Reason: Regular checkup</p>
            </div>
            <button className="flex items-center space-x-1 px-3 py-1 border rounded-md hover:bg-gray-100 text-red-600">
              <Trash2 size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
