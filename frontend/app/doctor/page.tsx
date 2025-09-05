'use client'
import React, { useState } from "react";
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiLogOut, FiActivity, FiHeart, FiEye, FiFileText } from "react-icons/fi";
import PatientDetailsModal from "../../components/PatientDetailsModal";

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

// Mock data for doctor's assigned patients and visits
const mockPatients: Patient[] = [
  {
    id: 'patient_1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1-555-0123',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    address: '123 Main St, City, State 12345',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+1-555-0124',
    isFirstTime: false,
    bloodGroup: 'A+',
    allergies: 'Penicillin',
    chronicConditions: 'Hypertension'
  },
  {
    id: 'patient_2',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1-555-0125',
    dateOfBirth: '1978-03-22',
    gender: 'female',
    address: '456 Oak Avenue, City, State 12345',
    emergencyContact: 'Carlos Garcia',
    emergencyPhone: '+1-555-0126',
    isFirstTime: true,
    bloodGroup: 'O-',
    allergies: 'Shellfish',
    chronicConditions: 'Diabetes Type 2'
  },
  {
    id: 'patient_3',
    firstName: 'Robert',
    lastName: 'Smith',
    email: 'robert.smith@email.com',
    phone: '+1-555-0127',
    dateOfBirth: '1965-11-08',
    gender: 'male',
    address: '789 Pine Street, City, State 12345',
    emergencyContact: 'Linda Smith',
    emergencyPhone: '+1-555-0128',
    isFirstTime: false,
    bloodGroup: 'B+',
    allergies: 'None',
    chronicConditions: 'High Cholesterol, Hypertension'
  }
]

const mockVisits: Visit[] = [
  {
    id: 'visit_1',
    patientId: 'patient_1',
    doctorId: 'dr1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: '2025-09-05', // Today's date
    time: '09:00',
    symptoms: 'Chest pain, shortness of breath during exercise',
    currentDisease: 'Cardiac evaluation follow-up',
    urgencyLevel: 'normal',
    status: 'scheduled',
    notes: 'Patient reports symptoms worsening over past week. Previous ECG showed minor irregularities.'
  },
  {
    id: 'visit_2',
    patientId: 'patient_2',
    doctorId: 'dr1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: '2025-09-05', // Today's date
    time: '10:30',
    symptoms: 'Fatigue, dizziness, irregular heartbeat',
    currentDisease: 'First-time cardiac consultation',
    urgencyLevel: 'high',
    status: 'scheduled',
    notes: 'New patient referral from family doctor. Recent episodes of palpitations.'
  },
  {
    id: 'visit_3',
    patientId: 'patient_3',
    doctorId: 'dr1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: '2025-09-05', // Today's date
    time: '14:00',
    symptoms: 'High blood pressure readings at home',
    currentDisease: 'Hypertension management',
    urgencyLevel: 'normal',
    status: 'scheduled',
    notes: 'Regular follow-up for blood pressure management. Patient on Lisinopril.'
  },
  {
    id: 'visit_4',
    patientId: 'patient_1',
    doctorId: 'dr1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: '2025-09-04', // Yesterday - completed
    time: '11:00',
    symptoms: 'Chest pain follow-up',
    currentDisease: 'Post-stress test evaluation',
    urgencyLevel: 'normal',
    status: 'completed',
    notes: 'Stress test results reviewed. No significant abnormalities found.'
  }
]

const mockMedicalHistory: MedicalHistory[] = [
  {
    id: 'history_1',
    patientId: 'patient_1',
    visitId: 'visit_old_1',
    date: '2025-08-15',
    diagnosis: 'Essential Hypertension',
    prescription: 'Lisinopril 10mg daily, lifestyle modifications (low sodium diet, regular exercise)',
    doctorName: 'Dr. Sarah Johnson',
    followUpRequired: true,
    followUpDate: '2025-09-15',
    notes: 'Blood pressure well controlled, continue current medication. Patient compliant with treatment.'
  },
  {
    id: 'history_2',
    patientId: 'patient_1',
    visitId: 'visit_old_2',
    date: '2025-07-20',
    diagnosis: 'Chest Pain - Non-cardiac',
    prescription: 'Ibuprofen 400mg as needed, muscle relaxants',
    doctorName: 'Dr. Sarah Johnson',
    followUpRequired: false,
    notes: 'Musculoskeletal chest pain. ECG and stress test normal. Advised on posture improvement.'
  },
  {
    id: 'history_3',
    patientId: 'patient_3',
    visitId: 'visit_old_3',
    date: '2025-08-01',
    diagnosis: 'Hyperlipidemia, Hypertension',
    prescription: 'Atorvastatin 20mg daily, Amlodipine 5mg daily',
    doctorName: 'Dr. Sarah Johnson',
    followUpRequired: true,
    followUpDate: '2025-10-01',
    notes: 'Cholesterol levels improved. Blood pressure under control. Continue current regimen.'
  },
  {
    id: 'history_4',
    patientId: 'patient_3',
    visitId: 'visit_old_4',
    date: '2025-06-15',
    diagnosis: 'Coronary Artery Disease - Stable',
    prescription: 'Metoprolol 50mg twice daily, Aspirin 81mg daily, Clopidogrel 75mg daily',
    doctorName: 'Dr. Sarah Johnson',
    followUpRequired: true,
    followUpDate: '2025-09-15',
    notes: 'Post-angioplasty follow-up. Stent patent. No chest pain. Exercise tolerance improved.'
  },
  {
    id: 'history_5',
    patientId: 'patient_2',
    visitId: 'visit_old_5',
    date: '2025-08-25',
    diagnosis: 'Type 2 Diabetes - Newly Diagnosed',
    prescription: 'Metformin 500mg twice daily, dietary counseling',
    doctorName: 'Dr. Michael Brown',
    followUpRequired: true,
    followUpDate: '2025-09-25',
    notes: 'HbA1c 8.2%. Started on Metformin. Referred to nutritionist. Blood sugar monitoring initiated.'
  }
]

export default function DoctorDashboard() {
  const [patients] = useState<Patient[]>(mockPatients)
  const [visits, setVisits] = useState<Visit[]>(mockVisits)
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>(mockMedicalHistory)
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)

  const handleViewPatient = (patient: Patient, visit: Visit) => {
    setSelectedPatient(patient)
    setSelectedVisit(visit)
    setIsPatientModalOpen(true)
  }

  const handleSavePrescription = (prescriptionData: any) => {
    // Add to medical history
    const newMedicalRecord: MedicalHistory = {
      id: `history_${Date.now()}`,
      patientId: prescriptionData.patientId,
      visitId: prescriptionData.visitId,
      date: prescriptionData.date,
      diagnosis: prescriptionData.diagnosis,
      prescription: prescriptionData.prescriptions.map((p: any) => 
        `${p.medication} ${p.dosage} - ${p.frequency} for ${p.duration}${p.instructions ? ` (${p.instructions})` : ''}`
      ).join('; '),
      doctorName: prescriptionData.doctorName,
      followUpRequired: prescriptionData.followUpRequired,
      followUpDate: prescriptionData.followUpDate,
      notes: prescriptionData.treatmentNotes
    }
    
    setMedicalHistory([...medicalHistory, newMedicalRecord])
    
    // Mark visit as completed
    setVisits(visits.map(v => 
      v.id === prescriptionData.visitId ? { ...v, status: 'completed' as const } : v
    ))
  }

  // Calculate stats
  const totalPatients = patients.length
  const todayAppointments = visits.filter(v => 
    v.date === new Date().toISOString().split('T')[0] && v.status === 'scheduled'
  ).length
  const completedToday = visits.filter(v => 
    v.date === new Date().toISOString().split('T')[0] && v.status === 'completed'
  ).length
  const pendingVisits = visits.filter(v => v.status === 'scheduled').length

  // Get today's visits with patient information
  const todayVisitsWithPatients = visits
    .filter(v => v.date === new Date().toISOString().split('T')[0])
    .map(visit => {
      const patient = patients.find(p => p.id === visit.patientId)
      return { ...visit, patient }
    })
    .filter(visit => visit.patient)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl mr-3">
                <FiHeart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  HealthPal
                </h1>
                <p className="text-sm text-gray-600">Doctor Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl">
                <span className="text-sm font-medium text-blue-700">Dr. Sarah Johnson (Cardiology)</span>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2">
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Welcome, Dr. Sarah Johnson
          </h1>
          <p className="text-gray-600">Cardiology • Today's Schedule & Patient Management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 fade-in stagger-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 fade-in stagger-2">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <FiCalendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 fade-in stagger-3">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FiCheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">{completedToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 fade-in stagger-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingVisits}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Patients */}
          <div className="hover:scale-105 transition-transform duration-300 fade-in stagger-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-3">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Today's Patients</h2>
                  <p className="text-sm text-gray-600">Scheduled appointments for today</p>
                </div>
              </div>
              
              {todayVisitsWithPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FiCalendar size={24} />
                  </div>
                  <p className="text-sm font-medium">No appointments scheduled for today</p>
                  <p className="text-xs text-gray-400 mt-1">Enjoy your free time!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayVisitsWithPatients.map((visit) => (
                    <div key={visit.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                            {visit.patient!.firstName[0]}{visit.patient!.lastName[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {visit.patient!.firstName} {visit.patient!.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{visit.time} • {visit.currentDisease}</p>
                            <div className="flex items-center mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                visit.patient!.isFirstTime 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {visit.patient!.isFirstTime ? 'First Time' : 'Returning'}
                              </span>
                              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                visit.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                                visit.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {visit.urgencyLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewPatient(visit.patient!, visit)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View Patient Details"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => handleViewPatient(visit.patient!, visit)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="Add Prescription"
                          >
                            <FiFileText size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-sm text-gray-700">
                          <strong>Symptoms:</strong> {visit.symptoms}
                        </p>
                        {visit.notes && (
                          <p className="text-sm text-gray-700 mt-1">
                            <strong>Notes:</strong> {visit.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Time Slots */}
          <div className="hover:scale-105 transition-transform duration-300 fade-in stagger-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-3">
                  <FiClock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Available Time Slots</h2>
                  <p className="text-sm text-gray-600">Your availability for appointments</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "09:00",
                  "10:00", 
                  "11:00",
                  "14:00",
                  "15:00",
                ].map((time, index) => (
                  <div
                    key={time}
                    className={`bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200 fade-in stagger-${(index % 3) + 1}`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <FiClock className="text-green-600 mr-2" size={18} />
                      <p className="font-bold text-green-700">{time}</p>
                    </div>
                    <p className="text-xs text-green-600 font-medium">Available</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patient={selectedPatient}
        visit={selectedVisit}
        medicalHistory={medicalHistory.filter(h => h.patientId === selectedPatient?.id)}
        onSavePrescription={handleSavePrescription}
      />
    </div>
  );
}
