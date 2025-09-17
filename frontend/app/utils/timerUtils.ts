// Timer utilities for patient consultation timers

export interface PatientTimer {
  visitId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  startTime: number; // timestamp
  pausedAt?: number; // timestamp when paused
  totalPausedTime: number; // total time paused in milliseconds
  isActive: boolean;
  maxDuration: number; // 15 minutes in milliseconds (900000)
}

const TIMERS_STORAGE_KEY = 'patient_timers';

export class TimerManager {
  static getTimers(): PatientTimer[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(TIMERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static saveTimers(timers: PatientTimer[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
  }

  static startTimer(
    visitId: string,
    patientId: string,
    patientName: string,
    doctorId: string,
    doctorName: string
  ): void {
    const timers = this.getTimers();
    const existingIndex = timers.findIndex(t => t.visitId === visitId);
    
    const timer: PatientTimer = {
      visitId,
      patientId,
      patientName,
      doctorId,
      doctorName,
      startTime: Date.now(),
      totalPausedTime: 0,
      isActive: true,
      maxDuration: 15 * 60 * 1000 // 15 minutes
    };

    if (existingIndex >= 0) {
      timers[existingIndex] = timer;
    } else {
      timers.push(timer);
    }

    this.saveTimers(timers);
  }

  static pauseTimer(visitId: string): void {
    const timers = this.getTimers();
    const timer = timers.find(t => t.visitId === visitId);
    
    if (timer && timer.isActive) {
      timer.isActive = false;
      timer.pausedAt = Date.now();
      this.saveTimers(timers);
    }
  }

  static resumeTimer(visitId: string): void {
    const timers = this.getTimers();
    const timer = timers.find(t => t.visitId === visitId);
    
    if (timer && !timer.isActive && timer.pausedAt) {
      timer.totalPausedTime += Date.now() - timer.pausedAt;
      timer.isActive = true;
      delete timer.pausedAt;
      this.saveTimers(timers);
    }
  }

  static resetTimer(visitId: string): void {
    const timers = this.getTimers();
    const timer = timers.find(t => t.visitId === visitId);
    
    if (timer) {
      timer.startTime = Date.now();
      timer.totalPausedTime = 0;
      timer.isActive = true;
      delete timer.pausedAt;
      this.saveTimers(timers);
    }
  }

  static stopTimer(visitId: string): void {
    const timers = this.getTimers();
    const filteredTimers = timers.filter(t => t.visitId !== visitId);
    this.saveTimers(filteredTimers);
  }

  static getTimer(visitId: string): PatientTimer | undefined {
    const timers = this.getTimers();
    return timers.find(t => t.visitId === visitId);
  }

  static getDoctorTimers(doctorId: string): PatientTimer[] {
    const timers = this.getTimers();
    return timers.filter(t => t.doctorId === doctorId);
  }

  static getCurrentTime(timer: PatientTimer): number {
    if (!timer.isActive && timer.pausedAt) {
      // Timer is paused, return time elapsed until pause
      return timer.pausedAt - timer.startTime - timer.totalPausedTime;
    } else if (timer.isActive) {
      // Timer is active, return current elapsed time
      return Date.now() - timer.startTime - timer.totalPausedTime;
    } else {
      // Timer is stopped
      return 0;
    }
  }

  static formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  static isTimerExpired(timer: PatientTimer): boolean {
    const currentTime = this.getCurrentTime(timer);
    return currentTime >= timer.maxDuration;
  }

  static getTimeRemaining(timer: PatientTimer): number {
    const currentTime = this.getCurrentTime(timer);
    return Math.max(0, timer.maxDuration - currentTime);
  }
}