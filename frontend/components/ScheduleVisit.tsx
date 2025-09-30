'use client'
import React, { useState, useEffect } from 'react'
import { FiX, FiCalendar, FiClock, FiUser, FiFileText, FiAlertCircle, FiChevronDown, FiCheck } from 'react-icons/fi'
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
  patientIds: string[]
  doctorId: string
  doctorName: string
  specialty: string
  date: string
  time: string
  symptoms: string
  currentDisease: string
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent'
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
    patientIds: [],
    doctorId: '',
    doctorName: '',
    specialty: '',
    date: '',
    time: '',
    symptoms: '',
    currentDisease: '',
    urgencyLevel: 'medium',
    notes: ''
  })
  
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([])
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorsLoading, setDoctorsLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showValidation, setShowValidation] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (patient) {
        setSelectedPatientIds([patient.id])
        setFormData(prev => ({ ...prev, patientIds: [patient.id] }))
      } else {
        // Reset to empty selection for multiple patient selection
        setSelectedPatientIds([])
        setFormData(prev => ({ ...prev, patientIds: [] }))
      }
      setShowValidation(false)
      setValidationErrors([])
      setShowPatientDropdown(false)
      fetchDoctors()
    }
  }, [isOpen, patient, patients]) // eslint-disable-next-line @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps

  // Update validation errors when form data changes
  useEffect(() => {
    if (showValidation) {
      setValidationErrors(getValidationErrors())
    }
  }, [formData, selectedPatientIds, showValidation])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showPatientDropdown && !target.closest('.patient-dropdown')) {
        setShowPatientDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPatientDropdown])

  // Fetch doctors when modal opens
  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true)
      const response = await apiClient.getDoctors()
      setDoctors(response || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setDoctorsLoading(false)
    }
  }

  // Get the currently selected patients
  const selectedPatients = patient ? [patient] : patients.filter(p => selectedPatientIds.includes(p.id))

  // Get current validation errors
  const getValidationErrors = () => {
    const errors: string[] = []
    
    // Check if we have patients (either passed as prop or selected from dropdown)
    const hasValidPatients = patient || (selectedPatientIds.length > 0)
    
    if (!hasValidPatients) {
      errors.push('Please select at least one patient')
    }
    if (!formData.doctorId) {
      errors.push('Please select a doctor')
    }
    if (!formData.date) {
      errors.push('Please select an appointment date')
    }
    if (!formData.time) {
      errors.push('Please select an appointment time')
    }
    if (!formData.symptoms.trim()) {
      errors.push('Please describe the primary symptoms')
    }
    
    return errors
  }

  // Form validation - check if all required fields are filled
  const isFormValid = () => {
    // Check if we have patients (either passed as prop or selected from dropdown)
    const hasValidPatients = patient || (selectedPatientIds.length > 0)
    
    const valid = (
      hasValidPatients && // Patients must be selected
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

  const handlePatientToggle = (patientId: string) => {
    const isSelected = selectedPatientIds.includes(patientId)
    let newSelectedIds: string[]
    
    if (isSelected) {
      newSelectedIds = selectedPatientIds.filter(id => id !== patientId)
    } else {
      newSelectedIds = [...selectedPatientIds, patientId]
    }
    
    setSelectedPatientIds(newSelectedIds)
    setFormData(prev => ({
      ...prev,
      patientIds: newSelectedIds
    }))
  }

  const handleSelectAllPatients = () => {
    if (selectedPatientIds.length === patients.length) {
      // Clear all selections
      setSelectedPatientIds([])
      setFormData(prev => ({ ...prev, patientIds: [] }))
    } else {
      // Select all patients
      const allPatientIds = patients.map(p => p.id)
      setSelectedPatientIds(allPatientIds)
      setFormData(prev => ({ ...prev, patientIds: allPatientIds }))
    }
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
    
    // Validate required fields and show specific error messages
    const hasValidPatients = patient || (selectedPatientIds.length > 0)
    if (!hasValidPatients) {
      alert('Please select at least one patient')
      return
    }
    
    if (!formData.doctorId) {
      alert('Please select a doctor')
      return
    }
    
    if (!formData.date) {
      alert('Please select an appointment date')
      return
    }
    
    if (!formData.time) {
      alert('Please select an appointment time')
      return
    }
    
    if (!formData.symptoms.trim()) {
      alert('Please describe the primary symptoms')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Get the patients to schedule appointments for
      const patientsToSchedule = patient ? [patient] : patients.filter(p => selectedPatientIds.includes(p.id))
      
      console.log(`Scheduling appointments for ${patientsToSchedule.length} patients`)
      
      // Create appointments for each selected patient
      const appointmentPromises = patientsToSchedule.map(async (selectedPatient, index) => {
        // For multiple patients, stagger the time by 15 minutes each
        const baseTime = formData.time
        const [hours, minutes] = baseTime.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + (index * 15) // Add 15 minutes for each additional patient
        const adjustedHours = Math.floor(totalMinutes / 60)
        const adjustedMinutes = totalMinutes % 60
        const adjustedTime = `${adjustedHours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`
        
        // Prepare appointment data for backend
        const appointmentData = {
          patient_id: selectedPatient.id,
          doctor_id: formData.doctorId,
          appointment_date: formData.date,
          appointment_time: patientsToSchedule.length === 1 ? formData.time : adjustedTime,
          symptoms: formData.symptoms,
          reason: formData.currentDisease || formData.symptoms,
          priority: formData.urgencyLevel,
          notes: formData.notes || '',
          is_first_visit: selectedPatient.isFirstTime
        }

        console.log(`Submitting appointment for ${selectedPatient.firstName} ${selectedPatient.lastName}:`, appointmentData)

        // Call backend API to create appointment
        return await apiClient.createAppointment(appointmentData)
      })
      
      // Wait for all appointments to be created
      const responses = await Promise.all(appointmentPromises)
      
      console.log('All appointments created:', responses)
      
      // Call onSuccess callback to refresh data
      onSuccess?.()
      onClose()
    } catch (error: unknown) {
      console.error('Error creating appointment:', error)
      // Optionally, show an error message to the user
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiUser className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Select Patients</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedPatientIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllPatients}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedPatientIds.length === patients.length ? 'Clear All' : 'Select All'}
                </button>
              </div>
            </div>
            
            {/* Custom Dropdown */}
            <div className="relative patient-dropdown">
              <button
                type="button"
                onClick={() => setShowPatientDropdown(!showPatientDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {selectedPatientIds.length === 0
                    ? 'Choose patients'
                    : selectedPatientIds.length === 1
                    ? `${patients.find(p => p.id === selectedPatientIds[0])?.firstName} ${patients.find(p => p.id === selectedPatientIds[0])?.lastName}`
                    : `${selectedPatientIds.length} patients selected`}
                </span>
                <FiChevronDown 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    showPatientDropdown ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {/* Dropdown Content */}
              {showPatientDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {patients.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No patients available
                    </div>
                  ) : (
                    patients.map(p => {
                      const isSelected = selectedPatientIds.includes(p.id)
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handlePatientToggle(p.id)}
                        >
                          <div className="flex items-center justify-center w-5 h-5 mr-3">
                            {isSelected && (
                              <FiCheck className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex items-center flex-1">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3">
                              {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {p.firstName} {p.lastName}
                              </p>
                              <p className="text-xs text-gray-600">{p.email}</p>
                            </div>
                          </div>
                          {p.isFirstTime && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              First Time
                            </span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
            
            {selectedPatientIds.length > 1 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Appointments will be scheduled at 15-minute intervals starting from the selected time.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Selected Patients Summary */}
        {!patient && selectedPatientIds.length > 0 && (
          <div className="px-6 pt-4 pb-2">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Selected Patients ({selectedPatients.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPatients.map(p => (
                  <span
                    key={p.id}
                    className="inline-flex items-center px-3 py-1 bg-white border border-blue-200 rounded-full text-sm"
                  >
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-2"></div>
                    {p.firstName} {p.lastName}
                  </span>
                ))}
              </div>
            </div>
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
                <option value="medium">Medium - Standard appointment</option>
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

          {/* Validation Errors */}
          {(showValidation || !isFormValid()) && getValidationErrors().length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start">
                <FiAlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Please complete the following required fields:
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {getValidationErrors().map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

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
              onClick={() => !isFormValid() && setShowValidation(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Scheduling...
                </div>
              ) : (
                patient 
                  ? 'Schedule Visit' 
                  : selectedPatientIds.length === 1 
                    ? 'Schedule Visit'
                    : selectedPatientIds.length > 1
                      ? `Schedule ${selectedPatientIds.length} Visits`
                      : 'Schedule Visit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
