'use client'
import React, { useState, useEffect } from 'react'
import { FiX, FiCalendar, FiClock, FiUser, FiFileText, FiAlertCircle } from 'react-icons/fi'
import { apiClient } from '../app/api/api'

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isFirstTime: boolean
}

interface Doctor {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  specialization: string
  license_number: string
  experience_years: number
  consultation_fee: string
  is_available: boolean
}

interface ScheduleVisitProps {
  isOpen: boolean
  onClose: () => void
  patient?: Patient | null
  patients?: Patient[]
  onSuccess?: () => void
}

interface VisitFormData {
  patientId: string
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  symptoms: string
  currentDisease: string
  urgencyLevel: 'low' | 'normal' | 'high' | 'urgent'
  notes: string
}

const timeSlots = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45'
]

export default function ScheduleVisit({ isOpen, onClose, patient, patients = [], onSuccess }: ScheduleVisitProps) {
  const [formData, setFormData] = useState<VisitFormData>({
    patientId: '',
    doctorId: '',
    doctorName: '',
    specialty: '',
    date: '',
    time: '',
    symptoms: '',
    currentDisease: '',
    urgencyLevel: 'normal',
    notes: ''
  })
  
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (patient) {
        setSelectedPatientId(patient.id)
        setFormData(prev => ({ ...prev, patientId: patient.id }))
      } else {
        setSelectedPatientId('')
        setFormData(prev => ({ ...prev, patientId: '' }))
      }
      fetchDoctors()
    }
  }, [isOpen, patient])

  // Fetch doctors when modal opens
  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true)
      const response = await apiClient.getDoctors()
      setDoctors(response.doctors || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
      // Fallback to mock doctors for testing
      const mockDoctors = [
        {
          id: '1',
          name: 'Dr. John Smith',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@hospital.com',
          specialization: 'Cardiology',
          license_number: 'MD001',
          experience_years: 10,
          consultation_fee: '150.00',
          is_available: true
        },
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@hospital.com',
          specialization: 'Pediatrics',
          license_number: 'MD002',
          experience_years: 8,
          consultation_fee: '120.00',
          is_available: true
        },
        {
          id: '3',
          name: 'Dr. Michael Davis',
          firstName: 'Michael',
          lastName: 'Davis',
          email: 'michael.davis@hospital.com',
          specialization: 'Orthopedics',
          license_number: 'MD003',
          experience_years: 12,
          consultation_fee: '180.00',
          is_available: true
        }
      ]
      setDoctors(mockDoctors)
    } finally {
      setDoctorsLoading(false)
    }
  }

  // Get the currently selected patient
  const currentPatient = patient || patients.find(p => p.id === selectedPatientId) || null

  // Form validation - check if all required fields are filled
  const isFormValid = () => {
    const valid = (
      currentPatient && // Patient must be selected
      formData.doctorId && // Doctor must be selected
      formData.date && // Date must be selected
      formData.time && // Time must be selected
      formData.symptoms.trim() // Symptoms must be provided
    )
    
    return valid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value
    setSelectedPatientId(patientId)
    setFormData(prev => ({
      ...prev,
      patientId
    }))
  }

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorId = e.target.value
    const doctor = doctors.find(d => d.id === doctorId)
    
    setFormData(prev => ({
      ...prev,
      doctorId,
      doctorName: doctor?.name || '',
      specialty: doctor?.specialization || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPatient || !isFormValid()) return
    
    setIsLoading(true)
    
    try {
      // Prepare appointment data for backend
      const appointmentData = {
        patient_id: currentPatient.id,
        doctor_id: formData.doctorId,
        appointment_date: formData.date,
        appointment_time: formData.time,
        symptoms: formData.symptoms,
        reason: formData.currentDisease || formData.symptoms,
        priority: formData.urgencyLevel,
        notes: formData.notes || '',
        is_first_visit: currentPatient.isFirstTime
      }

      console.log('Submitting appointment:', appointmentData)

      // Call backend API to create appointment
      const response = await apiClient.createAppointmentByStaff(appointmentData)
      
      console.log('Appointment created:', response)
      
      // Call onSuccess callback to refresh data
      if (onSuccess) {
        onSuccess()
      }
      
      // Reset form
      setFormData({
        patientId: '',
        doctorId: '',
        doctorName: '',
        specialty: '',
        date: '',
        time: '',
        symptoms: '',
        currentDisease: '',
        urgencyLevel: 'normal',
        notes: ''
      })
      setSelectedPatientId('')
      
      onClose()
      
      // Show success message
      alert('Appointment scheduled successfully!')
      
    } catch (error: any) {
      console.error('Error scheduling visit:', error)
      alert(`Error scheduling appointment: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Schedule Visit</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Patient Info */}
        {patient ? (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <FiUser className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Patient Information</h3>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-lg font-medium text-gray-900">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-sm text-gray-600">{patient.email}</p>
              <p className="text-sm text-gray-600">{patient.phone}</p>
              {patient.isFirstTime && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  First Time Visit
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <FiUser className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Select Patient</h3>
            </div>
            <select
              value={selectedPatientId}
              onChange={handlePatientSelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} - {p.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor *
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleDoctorChange}
                required
                disabled={doctorsLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">
                  {doctorsLoading ? 'Loading doctors...' : 'Choose a doctor'}
                </option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline h-4 w-4 mr-1" />
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={today}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiClock className="inline h-4 w-4 mr-1" />
                  Appointment Time *
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Symptoms *
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder="Describe the main symptoms or concerns..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Suspected Disease/Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspected Disease/Condition
              </label>
              <input
                type="text"
                name="currentDisease"
                value={formData.currentDisease}
                onChange={handleInputChange}
                placeholder="e.g., Headache, Follow-up visit, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level *
              </label>
              <select
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low - Routine appointment</option>
                <option value="normal">Normal - Standard appointment</option>
                <option value="high">High - Priority appointment</option>
                <option value="urgent">Urgent - Immediate attention needed</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional information, medical history, or special requirements..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
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
              disabled={isLoading || !isFormValid()}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Scheduling...
                </div>
              ) : (
                'Schedule Visit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
