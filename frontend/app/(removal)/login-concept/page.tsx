"use client";
import { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Patient',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle sign in logic here
    console.log('Sign in attempt:', formData);
    
    // Redirect based on role (for demo purposes)
    const roleRedirects = {
      'Patient': '/patient',
      'Doctor': '/doctor',
      'Receptionist': '/receptionist',
      'Admin': '/admin'
    };
    
    window.location.href = roleRedirects[formData.role as keyof typeof roleRedirects];
  };

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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Login As</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="Patient">Patient</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Doctor">Doctor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            Sign In
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-xs text-gray-400">OR TRY DEMO ACCOUNTS</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="w-full border border-gray-200 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 font-medium text-sm text-gray-700 transition-colors"
            onClick={() => handleDemoLogin("/patient")}
          >
            Demo Patient Login
          </button>
          <button
            type="button"
            className="w-full border border-gray-200 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 font-medium text-sm text-gray-700 transition-colors"
            onClick={() => handleDemoLogin("/receptionist")}
          >
            Demo Receptionist Login
          </button>
          <button
            type="button"
            className="w-full border border-gray-200 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 font-medium text-sm text-gray-700 transition-colors"
            onClick={() => handleDemoLogin("/doctor")}
          >
            Demo Doctor Login
          </button>
          <button
            type="button"
            className="w-full border border-blue-200 py-3 rounded-lg bg-blue-50 hover:bg-blue-100 font-medium text-sm text-blue-700 transition-colors"
            onClick={() => handleDemoLogin("/admin")}
          >
            Demo Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}
