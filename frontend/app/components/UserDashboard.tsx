import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, User, Plus, Trash2 } from 'lucide-react';
import { BookAppointmentModal } from './BookAppointmentModal';
import { User as UserType, Appointment, Doctor } from '../App';

interface UserDashboardProps {
  user: UserType;
  appointments: Appointment[];
  doctors: Doctor[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (appointmentId: string, updates: Partial<Appointment>) => void;
  onDeleteAppointment: (appointmentId: string) => void;
}

export function UserDashboard({ 
  user, 
  appointments, 
  doctors, 
  onAddAppointment, 
  onUpdateAppointment, 
  onDeleteAppointment 
}: UserDashboardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const userAppointments = appointments.filter(apt => apt.patientId === user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    onUpdateAppointment(appointmentId, { status: 'cancelled' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">Manage your appointments and health records</p>
        </div>
        <Button onClick={() => setIsBookingModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{userAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {userAppointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {userAppointments.filter(apt => apt.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
          <CardDescription>View and manage your scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {userAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg mb-2">No appointments scheduled</h3>
              <p className="text-muted-foreground mb-4">Book your first appointment to get started</p>
              <Button onClick={() => setIsBookingModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4>{appointment.doctorName}</h4>
                      <Badge variant="outline">{appointment.specialty}</Badge>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </div>
                      <p>Reason: {appointment.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        user={user}
        doctors={doctors}
        onBookAppointment={onAddAppointment}
      />
    </div>
  );
}