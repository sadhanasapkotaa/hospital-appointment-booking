"use client";
import { useState } from "react";

export default function LoginPage() {
  const [role, setRole] = useState("Patient");

  // Add handlers for demo login buttons
  const handleDemoLogin = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-3">
            <span className="text-blue-600 text-3xl">❤</span>
            <h1 className="ml-2 text-2xl font-bold text-blue-600">HealthPal</h1>
          </div>
          <p className="text-sm text-gray-600">
            Hospital Appointment Management System
          </p>
        </div>

        {/* Form */}
        <div className="text-center mb-6">
          <h2 className="font-semibold text-lg mb-1">Sign In to HealthPal</h2>
          <p className="text-sm text-gray-500">
            Access your hospital appointment portal
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Login As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option>Patient</option>
              <option>Receptionist</option>
              <option>Doctor</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 font-medium text-sm transition-colors"
          >
            Sign In
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-xs text-gray-400">OR TRY DEMO ACCOUNTS</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="space-y-3">
          <button
            className="w-full border border-gray-200 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 font-medium text-sm text-gray-700 transition-colors"
            onClick={() => handleDemoLogin("/patient")}
          >
            Demo Patient Login
          </button>
          <button
            className="w-full border border-gray-200 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 font-medium text-sm text-gray-700 transition-colors"
            onClick={() => handleDemoLogin("/receptionist")}
          >
            Demo Receptionist Login
          </button>
          <button
            className="w-full border border-gray-200 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 font-medium text-sm text-gray-700 transition-colors"
            onClick={() => handleDemoLogin("/doctor")}
          >
            Demo Doctor Login
          </button>
        </div>
      </div>
    </div>
  );
}
