'use client'
import React, { useState, useEffect } from 'react'
import { FaUser, FaClock, FaCalendarCheck, FaStethoscope, FaPlay, FaPause, FaStop } from 'react-icons/fa'
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiLogOut, FiActivity, FiHeart, FiEye, FiFileText, FiPlay, FiPause, FiUserCheck, FiSquare } from "react-icons/fi"
import PatientDetailsModal from '@/components/PatientDetailsModal'
import { apiClient, authHelpers } from '../api/api'
import { useRouter } from 'next/navigation'

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



export default function DoctorDashboard() {
  const router = useRouter()
  const [doctor, setDoctor] = useState<{ id: number, name: string, specialization: string, email: string } | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    arrivedPatients: 0,
    completedToday: 0
  })
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [activeTimer, setActiveTimer] = useState<string | null>(null)
  const [timerSeconds, setTimerSeconds] = useState<{[key: string]: number}>({})
  const [showTimeAlert, setShowTimeAlert] = useState<string | null>(null)
  const [autoStartedTimers, setAutoStartedTimers] = useState<Set<string>>(new Set())

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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getDoctorDashboard()
        
        setDoctor(data.doctor || null)
        setPatients(data.patients || [])
        setVisits(data.visits || [])
        setMedicalHistory(data.medicalHistory || [])
        setStats(data.stats || {
          totalPatients: 0,
          todayAppointments: 0,
          arrivedPatients: 0,
          completedToday: 0
        })
        
        // Log data for debugging
        console.log('Doctor dashboard data loaded successfully:', {
          doctor: data.doctor?.name,
          appointmentsCount: data.visits?.length || 0,
          patientsCount: data.patients?.length || 0
        })
        
        setError('')
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
        // Fall back to empty state instead of mock data
        setDoctor(null)
        setPatients([])
        setVisits([])
        setMedicalHistory([])
        setStats({
          totalPatients: 0,
          todayAppointments: 0,
          arrivedPatients: 0,
          completedToday: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000) // Poll every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const handleViewPatient = (patient: Patient, visit: Visit) => {
    setSelectedPatient(patient)
    setSelectedVisit(visit)
    setIsPatientModalOpen(true)
  }

  // Update appointment status
  const updateAppointmentStatus = async (visitId: string, newStatus: string, notes?: string) => {
    try {
      await apiClient.updateAppointmentStatus(parseInt(visitId), newStatus, notes)
      
      // Update local state
      setVisits(visits.map(visit => 
        visit.id === visitId ? { ...visit, status: newStatus as any, notes: notes || visit.notes } : visit
      ))
    } catch (error) {
      console.error('Error updating appointment status:', error)
      setError('Failed to update appointment status')
    }
  }

    const handleSavePrescription = async (prescriptionData: any) => {
    try {
      // Format prescriptions into a single string
      const prescriptionText = prescriptionData.prescriptions.map((p: any) => 
        `${p.medication} ${p.dosage} - ${p.frequency} for ${p.duration}${p.instructions ? ` (${p.instructions})` : ''}`
      ).join('; ')
      
      // Save medical record to backend
      await apiClient.createMedicalRecord({
        appointment: parseInt(prescriptionData.visitId),
        diagnosis: prescriptionData.diagnosis,
        prescription: prescriptionText,
        doctor_notes: prescriptionData.treatmentNotes,
        follow_up_date: prescriptionData.followUpRequired ? prescriptionData.followUpDate : null
      })
      
      // Update appointment status to completed
      await updateAppointmentStatus(prescriptionData.visitId, 'completed', prescriptionData.treatmentNotes)
      
      // Stop timer if active
      if (activeTimer === prescriptionData.visitId) {
        setActiveTimer(null)
      }
      
      // Refresh dashboard data to show updated records
      const data = await apiClient.getDoctorDashboard()
      setDoctor(data.doctor || null)
      setPatients(data.patients || [])
      setVisits(data.visits || [])
      setMedicalHistory(data.medicalHistory || [])
      setStats(data.stats || {
        totalPatients: 0,
        todayAppointments: 0,
        arrivedPatients: 0,
        completedToday: 0
      })
      
    } catch (error) {
      console.error('Error saving prescription:', error)
      setError('Failed to save prescription. Please try again.')
    }
  }

  // Timer functions
  const startTimer = (visitId: string) => {
    setActiveTimer(visitId)
    setTimerSeconds(prev => ({ ...prev, [visitId]: prev[visitId] || 0 }))
    
    // Mark visit as in progress
    setVisits(visits.map(v => 
      v.id === visitId ? { ...v, status: 'in_progress' as const } : v
    ))
  }

  const pauseTimer = () => {
    setActiveTimer(null)
  }

  const resetTimer = (visitId: string) => {
    setTimerSeconds(prev => ({ ...prev, [visitId]: 0 }))
    setActiveTimer(null)
    setShowTimeAlert(null)
  }

  // Auto-start timer when appointment status changes to "arrived"
  useEffect(() => {
    visits.forEach(visit => {
      if (visit.status === 'arrived' && !activeTimer && !timerSeconds[visit.id] && !autoStartedTimers.has(visit.id)) {
        console.log(`Auto-starting timer for arrived patient: ${visit.id}`)
        setActiveTimer(visit.id)
        setTimerSeconds(prev => ({ ...prev, [visit.id]: 0 }))
        setAutoStartedTimers(prev => new Set(prev).add(visit.id))
        
        // Show auto-start notification
        const patient = patients.find(p => p.id === visit.patientId)
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Patient'
        alert(`Timer automatically started for ${patientName} (15 minutes)`)
        
        // Also mark as in_progress
        setVisits(prevVisits => 
          prevVisits.map(v => 
            v.id === visit.id ? { ...v, status: 'in_progress' as const } : v
          )
        )
      }
    })
  }, [visits, activeTimer, timerSeconds, autoStartedTimers, patients])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const newSeconds = (prev[activeTimer] || 0) + 1
          
          // Show alert at 15 minutes (900 seconds)
          if (newSeconds === 900) {
            setShowTimeAlert(activeTimer)
            setTimeout(() => setShowTimeAlert(null), 5000) // Hide after 5 seconds
          }
          
          return { ...prev, [activeTimer]: newSeconds }
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeTimer])

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Format countdown timer (15 minutes = 900 seconds)
  const formatCountdown = (seconds: number) => {
    const remainingSeconds = Math.max(0, 900 - seconds) // 15 minutes countdown
    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get progress percentage for timer
  const getTimerProgress = (seconds: number) => {
    return Math.min((seconds / 900) * 100, 100) // 900 seconds = 15 minutes
  }

  // Function to get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'arrived':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Use stats from backend or calculate from local data if needed
  const totalPatients = stats.totalPatients || patients.length
  const todayAppointments = stats.todayAppointments || visits.filter(v => 
    v.date === new Date().toISOString().split('T')[0]
  ).length
  const waitingRoomCount = stats.arrivedPatients || visits.filter(v => 
    v.date === new Date().toISOString().split('T')[0] && ['scheduled', 'confirmed'].includes(v.status)
  ).length
  const completedToday = stats.completedToday || visits.filter(v => 
    v.date === new Date().toISOString().split('T')[0] && v.status === 'completed'
  ).length

  // Get all visits with patient information
  const allVisitsWithPatients = visits
    .map(visit => {
      const patient = patients.find(p => p.id === visit.patientId)
      return { ...visit, patient }
    })
    .filter(visit => visit.patient)
    .sort((a, b) => {
      // Sort by date (most recent first), then by time
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateComparison !== 0) return dateComparison
      return a.time.localeCompare(b.time)
    })

  // Get today's visits for statistics
  const todayVisitsWithPatients = allVisitsWithPatients.filter(v => 
    v.date === new Date().toISOString().split('T')[0]
  )

  // Separate all appointments by status
  const pendingAppointments = allVisitsWithPatients.filter(v => 
    ['scheduled', 'confirmed'].includes(v.status)
  )
  const completedAppointments = allVisitsWithPatients.filter(v => 
    v.status === 'completed'
  )
  const cancelledAppointments = allVisitsWithPatients.filter(v => 
    ['cancelled', 'no_show'].includes(v.status)
  )

  // Get waiting room patients (arrived status - if this status exists)
  const waitingRoomPatients = todayVisitsWithPatients.filter(v => v.status === 'arrived')

  // Helper function to format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today'
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow'
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
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
                <p className="text-sm text-gray-600">Doctor Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl">
                <span className="text-sm font-medium text-blue-700">
                  {doctor ? `${doctor.name} (${doctor.specialization})` : 'Loading...'}
                </span>
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
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <span className="ml-4 text-lg text-gray-600">Loading dashboard...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Error loading dashboard</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Welcome, {doctor ? doctor.name : 'Doctor'}
          </h1>
          <p className="text-gray-600">
            {doctor ? `${doctor.specialization} • Today's Schedule & Patient Management` : 'Today\'s Schedule & Patient Management'}
          </p>
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
              <div className={`p-3 rounded-xl shadow-lg ${
                activeTimer ? 'bg-gradient-to-r from-orange-500 to-orange-600 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}>
                {activeTimer ? <FiClock className="h-6 w-6 text-white" /> : <FiUserCheck className="h-6 w-6 text-white" />}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {activeTimer ? 'Timer Active' : 'Pending Today'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeTimer ? formatCountdown(timerSeconds[activeTimer] || 0) : waitingRoomCount}
                </p>
                {activeTimer && (
                  <p className="text-xs text-orange-600 font-medium">Time Remaining</p>
                )}
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

        {/* Active Timer Display - Always visible at top */}
        {activeTimer && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`relative w-24 h-24 ${
                    (timerSeconds[activeTimer] || 0) >= 780 ? 'animate-pulse' : ''
                  }`}>
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke={
                          getTimerProgress(timerSeconds[activeTimer] || 0) >= 100 ? "#dc2626" : 
                          (timerSeconds[activeTimer] || 0) >= 780 ? "#f59e0b" : "#3b82f6"
                        }
                        strokeWidth="6"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - getTimerProgress(timerSeconds[activeTimer] || 0) / 100)}`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${
                        getTimerProgress(timerSeconds[activeTimer] || 0) >= 100 ? 'text-red-600' : 
                        (timerSeconds[activeTimer] || 0) >= 780 ? 'text-yellow-600' : 'text-blue-600'
                      }`}>
                        {formatCountdown(timerSeconds[activeTimer] || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 font-medium mt-2">
                    {getTimerProgress(timerSeconds[activeTimer] || 0) >= 100 ? 'TIME UP!' : 'Time Remaining'}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Active Consultation Timer</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Patient: {(() => {
                      const activeVisit = visits.find(v => v.id === activeTimer)
                      const patient = activeVisit ? patients.find(p => p.id === activeVisit.patientId) : null
                      return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'
                    })()}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => pauseTimer()}
                      className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                    >
                      <FiPause className="inline mr-1" size={14} />
                      Pause
                    </button>
                    <button
                      onClick={() => resetTimer(activeTimer)}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <FiSquare className="inline mr-1" size={14} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(timerSeconds[activeTimer] || 0)}
                </div>
                <div className="text-sm text-gray-500">Elapsed Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Time Alert */}
        {showTimeAlert && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-300 rounded-xl text-red-800 fade-in shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-red-500 rounded-full mr-3">
                  <FiClock className="text-white" size={20} />
                </div>
                <div>
                  <span className="font-bold text-lg">⏰ 15 Minutes Completed!</span>
                  <p className="text-sm text-red-700 mt-1">Current consultation time has reached the standard 15-minute duration.</p>
                </div>
              </div>
              <button
                onClick={() => setShowTimeAlert(null)}
                className="p-2 bg-red-200 hover:bg-red-300 rounded-lg transition-colors"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* All Appointments */}
          <div className="hover:scale-105 transition-transform duration-300 fade-in stagger-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-3">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">All Appointments</h2>
                  <p className="text-sm text-gray-600">All scheduled appointments (sorted by date)</p>
                </div>
              </div>
              
              {allVisitsWithPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FiCalendar size={24} />
                  </div>
                  <p className="text-sm font-medium">No appointments scheduled</p>
                  <p className="text-xs text-gray-400 mt-1">You have no appointments at this time!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active Consultations (Arrived/In Progress) */}
                  {todayVisitsWithPatients.filter(v => ['arrived', 'in_progress'].includes(v.status)).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FiActivity className="mr-2 text-orange-600" size={18} />
                        Active Consultations ({todayVisitsWithPatients.filter(v => ['arrived', 'in_progress'].includes(v.status)).length})
                      </h3>
                      <div className="space-y-3">
                        {todayVisitsWithPatients.filter(v => ['arrived', 'in_progress'].includes(v.status)).map((visit) => (
                          <div key={visit.id} className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200 shadow-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                                  {visit.patient!.firstName[0]}{visit.patient!.lastName[0]}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {visit.patient!.firstName} {visit.patient!.lastName}
                                  </h3>
                                  <p className="text-sm text-gray-600">{formatDisplayDate(visit.date)} at {visit.time} • {visit.currentDisease}</p>
                                  <div className="flex items-center mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(visit.status)}`}>
                                      {visit.status === 'arrived' ? 'Patient Arrived' : 'In Progress'}
                                    </span>
                                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      visit.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                                      visit.urgencyLevel === 'normal' ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {visit.urgencyLevel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                {/* Large Timer Display */}
                                <div className="flex flex-col items-center bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-orange-200">
                                  <div className={`relative w-20 h-20 mb-2 ${
                                    (timerSeconds[visit.id] || 0) >= 780 ? 'animate-pulse' : '' // Start pulsing at 13 minutes (780 seconds)
                                  }`}>
                                    {/* Circular Progress */}
                                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="35"
                                        stroke="#fed7aa"
                                        strokeWidth="6"
                                        fill="none"
                                      />
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="35"
                                        stroke={
                                          getTimerProgress(timerSeconds[visit.id] || 0) >= 100 ? "#dc2626" : 
                                          (timerSeconds[visit.id] || 0) >= 780 ? "#f59e0b" : "#ea580c"
                                        }
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 35}`}
                                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - getTimerProgress(timerSeconds[visit.id] || 0) / 100)}`}
                                        className="transition-all duration-500"
                                      />
                                    </svg>
                                    {/* Timer Text */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className={`text-sm font-bold ${
                                        getTimerProgress(timerSeconds[visit.id] || 0) >= 100 ? 'text-red-600' : 'text-orange-600'
                                      }`}>
                                        {formatCountdown(timerSeconds[visit.id] || 0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    {getTimerProgress(timerSeconds[visit.id] || 0) >= 100 ? 'TIME UP!' : 'Time Remaining'}
                                  </div>
                                  <div className="flex items-center mt-2 space-x-1">
                                    {activeTimer === visit.id ? (
                                      <button
                                        onClick={() => pauseTimer()}
                                        className="p-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                                        title="Pause Timer"
                                      >
                                        <FiPause size={14} />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => startTimer(visit.id)}
                                        className="p-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                        title="Resume Timer"
                                      >
                                        <FiPlay size={14} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => resetTimer(visit.id)}
                                      className="p-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                      title="Reset Timer"
                                    >
                                      <FiSquare size={14} />
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col space-y-2">
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
                            </div>
                            <div className="mt-3 pt-3 border-t border-orange-200">
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
                    </div>
                  )}

                  {/* Pending Appointments */}
                  {pendingAppointments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FiClock className="mr-2" size={18} />
                        Pending Appointments ({pendingAppointments.length})
                      </h3>
                      <div className="space-y-3">
                        {pendingAppointments.map((visit) => (
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
                                  <p className="text-sm text-gray-600">{formatDisplayDate(visit.date)} at {visit.time} • {visit.currentDisease}</p>
                                  <div className="flex items-center mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(visit.status)}`}>
                                      {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                                    </span>
                                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      visit.patient!.isFirstTime 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-purple-100 text-purple-800'
                                    }`}>
                                      {visit.patient!.isFirstTime ? 'First Time' : 'Returning'}
                                    </span>
                                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      visit.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' :
                                      visit.urgencyLevel === 'normal' ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {visit.urgencyLevel}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                {/* Timer Display - Always show timer controls */}
                                <div className="flex flex-col items-center">
                                  {(activeTimer === visit.id || timerSeconds[visit.id] > 0) ? (
                                    <div className="flex flex-col items-center">
                                    <div className="relative w-16 h-16">
                                      {/* Circular Progress */}
                                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                                        <circle
                                          cx="32"
                                          cy="32"
                                          r="28"
                                          stroke="#e5e7eb"
                                          strokeWidth="4"
                                          fill="none"
                                        />
                                        <circle
                                          cx="32"
                                          cy="32"
                                          r="28"
                                          stroke={getTimerProgress(timerSeconds[visit.id] || 0) >= 100 ? "#ef4444" : "#3b82f6"}
                                          strokeWidth="4"
                                          fill="none"
                                          strokeDasharray={`${2 * Math.PI * 28}`}
                                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - getTimerProgress(timerSeconds[visit.id] || 0) / 100)}`}
                                          className="transition-all duration-300"
                                        />
                                      </svg>
                                      {/* Timer Text */}
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`text-xs font-bold ${
                                          getTimerProgress(timerSeconds[visit.id] || 0) >= 100 ? 'text-red-600' : 'text-blue-600'
                                        }`}>
                                          {formatCountdown(timerSeconds[visit.id] || 0)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center mt-2 space-x-1">
                                      {activeTimer === visit.id ? (
                                        <button
                                          onClick={() => pauseTimer()}
                                          className="p-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                                          title="Pause Timer"
                                        >
                                          <FiPause size={12} />
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => startTimer(visit.id)}
                                          className="p-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                          title="Start Timer"
                                        >
                                          <FiPlay size={12} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => resetTimer(visit.id)}
                                        className="p-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Reset Timer"
                                      >
                                        <FiSquare size={12} />
                                      </button>
                                    </div>
                                  </div>
                                  ) : (
                                    // Show prominent timer button when not active
                                    <div className="flex flex-col items-center bg-orange-50 rounded-xl p-3 border border-orange-200">
                                      <button
                                        onClick={() => startTimer(visit.id)}
                                        className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 hover:scale-105 shadow-lg mb-2"
                                        title="Start 15-minute Timer"
                                      >
                                        <FiPlay size={20} />
                                      </button>
                                      <span className="text-xs font-medium text-orange-700">Start Timer</span>
                                      <span className="text-xs text-orange-600">(15 min)</span>
                                    </div>
                                  )}
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
                    </div>
                  )}

                  {/* Completed Appointments */}
                  {completedAppointments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FiCheckCircle className="mr-2" size={18} />
                        Completed Appointments ({completedAppointments.length})
                      </h3>
                      <div className="space-y-3">
                        {completedAppointments.map((visit) => (
                          <div key={visit.id} className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                                  {visit.patient!.firstName[0]}{visit.patient!.lastName[0]}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {visit.patient!.firstName} {visit.patient!.lastName}
                                  </h3>
                                  <p className="text-sm text-gray-600">{formatDisplayDate(visit.date)} at {visit.time} • {visit.currentDisease}</p>
                                  <div className="flex items-center mt-1">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(visit.status)}`}>
                                      Completed
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewPatient(visit.patient!, visit)}
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    title="View Medical Record"
                                  >
                                    <FiFileText size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

        {/* Medical Records Section */}
        {!loading && !error && (
          <div className="mt-8 hover:scale-105 transition-transform duration-300 fade-in stagger-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mr-3">
                  <FiFileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
                  <p className="text-sm text-gray-600">Past patient records and prescriptions</p>
                </div>
              </div>
              
              {medicalHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FiFileText size={24} />
                  </div>
                  <p className="text-sm font-medium">No medical records found</p>
                  <p className="text-xs text-gray-400 mt-1">Records will appear here after completing appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalHistory.slice(0, 10).map((record) => {
                    const patient = patients.find(p => p.id === record.patientId)
                    return (
                      <div key={record.id} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                              {patient ? patient.firstName[0] + patient.lastName[0] : 'UN'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                              </h3>
                              <p className="text-sm text-gray-600">{record.date}</p>
                              <p className="text-sm font-medium text-purple-700 mt-1">{record.diagnosis}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {record.followUpRequired && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Follow-up: {record.followUpDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          {record.prescription && (
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Prescription:</strong> {record.prescription}
                            </p>
                          )}
                          {record.notes && (
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {record.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {medicalHistory.length > 10 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Showing 10 of {medicalHistory.length} records
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patient={selectedPatient}
        visit={selectedVisit}
        medicalHistory={medicalHistory.filter(h => h.patientId === selectedPatient?.id)}
        onSavePrescription={handleSavePrescription}
        doctor={doctor}
      />
    </div>
  );
}
