'use client'

import { useState, useEffect } from 'react'
import { FiPlay, FiPause, FiRotateCcw, FiClock, FiAlertTriangle, FiFileText } from 'react-icons/fi'
import { TimerManager, PatientTimer } from '../app/utils/timerUtils'

interface PatientTimerProps {
  timer: PatientTimer
  onTimerUpdate?: () => void
  onAddPrescription?: (visitId: string) => void
  showPatientName?: boolean
  compact?: boolean
}

export default function PatientTimerComponent({ 
  timer, 
  onTimerUpdate, 
  onAddPrescription,
  showPatientName = true,
  compact = false 
}: PatientTimerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = TimerManager.getCurrentTime(timer)
      setCurrentTime(elapsed)
      setIsExpired(TimerManager.isTimerExpired(timer))
    }

    // Update immediately
    updateTimer()

    // Set up interval for active timers
    let interval: NodeJS.Timeout | null = null
    if (timer.isActive) {
      interval = setInterval(updateTimer, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer])

  const handlePause = () => {
    TimerManager.pauseTimer(timer.visitId)
    onTimerUpdate?.()
  }

  const handleResume = () => {
    TimerManager.resumeTimer(timer.visitId)
    onTimerUpdate?.()
  }

  const handleReset = () => {
    TimerManager.resetTimer(timer.visitId)
    onTimerUpdate?.()
  }

  const handleStop = () => {
    TimerManager.stopTimer(timer.visitId)
    onTimerUpdate?.()
  }

  const timeRemaining = timer.maxDuration - currentTime
  const progressPercentage = Math.min((currentTime / timer.maxDuration) * 100, 100)

  const getTimerColor = () => {
    if (isExpired) return 'text-red-600'
    if (timeRemaining < 5 * 60 * 1000) return 'text-orange-600' // Less than 5 minutes
    if (timeRemaining < 10 * 60 * 1000) return 'text-yellow-600' // Less than 10 minutes
    return 'text-green-600'
  }

  const getBackgroundColor = () => {
    if (isExpired) return 'from-red-50 to-red-100 border-red-200'
    if (timeRemaining < 5 * 60 * 1000) return 'from-orange-50 to-orange-100 border-orange-200'
    if (timeRemaining < 10 * 60 * 1000) return 'from-yellow-50 to-yellow-100 border-yellow-200'
    return 'from-green-50 to-green-100 border-green-200'
  }

  if (compact) {
    return (
      <div className={`bg-gradient-to-r ${getBackgroundColor()} rounded-lg p-3 border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReset}
              className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
              title="Reset"
            >
              <FiRotateCcw size={compact ? 12 : 14} />
            </button>
            {onAddPrescription && !compact && (
              <button
                onClick={() => onAddPrescription(timer.visitId)}
                title="Add Prescription"
                className="p-2 bg-green-200 text-green-700 rounded-full hover:bg-green-300 transition-colors"
              >
                <FiFileText size={14} />
              </button>
            )}
          </div>
          {isExpired && (
            <div className="flex items-center text-red-500" title="Consultation time is over">
              <FiAlertTriangle className="mr-1" />
              <span className="text-sm font-medium">Time Exceeded</span>
            </div>
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-full bg-white/50 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-1000 ${
              isExpired ? 'bg-red-500' : 
              timeRemaining < 5 * 60 * 1000 ? 'bg-orange-500' :
              timeRemaining < 10 * 60 * 1000 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r ${getBackgroundColor()} rounded-xl p-6 border shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-white rounded-lg mr-3 shadow-sm">
            <FiClock className={getTimerColor()} size={20} />
          </div>
          <div>
            {showPatientName && (
              <h3 className="font-semibold text-gray-900">{timer.patientName}</h3>
            )}
            <p className="text-sm text-gray-600">Consultation Timer</p>
          </div>
        </div>
        {isExpired && (
          <div className="flex items-center space-x-1 text-red-600">
            <FiAlertTriangle size={16} />
            <span className="text-sm font-medium">Time Exceeded</span>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-mono font-bold ${getTimerColor()} mb-2`}>
          {TimerManager.formatTime(currentTime)}
        </div>
        <div className="text-sm text-gray-600">
          {isExpired ? (
            <span className="text-red-600 font-medium">Overtime: +{TimerManager.formatTime(currentTime - timer.maxDuration)}</span>
          ) : (
            <span>Remaining: {TimerManager.formatTime(timeRemaining)}</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-white/50 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              isExpired ? 'bg-red-500' : 
              timeRemaining < 5 * 60 * 1000 ? 'bg-orange-500' :
              timeRemaining < 10 * 60 * 1000 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0:00</span>
          <span>15:00</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3">
        {timer.isActive ? (
          <button
            onClick={handlePause}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 hover:bg-gray-50"
          >
            <FiPause size={16} />
            <span className="font-medium">Pause</span>
          </button>
        ) : (
          <button
            onClick={handleResume}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 hover:bg-gray-50"
          >
            <FiPlay size={16} />
            <span className="font-medium">Resume</span>
          </button>
        )}

        <button
          onClick={handleReset}
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 hover:bg-gray-50"
        >
          <FiRotateCcw size={16} />
          <span className="font-medium">Reset</span>
        </button>

        <button
          onClick={handleStop}
          className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-red-200"
        >
          <span className="font-medium">Stop</span>
        </button>
      </div>

      {/* Status */}
      <div className="mt-3 text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          timer.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {timer.isActive ? '● Running' : '⏸ Paused'}
        </span>
      </div>
    </div>
  )
}