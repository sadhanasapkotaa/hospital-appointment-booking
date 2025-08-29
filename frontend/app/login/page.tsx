"use client";
import { useState } from "react";
import { FiMail, FiLock, FiUser } from "react-icons/fi";

export default function LoginPage() {
  const [role, setRole] = useState("Patient");

  // Add handlers for demo login buttons
  const handleDemoLogin = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center mb-2">
            <span className="text-blue-600 text-3xl">❤</span>
            <h1 className="ml-2 text-2xl font-semibold text-blue-600">HealthPal</h1>
          </div>
          <p className="text-gray-600 text-sm">
            Hospital Appointment Management System
          </p>
        </div>

        {/* Form */}
        <h2 className="text-center font-semibold text-lg mb-1">Sign In to HealthPal</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Access your hospital appointment portal
        </p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="flex items-center border rounded-md px-3 bg-gray-50">
              <FiMail className="text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-2 py-2 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="flex items-center border rounded-md px-3 bg-gray-50">
              <FiLock className="text-gray-400" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-2 py-2 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Login As</label>
            <div className="flex items-center border rounded-md px-3 bg-gray-50">
              <FiUser className="text-gray-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-2 py-2 bg-transparent focus:outline-none"
              >
                <option>Patient</option>
                <option>Receptionist</option>
                <option>Doctor</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900"
          >
            Sign In
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-xs text-gray-400">OR TRY DEMO ACCOUNTS</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="space-y-3">
          <button
            className="w-full border py-2 rounded-md bg-gray-50 hover:bg-gray-100"
            onClick={() => handleDemoLogin("/patient")}
          >
            Demo Patient Login
          </button>
          <button
            className="w-full border py-2 rounded-md bg-gray-50 hover:bg-gray-100"
            onClick={() => handleDemoLogin("/receptionist")}
          >
            Demo Receptionist Login
          </button>
          <button
            className="w-full border py-2 rounded-md bg-gray-50 hover:bg-gray-100"
            onClick={() => handleDemoLogin("/doctor")}
          >
            Demo Doctor Login
          </button>
        </div>
      </div>
    </div>
  );
}
