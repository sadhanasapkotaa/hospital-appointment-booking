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

interface Visit {
  id: string
  patientId: string
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  symptoms: string
  currentDisease: string
  urgencyLevel: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

interface VisitFormData {
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  symptoms: string
  currentDisease: string
  urgencyLevel: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

interface AssignVisitModalProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  patients?: Patient[] // Make patients optional for backward compatibility
  onSave: (visit: Visit) => void
}



const timeSlots = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30', '11:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45'
]

export default function AssignVisitModal({ isOpen, onClose, patient, patients = [], onSave }: AssignVisitModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [formData, setFormData] = useState<VisitFormData>({
    doctorId: '',
    doctorName: '',
    specialty: '',
    date: '',
    time: '',
    symptoms: '',
    currentDisease: '',
    urgencyLevel: 'normal',
    notes: '',
    status: 'scheduled'
  })

  const [isLoading, setIsLoading] = useState(false)

  // Reset selectedPatientId when modal opens
  useEffect(() => {
    if (isOpen) {
      if (patient) {
        setSelectedPatientId(patient.id)
      } else {
        setSelectedPatientId('')
      }
    }
  }, [isOpen, patient])

  // Fetch doctors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDoctors()
    }
  }, [isOpen])

  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true)
      const response = await apiClient.getDoctors()
      setDoctors(response.doctors || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setDoctors([])
    } finally {
      setDoctorsLoading(false)
    }
  }

  // Get the currently selected patient
  const currentPatient = patient || patients.find(p => p.id === selectedPatientId) || null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    if (!currentPatient) return
    
    setIsLoading(true)
    
    try {
      const visit: Visit = {
        ...formData,
        id: `visit_${Date.now()}`,
        patientId: currentPatient.id
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onSave(visit)
      
      // Reset form
      setFormData({
        doctorId: '',
        doctorName: '',
        specialty: '',
        date: '',
        time: '',
        symptoms: '',
        currentDisease: '',
        urgencyLevel: 'normal',
        notes: '',
        status: 'scheduled'
      })
      setSelectedPatientId('')
      
      onClose()
    } catch (error) {
      console.error('Error scheduling visit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-3">
              <FiCalendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assign Visit</h2>
              <p className="text-sm text-gray-600">
                {currentPatient 
                  ? `Schedule appointment for ${currentPatient.firstName} ${currentPatient.lastName}`
                  : 'Schedule a new appointment'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Patient Info/Selection */}
        {currentPatient ? (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                {currentPatient.firstName[0]}{currentPatient.lastName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {currentPatient.firstName} {currentPatient.lastName}
                </h3>
                <p className="text-sm text-gray-600">{currentPatient.email} • {currentPatient.phone}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  currentPatient.isFirstTime 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentPatient.isFirstTime ? 'First Time Patient' : 'Returning Patient'}
                </span>
              </div>
              {!patient && (
                <button
                  onClick={() => setSelectedPatientId('')}
                  className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Change Patient
                </button>
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
              onChange={(e) => setSelectedPatientId(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor *</label>
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
              {doctors.length === 0 && !doctorsLoading && (
                <p className="mt-2 text-sm text-red-600">
                  No doctors available. Please contact administration.
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot (15 min) *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Symptoms *</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe the patient's current symptoms..."
              />
            </div>

            {/* Current Disease/Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suspected Disease/Condition *</label>
              <input
                type="text"
                name="currentDisease"
                value={formData.currentDisease}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter suspected condition or reason for visit"
              />
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level *</label>
              <select
                name="urgencyLevel"
                value={formData.urgencyLevel}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low - Routine checkup</option>
                <option value="normal">Normal - Standard appointment</option>
                <option value="high">High - Urgent care needed</option>
                <option value="critical">Critical - Emergency</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any additional information for the doctor (optional)"
              />
            </div>

            {/* Urgency Alert */}
            {formData.urgencyLevel === 'high' || formData.urgencyLevel === 'critical' ? (
              <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <FiAlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {formData.urgencyLevel === 'critical' ? 'Critical Case' : 'High Priority Case'}
                  </p>
                  <p className="text-xs text-yellow-700">
                    {formData.urgencyLevel === 'critical' 
                      ? 'This case requires immediate attention. Consider emergency protocols.'
                      : 'This case should be prioritized and scheduled as soon as possible.'
                    }
                  </p>
                </div>
              </div>
            ) : null}
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
              disabled={isLoading || !currentPatient}
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
