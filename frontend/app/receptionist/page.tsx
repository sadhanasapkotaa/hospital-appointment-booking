'use client';
import React, { useState } from "react";
import { FiCalendar, FiClock, FiCheckCircle, FiUser, FiEdit3, FiTrash2, FiSearch, FiFilter, FiLogOut, FiHeart, FiUserPlus, FiMapPin, FiUserCheck } from "react-icons/fi";
import AddPatientModal from "../../components/AddPatientModal";
import ScheduleVisit from "../../components/ScheduleVisit";
import { authHelpers, apiClient, Appointment } from '../api/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TimerManager } from '../utils/timerUtils';

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
  status: 'scheduled' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'
}

export default function ReceptionistDashboard() {
  // Sample data - this would normally come from an API
  const appointmentsData: Appointment[] = [
    {
      id: 1,
      patient_name: "John Doe",
      patient_email: "john@email.com", 
      patient_phone: "+1234567890",
      doctor_name: "Dr. Sarah Johnson",
      doctor_specialization: "Cardiology",
      appointment_date: "2024-03-15",
      appointment_time: "10:00",
      status: "confirmed",
      priority: "medium",
      symptoms: "Chest pain",
      is_first_visit: false,
      created_at: "2024-03-10T09:00:00Z"
    }
  ];

  // Example mapping logic (adjust as needed for your Visit type)
  const visitsData = appointmentsData.map((appointment) => ({
    id: appointment.id.toString(),
    patientId: appointment.patient_name || '',
    doctorId: appointment.doctor_name || '',
    doctorName: appointment.doctor_name || 'Dr. Unknown',
    specialty: appointment.doctor_specialization || 'General',
    date: appointment.appointment_date,
    time: appointment.appointment_time,
    symptoms: appointment.symptoms || '',
    currentDisease: appointment.symptoms || '',
    urgencyLevel: appointment.priority,
    notes: appointment.notes || '',
    // Map 'confirmed' to 'scheduled' if needed, otherwise use appointment.status
    status: appointment.status === 'confirmed' ? 'scheduled' : appointment.status,
  }));
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false)
  const [isScheduleVisitModalOpen, setIsScheduleVisitModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(true)
  const [error, setError] = useState('')
  const [appointmentsError, setAppointmentsError] = useState('')

  // Logout handler
  const handleLogout = async () => {
    try {
      await authHelpers.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        router.push('/login')
      }
    }
  }

  // Fetch data from backend
  const fetchData = async () => {
    // Fetch patients
    try {
      setIsLoading(true)
      const response = await apiClient.getPatients()
      setPatients(response.patients || [])
      setError('')
    } catch (err: unknown) {
      console.error('Error fetching patients:', err)
      setError('Failed to load patients')
    } finally {
      setIsLoading(false)
    }

    // Fetch appointments
    try {
      setIsAppointmentsLoading(true)
      const appointmentsResponse = await apiClient.getAppointments()
      
      // Handle both array and object responses
      // appointmentsResponse is now properly typed as Appointment[]
      const appointmentsData = Array.isArray(appointmentsResponse) ? appointmentsResponse : []
      
      const visitsData = appointmentsData.map((appointment: Appointment) => ({
        id: appointment.id.toString(),
        patientId: appointment.patient_name || '',
        doctorId: appointment.doctor_name || '',
        doctorName: appointment.doctor_name || 'Dr. Unknown',
        specialty: appointment.doctor_specialization || 'General',
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        symptoms: appointment.symptoms || '',
        currentDisease: appointment.symptoms || '',
        urgencyLevel: appointment.priority || 'medium',
        notes: appointment.notes || '',
        status: appointment.status === 'confirmed' ? 'scheduled' : (
          ['scheduled', 'completed', 'cancelled', 'arrived', 'in_progress'].includes(appointment.status)
            ? appointment.status as Visit["status"]
            : 'scheduled'
        )
      }))
      
      setVisits(visitsData)
      setAppointmentsError('')
    } catch (err: unknown) {
      console.error('Error fetching appointments:', err)
      setAppointmentsError('Failed to load appointments')
    } finally {
      setIsAppointmentsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddPatient = (newPatient: Patient) => {
    setPatients([...patients, newPatient])
  }

  const handleAssignVisitClick = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsScheduleVisitModalOpen(true)
  }

  const handleDeleteVisit = (visitId: string) => {
    setVisits(visits.filter(v => v.id !== visitId))
  }

  const handleCompleteVisit = (visitId: string) => {
    setVisits(visits.map(v => 
      v.id === visitId ? { ...v, status: 'completed' as const } : v
    ))
  }

  const handleMarkAsArrived = (visitId: string) => {
    setVisits(visits.map(v => {
      if (v.id === visitId) {
        // Start the timer when marking as arrived
        const patient = patients.find(p => p.id === v.patientId)
        if (patient) {
          TimerManager.startTimer(
            visitId,
            v.patientId,
            `${patient.firstName} ${patient.lastName}`,
            v.doctorId,
            v.doctorName
          )
        }
        return { ...v, status: 'arrived' as const }
      }
      return v
    }))
  }

  const handleCancelVisit = (visitId: string) => {
    setVisits(visits.map(v =>
      v.id === visitId ? { ...v, status: 'cancelled' as const } : v
    ))
  }

  // Get visit data with patient information
  const visitsWithPatients = visits.map(visit => {
    // Try to match patient by various ID formats
    let patient = patients.find(p => p.id === visit.patientId)
    if (!patient) {
      patient = patients.find(p => p.id.toString() === visit.patientId.toString())
    }
    

    
    // If no patient found, create a placeholder to still show the appointment
    if (!patient && visit.patientId) {
      patient = {
        id: visit.patientId,
        firstName: 'Unknown',
        lastName: 'Patient',
        email: 'unknown@email.com',
        phone: 'N/A',
        dateOfBirth: '',
        gender: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        isFirstTime: false
      }
    }
    
    return { ...visit, patient }
  }).filter(visit => visit.patient) // Only include visits with valid patients
  
  console.log('Visits with patients:', visitsWithPatients.length, 'out of', visits.length, 'visits') // Debug log

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
  const arrivedAppointments = visits.filter(v => v.status === 'arrived').length
  const completedToday = visits.filter(v => 
    v.status === 'completed' && v.date === new Date().toISOString().split('T')[0]
  ).length
  const todayAppointments = visits.filter(v => 
    v.date === new Date().toISOString().split('T')[0]
  ).length

  // Function to get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'arrived':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

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
              <button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
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
          <div className="flex flex-wrap gap-4 mb-4">
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
                setIsScheduleVisitModalOpen(true)
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <FiCalendar size={18} />
              <span>Schedule Visits</span>
            </button>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            {/* <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> You can now schedule appointments for multiple patients at once! 
              Use "Schedule Visits" to select multiple patients, or click the calendar icon on individual patient cards for single appointments.
            </p> */}
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
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FiUserCheck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Arrived Patients</p>
                <p className="text-2xl font-bold text-gray-900">{arrivedAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 fade-in stagger-4">
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
        </div>

        {/* Patient Management Section */}
        <div className="mb-8 hover:scale-105 transition-transform duration-300 fade-in stagger-3">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-3">
                <FiUser className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Patient Management</h2>
                <p className="text-sm text-gray-600">Schedule visits for individual patients or multiple patients at once</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-sm text-gray-600">Loading patients...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4">
                  <FiUser size={24} />
                </div>
                <p className="text-sm font-medium">{error}</p>
                <p className="text-xs text-red-400 mt-1">Please try again later</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FiUser size={24} />
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
                        title="Schedule Visit for this Patient"
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
                <FiUser className="h-6 w-6 text-white" />
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

            {/* Loading and Error States */}
            {isAppointmentsLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-sm text-gray-600">Loading appointments...</p>
              </div>
            )}

            {appointmentsError && !isAppointmentsLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4">
                  <FiCalendar size={24} />
                </div>
                <p className="text-sm font-medium">{appointmentsError}</p>
                <p className="text-xs text-red-400 mt-1">Please try again later</p>
              </div>
            )}

            {/* Table */}
            {!isAppointmentsLoading && !appointmentsError && (
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
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(visit.status)}`}>
                            {visit.status === 'in_progress' ? 'In Progress' : 
                             visit.status === 'arrived' ? 'Arrived' :
                             visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{visit.currentDisease}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {visit.status === 'scheduled' && (
                              <button 
                                onClick={() => handleMarkAsArrived(visit.id)}
                                className="p-2 rounded-lg transition-all duration-200 hover:scale-110 bg-blue-100 text-blue-600 hover:bg-blue-200" 
                                title="Mark as Arrived"
                              >
                                <FiUserCheck size={16} />
                              </button>
                            )}
                            {(visit.status === 'scheduled' || visit.status === 'arrived') && (
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
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 bg-purple-100 text-purple-600 hover:bg-purple-200" 
                              title="Reschedule"
                            >
                              <FiEdit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleCancelVisit(visit.id)}
                              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 bg-gray-100 text-gray-600 hover:bg-gray-200" 
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
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSave={handleAddPatient}
        onSuccess={fetchData} // Refresh data after successful patient creation
      />

      <ScheduleVisit
        isOpen={isScheduleVisitModalOpen}
        onClose={() => setIsScheduleVisitModalOpen(false)}
        patient={selectedPatient}
        patients={patients} // Pass all patients for selection
        onSuccess={fetchData} // Refresh data after successful appointment creation
      />
    </div>
  );
}