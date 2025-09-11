'use client'
import React, { useState } from 'react'
import { FiX, FiUser, FiCalendar, FiFileText, FiClock, FiHeart, FiAlertCircle } from 'react-icons/fi'

interface Patient {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  isFirstTime: boolean
  bloodGroup?: string
  allergies?: string
  chronicConditions?: string
}

interface Visit {
  id: string
  patientId: string
  date: string
  time: string
  symptoms: string
  currentDisease: string
  urgencyLevel: string
  notes?: string
  status: 'scheduled' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'
}

interface MedicalHistory {
  id: string
  patientId: string
  visitId: string
  date: string
  diagnosis: string
  prescription: string
  doctorName: string
  followUpRequired: boolean
  followUpDate?: string
  notes?: string
}

interface Prescription {
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface PatientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
  visit: Visit | null
  medicalHistory: MedicalHistory[]
  onSavePrescription: (prescription: any) => void
}

export default function PatientDetailsModal({ 
  isOpen, 
  onClose, 
  patient, 
  visit, 
  medicalHistory, 
  onSavePrescription 
}: PatientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'prescription'>('details')
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ])
  const [diagnosis, setDiagnosis] = useState('')
  const [treatmentNotes, setTreatmentNotes] = useState('')
  const [followUpRequired, setFollowUpRequired] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addPrescription = () => {
    setPrescriptions([...prescriptions, { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }])
  }

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = prescriptions.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    )
    setPrescriptions(updated)
  }

  const handleSavePrescription = async () => {
    if (!patient || !visit) return
    
    setIsLoading(true)
    
    try {
      const prescriptionData = {
        id: `prescription_${Date.now()}`,
        patientId: patient.id,
        visitId: visit.id,
        date: new Date().toISOString().split('T')[0],
        diagnosis,
        prescriptions: prescriptions.filter(p => p.medication.trim() !== ''),
        treatmentNotes,
        followUpRequired,
        followUpDate: followUpRequired ? followUpDate : undefined,
        doctorName: 'Dr. Sarah Johnson' // This should come from logged in doctor
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onSavePrescription(prescriptionData)
      
      // Reset form
      setPrescriptions([{ medication: '', dosage: '', frequency: '', duration: '', instructions: '' }])
      setDiagnosis('')
      setTreatmentNotes('')
      setFollowUpRequired(false)
      setFollowUpDate('')
      
      onClose()
    } catch (error) {
      console.error('Error saving prescription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !patient || !visit) return null

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mr-3">
              <FiUser className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-sm text-gray-600">Patient Details & Medical Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'details'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiUser size={16} />
            Patient Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiFileText size={16} />
            Medical History
          </button>
          <button
            onClick={() => setActiveTab('prescription')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'prescription'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FiHeart size={16} />
            Add Prescription
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Patient Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Current Visit Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Visit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium">{visit.date} at {visit.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      visit.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {visit.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Disease/Condition</p>
                    <p className="font-medium">{visit.currentDisease}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Urgency Level</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      visit.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                      visit.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      visit.urgencyLevel === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {visit.urgencyLevel}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Symptoms</p>
                  <p className="font-medium">{visit.symptoms}</p>
                </div>
                {visit.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Additional Notes</p>
                    <p className="font-medium">{visit.notes}</p>
                  </div>
                )}
              </div>

              {/* Patient Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium">{calculateAge(patient.dateOfBirth)} years old</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium capitalize">{patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium">{patient.email}</p>
                      <p className="font-medium">{patient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Patient Type</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        patient.isFirstTime 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {patient.isFirstTime ? 'First Time Patient' : 'Returning Patient'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-medium">{patient.bloodGroup || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Known Allergies</p>
                      <p className="font-medium">{patient.allergies || 'None reported'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chronic Conditions</p>
                      <p className="font-medium">{patient.chronicConditions || 'None reported'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Medical History</h3>
              
              {patient.isFirstTime ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUser size={24} className="text-green-600" />
                  </div>
                  <p className="text-gray-600 font-medium">First Time Patient</p>
                  <p className="text-sm text-gray-500">No previous medical history available</p>
                </div>
              ) : medicalHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiFileText size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No Medical History</p>
                  <p className="text-sm text-gray-500">No previous records found for this patient</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalHistory.map((record) => (
                    <div key={record.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <FiCalendar className="text-blue-500 mr-2" size={16} />
                          <span className="font-medium">{record.date}</span>
                        </div>
                        <span className="text-sm text-gray-600">Dr. {record.doctorName}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Diagnosis</p>
                          <p className="font-medium">{record.diagnosis}</p>
                        </div>
                        {record.followUpRequired && (
                          <div>
                            <p className="text-sm text-gray-600">Follow-up Date</p>
                            <p className="font-medium">{record.followUpDate}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Prescription</p>
                        <p className="font-medium">{record.prescription}</p>
                      </div>
                      
                      {record.notes && (
                        <div>
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="font-medium">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prescription Tab */}
          {activeTab === 'prescription' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Prescription</h3>
              
              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis *</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter diagnosis"
                  required
                />
              </div>

              {/* Prescriptions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Medications</label>
                  <button
                    type="button"
                    onClick={addPrescription}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Add Medication
                  </button>
                </div>
                
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Medication {index + 1}</h4>
                      {prescriptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePrescription(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Medication Name</label>
                        <input
                          type="text"
                          value={prescription.medication}
                          onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Amoxicillin"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Dosage</label>
                        <input
                          type="text"
                          value={prescription.dosage}
                          onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Frequency</label>
                        <input
                          type="text"
                          value={prescription.frequency}
                          onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 3 times daily"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Duration</label>
                        <input
                          type="text"
                          value={prescription.duration}
                          onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 7 days"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm text-gray-600 mb-1">Instructions</label>
                      <textarea
                        value={prescription.instructions}
                        onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="e.g., Take with food, avoid alcohol"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Treatment Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Notes</label>
                <textarea
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Additional treatment notes and recommendations"
                />
              </div>

              {/* Follow-up */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="followUp"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <label htmlFor="followUp" className="ml-2 text-sm font-medium text-gray-700">
                    Follow-up appointment required
                  </label>
                </div>
                
                {followUpRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={handleSavePrescription}
                  disabled={isLoading || !diagnosis.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Prescription & Complete Visit'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
