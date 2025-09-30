'use client'
import React, { useState } from 'react'
import { FaUser, FaUserMd, FaEye, FaEyeSlash } from 'react-icons/fa'
import { authHelpers } from '../api/api'
import { useRouter } from 'next/navigation'

const LoginPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'staff' | 'doctor'>('staff')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await authHelpers.login({
        email: formData.email,
        password: formData.password,
        user_type: activeTab
      })

      console.log('Login successful:', response)
      
      // Redirect based on user type
      if (response.user.user_type === 'staff') {
        router.push('/receptionist')
      } else if (response.user.user_type === 'doctor') {
        router.push('/doctor')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.email && formData.password

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h1 className="text-2xl font-bold text-white text-center">Hospital Login</h1>
        </div>

        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'staff'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaUser />
            Staff Login
          </button>
          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'doctor'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaUserMd />
            Doctor Login
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter your ${activeTab} email`}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                isFormValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </div>
              ) : (
                `Sign in as ${activeTab === 'staff' ? 'Staff' : 'Doctor'}`
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
