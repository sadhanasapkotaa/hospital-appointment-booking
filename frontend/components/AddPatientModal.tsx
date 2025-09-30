'use client'
import React, { useState } from 'react'
import { FiX, FiUser } from 'react-icons/fi'
import { apiClient } from '../app/api/api'

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  isFirstTime: boolean
  bloodGroup?: string
  allergies?: string
  chronicConditions?: string
}

interface PatientFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  isFirstTime: boolean
  bloodGroup?: string
  allergies?: string
  chronicConditions?: string
}

interface AddPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (patient: Patient) => void
  onSuccess?: () => void
}

export default function AddPatientModal({ isOpen, onClose, onSave, onSuccess }: AddPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    isFirstTime: true,
    bloodGroup: '',
    allergies: '',
    chronicConditions: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Call the API to add patient
      const response = await apiClient.addPatient(formData)
      
      // Create patient object for the frontend with the response data
      const newPatient: Patient = {
        id: response.patient.id.toString(),
        firstName: response.patient.firstName,
        lastName: response.patient.lastName,
        email: response.patient.email,
        phone: response.patient.phone,
        dateOfBirth: response.patient.dateOfBirth,
        gender: response.patient.gender,
        address: response.patient.address,
        emergencyContact: response.patient.emergencyContact,
        emergencyPhone: response.patient.emergencyPhone,
        isFirstTime: response.patient.isFirstTime,
        bloodGroup: response.patient.bloodGroup,
        allergies: response.patient.allergies,
        chronicConditions: response.patient.chronicConditions
      }
      
      onSave(newPatient)
      if (onSuccess) onSuccess()
      onClose()
      
    } catch (error: unknown) {
      console.error('Error adding patient:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-3">
              <FiUser className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Patient</h2>
              <p className="text-sm text-gray-600">Enter patient information and medical details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Patient Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Patient Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isFirstTime"
                  value="true"
                  checked={formData.isFirstTime === true}
                  onChange={() => setFormData(prev => ({ ...prev, isFirstTime: true }))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">First Time Patient</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isFirstTime"
                  value="false"
                  checked={formData.isFirstTime === false}
                  onChange={() => setFormData(prev => ({ ...prev, isFirstTime: false }))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Returning Patient</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Personal Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Contact & Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Contact & Medical Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name *</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone *</label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency contact phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Known Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="List any known allergies (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
                <textarea
                  name="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="List any chronic conditions (optional)"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Adding Patient...
                </div>
              ) : (
                'Add Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
