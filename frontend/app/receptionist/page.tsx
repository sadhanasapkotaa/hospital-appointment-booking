'use client'
import React, { useState } from "react";
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiLogOut, FiFilter, FiSearch, FiHeart, FiTrash2, FiPlus, FiUserPlus, FiEdit3 } from "react-icons/fi";
import AddPatientModal from "../../components/AddPatientModal";
import AssignVisitModal from "../../components/AssignVisitModal";

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

// Initial mock data
const initialPatients: Patient[] = [
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
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phone: '+1-555-0125',
    dateOfBirth: '1990-03-22',
    gender: 'female',
    address: '456 Oak Ave, City, State 12345',
    emergencyContact: 'Robert Smith',
    emergencyPhone: '+1-555-0126',
    isFirstTime: true,
    bloodGroup: 'O-',
    allergies: 'None',
    chronicConditions: 'None'
  }
]

const initialVisits: Visit[] = [
  {
    id: 'visit_1',
    patientId: 'patient_1',
    doctorId: 'dr1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: '2025-09-01',
    time: '10:00',
    symptoms: 'Chest pain, shortness of breath',
    currentDisease: 'Regular checkup',
    urgencyLevel: 'normal',
    status: 'scheduled'
  },
  {
    id: 'visit_2',
    patientId: 'patient_2',
    doctorId: 'dr2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Dermatology',
    date: '2025-09-02',
    time: '14:00',
    symptoms: 'Skin rash, itching',
    currentDisease: 'Skin consultation',
    urgencyLevel: 'normal',
    status: 'scheduled'
  }
]

export default function ReceptionistDashboard() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)
  const [visits, setVisits] = useState<Visit[]>(initialVisits)
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false)
  const [isAssignVisitModalOpen, setIsAssignVisitModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const handleAddPatient = (newPatient: Patient) => {
    setPatients([...patients, newPatient])
  }

  const handleAssignVisit = (newVisit: Visit) => {
    setVisits([...visits, newVisit])
  }

  const handleAssignVisitClick = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsAssignVisitModalOpen(true)
  }

  const handleDeleteVisit = (visitId: string) => {
    setVisits(visits.filter(v => v.id !== visitId))
  }

  const handleCompleteVisit = (visitId: string) => {
    setVisits(visits.map(v => 
      v.id === visitId ? { ...v, status: 'completed' as const } : v
    ))
  }

  // Get visit data with patient information
  const visitsWithPatients = visits.map(visit => {
    const patient = patients.find(p => p.id === visit.patientId)
    return { ...visit, patient }
  }).filter(visit => visit.patient) // Only include visits with valid patients

  // Filter visits based on search and filters
  const filteredVisits = visitsWithPatients.filter(visit => {
    const matchesSearch = 
      visit.patient!.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.patient!.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter
    
    const today = new Date().toISOString().split('T')[0]
    const matchesDate = 
      dateFilter === 'all' ||
      (dateFilter === 'today' && visit.date === today) ||
      (dateFilter === 'thisweek' && new Date(visit.date) >= new Date()) ||
      (dateFilter === 'thismonth' && new Date(visit.date).getMonth() === new Date().getMonth())
    
    return matchesSearch && matchesStatus && matchesDate
  })

  // Calculate stats
  const totalAppointments = visits.length
  const pendingAppointments = visits.filter(v => v.status === 'scheduled').length
  const completedToday = visits.filter(v => 
    v.status === 'completed' && v.date === new Date().toISOString().split('T')[0]
  ).length
  const todayAppointments = visits.filter(v => 
    v.date === new Date().toISOString().split('T')[0]
  ).length

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
                <p className="text-sm text-gray-600">Receptionist Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl">
                <span className="text-sm font-medium text-blue-700">Mary Wilson (Receptionist)</span>
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
            Receptionist Dashboard
          </h1>
          <p className="text-gray-600">Manage patients, appointments and doctor schedules</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 fade-in">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setIsAddPatientModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <FiUserPlus size={18} />
              <span>Add New Patient</span>
            </button>
            <button
              onClick={() => {
                if (patients.length === 0) {
                  alert('Please add a patient first')
                  return
                }
                setSelectedPatient(null) // Allow patient selection in modal
                setIsAssignVisitModalOpen(true)
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <FiCalendar size={18} />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 fade-in stagger-1">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FiCalendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 fade-in stagger-2">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <FiClock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{pendingAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 fade-in stagger-3">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
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
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Management Section */}
        <div className="mb-8 hover:scale-105 transition-transform duration-300 fade-in stagger-3">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-3">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Patient Management</h2>
                <p className="text-sm text-gray-600">Quick actions for patient scheduling</p>
              </div>
            </div>

            {patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FiUsers size={24} />
                </div>
                <p className="text-sm font-medium">No patients registered</p>
                <p className="text-xs text-gray-400 mt-1">Add patients to start scheduling visits</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((patient) => (
                  <div key={patient.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className="text-xs text-gray-600">{patient.email}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                            patient.isFirstTime 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {patient.isFirstTime ? 'First Time' : 'Returning'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignVisitClick(patient)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                        title="Schedule Visit"
                      >
                        <FiCalendar size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Appointment Management */}
        <div className="hover:scale-105 transition-transform duration-300 fade-in stagger-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-3">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Appointment Management</h2>
                <p className="text-sm text-gray-600">Review and manage all patient appointments</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-8">
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search patients, doctors, or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full pl-12 pr-4 py-3"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FiFilter className="text-gray-400" size={16} />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-gray-400" size={16} />
                  <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="thisweek">This Week</option>
                    <option value="thismonth">This Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Doctor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Specialty</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Condition</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVisits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FiCalendar className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-500 font-medium">No appointments found</p>
                          <p className="text-sm text-gray-400">
                            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                              ? 'Try adjusting your search or filters'
                              : 'Add patients and schedule visits to get started'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVisits.map((visit, index) => (
                      <tr key={visit.id} className="bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200 fade-in stagger-1">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {visit.patient!.firstName[0]}{visit.patient!.lastName[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {visit.patient!.firstName} {visit.patient!.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {visit.patient!.isFirstTime ? 'First Time' : 'Returning'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{visit.doctorName}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                            {visit.specialty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center mb-1">
                            <FiCalendar className="mr-2 text-gray-400" size={14} />
                            {visit.date}
                          </div>
                          <div className="flex items-center">
                            <FiClock className="mr-2 text-gray-400" size={14} />
                            {visit.time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            visit.status === 'completed' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                            visit.status === 'scheduled' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' :
                            'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                          }`}>
                            {visit.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{visit.currentDisease}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {visit.status === 'scheduled' && (
                              <button 
                                onClick={() => handleCompleteVisit(visit.id)}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-110 bg-green-100 text-green-600 hover:bg-green-200" 
                                title="Complete"
                              >
                                <FiCheckCircle size={16} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleAssignVisitClick(visit.patient!)}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 bg-blue-100 text-blue-600 hover:bg-blue-200" 
                              title="Reschedule"
                            >
                              <FiClock size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteVisit(visit.id)}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 bg-red-100 text-red-600 hover:bg-red-200" 
                              title="Cancel"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSave={handleAddPatient}
      />

      <AssignVisitModal
        isOpen={isAssignVisitModalOpen}
        onClose={() => setIsAssignVisitModalOpen(false)}
        patient={selectedPatient}
        patients={patients} // Pass all patients for selection
        onSave={handleAssignVisit}
      />
    </div>
  );
}