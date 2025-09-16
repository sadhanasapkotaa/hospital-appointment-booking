from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta, time
from .models import Appointment, TimeSlot, DoctorSchedule, Department, MedicalRecord, Payment
from .serializers import (
    AppointmentSerializer, AppointmentCreateSerializer, AppointmentUpdateSerializer,
    TimeSlotSerializer, DoctorScheduleSerializer, DepartmentSerializer,
    MedicalRecordSerializer, PaymentSerializer, DoctorAvailabilitySerializer
)
from user.models import Doctor, Patient

# Department Views
class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]

# Doctor Schedule Views
@api_view(['GET'])
@permission_classes([AllowAny])
def doctor_schedules(request):
    """Get all doctor schedules"""
    schedules = DoctorSchedule.objects.filter(is_available=True)
    serializer = DoctorScheduleSerializer(schedules, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_doctor_schedule(request):
    """Create a new doctor schedule (Doctor only)"""
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Only doctors can create schedules'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    serializer = DoctorScheduleSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(doctor=doctor)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Appointment Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_appointments(request):
    """Get appointments for the current user"""
    user = request.user
    
    if user.user_type == 'patient':
        try:
            patient = Patient.objects.get(user=user)
            appointments = Appointment.objects.filter(patient=patient).order_by('-appointment_date', '-appointment_time')
        except Patient.DoesNotExist:
            return Response({'error': 'Patient profile not found'}, 
                           status=status.HTTP_404_NOT_FOUND)
    elif user.user_type == 'doctor':
        try:
            doctor = Doctor.objects.get(user=user)
            appointments = Appointment.objects.filter(doctor=doctor).order_by('-appointment_date', '-appointment_time')
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor profile not found'}, 
                           status=status.HTTP_404_NOT_FOUND)
    else:
        # Staff can see all appointments
        appointments = Appointment.objects.all().order_by('-appointment_date', '-appointment_time')
    
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    """Create a new appointment (Patient only)"""
    if request.user.user_type != 'patient':
        return Response({'error': 'Only patients can book appointments'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        Patient.objects.get(user=request.user)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient profile not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    serializer = AppointmentCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        appointment = serializer.save()
        return Response(AppointmentSerializer(appointment).data, 
                       status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_appointment_by_staff(request):
    """Create a new appointment (Staff/Admin only)"""
    if request.user.user_type not in ['staff', 'admin']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

    print(f"Creating appointment by staff: {request.user.email}")
    print(f"Request data: {request.data}")

    try:
        patient_id = request.data.get('patient_id')
        doctor_id = request.data.get('doctor_id')

        if not patient_id:
            print("Validation Error: Patient ID is missing")
            return Response({'error': 'Patient ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not doctor_id:
            print("Validation Error: Doctor ID is missing")
            return Response({'error': 'Doctor ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        print(f"Attempting to find Patient with ID: {patient_id}")
        patient = Patient.objects.get(pk=patient_id)
        print(f"Found Patient: {patient.user.username}")

        print(f"Attempting to find Doctor with ID: {doctor_id}")
        doctor = Doctor.objects.get(pk=doctor_id)
        print(f"Found Doctor: {doctor.user.username}")
        
        # Prepare data for serializer
        appointment_data = {
            'patient': patient.pk,
            'doctor': doctor.pk,
            'appointment_date': request.data.get('appointment_date'),
            'appointment_time': request.data.get('appointment_time'),
            'reason': request.data.get('reason'),
            'symptoms': request.data.get('symptoms'),
            'priority': request.data.get('priority'),
            'notes': request.data.get('notes'),
            'is_first_visit': request.data.get('is_first_visit', False)
        }
        
        serializer = AppointmentCreateSerializer(data=appointment_data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Patient.DoesNotExist:
        print(f"Error: Patient with ID {patient_id} not found.")
        return Response({'error': f'Patient with ID {patient_id} not found'}, status=status.HTTP_404_NOT_FOUND)
    except Doctor.DoesNotExist:
        print(f"Error: Doctor with ID {doctor_id} not found.")
        return Response({'error': f'Doctor with ID {doctor_id} not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def appointment_detail(request, appointment_id):
    """Get, update, or delete a specific appointment"""
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    # Check permissions
    user = request.user
    if user.user_type == 'patient':
        if appointment.patient.user != user:
            return Response({'error': 'Permission denied'}, 
                           status=status.HTTP_403_FORBIDDEN)
    elif user.user_type == 'doctor':
        if appointment.doctor.user != user:
            return Response({'error': 'Permission denied'}, 
                           status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = AppointmentUpdateSerializer(appointment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(AppointmentSerializer(appointment).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only allow cancellation, not deletion
        appointment.status = 'cancelled'
        appointment.save()
        
        # Free up the time slot
        try:
            time_slot = TimeSlot.objects.get(appointment=appointment)
            time_slot.is_available = True
            time_slot.is_booked = False
            time_slot.appointment = None
            time_slot.save()
        except TimeSlot.DoesNotExist:
            pass
        
        return Response({'message': 'Appointment cancelled successfully'})

# Time Slot Views
@api_view(['GET'])
@permission_classes([AllowAny])
def available_time_slots(request):
    """Get available time slots for a specific doctor and date"""
    doctor_id = request.GET.get('doctor_id')
    date_str = request.GET.get('date')
    
    if not doctor_id or not date_str:
        return Response({'error': 'doctor_id and date are required parameters'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except (Doctor.DoesNotExist, ValueError):
        return Response({'error': 'Invalid doctor_id or date format'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if date_obj < timezone.now().date():
        return Response({'error': 'Date cannot be in the past'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Get doctor's schedule for this day
    day_name = date_obj.strftime('%A').lower()
    schedules = DoctorSchedule.objects.filter(
        doctor=doctor,
        day_of_week=day_name,
        is_available=True
    )
    
    if not schedules.exists():
        return Response({'message': 'Doctor is not available on this day'})
    
    available_slots = []
    
    for schedule in schedules:
        # Generate time slots (30-minute intervals)
        current_time = datetime.combine(date_obj, schedule.start_time)
        end_time = datetime.combine(date_obj, schedule.end_time)
        
        while current_time < end_time:
            slot_time = current_time.time()
            
            # Check if this slot is already booked
            is_booked = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=date_obj,
                appointment_time=slot_time,
                status__in=['scheduled', 'confirmed']
            ).exists()
            
            if not is_booked and current_time > timezone.now():
                available_slots.append({
                    'time': slot_time.strftime('%H:%M'),
                    'formatted_time': slot_time.strftime('%I:%M %p'),
                    'is_available': True
                })
            
            current_time += timedelta(minutes=30)
    
    return Response({
        'doctor': {
            'id': doctor.user.id,
            'name': doctor.user.get_full_name(),
            'specialization': doctor.specialization
        },
        'date': date_str,
        'available_slots': available_slots
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def doctors_list(request):
    """Get list of all doctors with their basic information"""
    doctors = Doctor.objects.select_related('user').all()
    
    doctors_data = []
    for doctor in doctors:
        doctors_data.append({
            'id': doctor.user.id,
            'name': doctor.user.get_full_name(),
            'specialization': doctor.specialization,
            'experience_years': doctor.experience_years,
            'consultation_fee': doctor.consultation_fee,
            'email': doctor.user.email,
            'phone': doctor.user.phone
        })
    
    return Response(doctors_data)

# Medical Record Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def medical_records(request):
    """Get or create medical records"""
    if request.method == 'GET':
        user = request.user
        
        if user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                records = MedicalRecord.objects.filter(appointment__patient=patient)
            except Patient.DoesNotExist:
                return Response({'error': 'Patient profile not found'}, 
                               status=status.HTTP_404_NOT_FOUND)
        elif user.user_type == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
                records = MedicalRecord.objects.filter(appointment__doctor=doctor)
            except Doctor.DoesNotExist:
                return Response({'error': 'Doctor profile not found'}, 
                               status=status.HTTP_404_NOT_FOUND)
        else:
            records = MedicalRecord.objects.all()
        
        serializer = MedicalRecordSerializer(records, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if request.user.user_type != 'doctor':
            return Response({'error': 'Only doctors can create medical records'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        serializer = MedicalRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Payment Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payments(request):
    """Get or create payments"""
    if request.method == 'GET':
        user = request.user
        
        if user.user_type == 'patient':
            try:
                patient = Patient.objects.get(user=user)
                payments = Payment.objects.filter(appointment__patient=patient)
            except Patient.DoesNotExist:
                return Response({'error': 'Patient profile not found'}, 
                               status=status.HTTP_404_NOT_FOUND)
        else:
            payments = Payment.objects.all()
        
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Doctor Dashboard Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_dashboard(request):
    """Get comprehensive dashboard data for doctors"""
    if request.user.user_type != 'doctor':
        return Response({'error': 'Access denied. Doctor account required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        today = timezone.now().date()
        
        # Get appointments
        all_appointments = Appointment.objects.filter(doctor=doctor)
        today_appointments = all_appointments.filter(appointment_date=today)
        
        # Get patients (unique from appointments)
        patients_data = []
        patient_ids = set()
        
        for appointment in all_appointments.select_related('patient__user'):
            if appointment.patient.user.id not in patient_ids:
                patient_ids.add(appointment.patient.user.id)
                patients_data.append({
                    'id': str(appointment.patient.user.id),  # Convert to string to match visit patientId
                    'firstName': appointment.patient.user.first_name,
                    'lastName': appointment.patient.user.last_name,
                    'email': appointment.patient.user.email,
                    'phone': getattr(appointment.patient.user, 'phone', ''),
                    'dateOfBirth': appointment.patient.user.date_of_birth.strftime('%Y-%m-%d') if appointment.patient.user.date_of_birth else '',
                    'gender': getattr(appointment.patient.user, 'gender', ''),
                    'address': getattr(appointment.patient.user, 'address', ''),
                    'emergencyContact': getattr(appointment.patient, 'emergency_contact', ''),
                    'emergencyPhone': getattr(appointment.patient, 'emergency_phone', ''),
                    'isFirstTime': not all_appointments.filter(patient=appointment.patient, status='completed').exists(),
                    'bloodGroup': getattr(appointment.patient, 'blood_group', ''),
                    'allergies': getattr(appointment.patient, 'allergies', ''),
                    'chronicConditions': getattr(appointment.patient, 'chronic_conditions', ''),
                })
        
        # Get visits/appointments with patient details (include all appointments)
        visits_data = []
        for appointment in all_appointments.select_related('patient__user'):
            visits_data.append({
                'id': str(appointment.id),
                'patientId': str(appointment.patient.user.id),
                'doctorId': str(doctor.user.id),
                'doctorName': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
                'specialty': doctor.specialization,
                'date': appointment.appointment_date.strftime('%Y-%m-%d'),
                'time': appointment.appointment_time.strftime('%H:%M'),
                'symptoms': appointment.symptoms or appointment.reason,
                'currentDisease': appointment.reason,
                'urgencyLevel': appointment.priority,
                'notes': appointment.notes or '',
                'status': appointment.status,
            })
        
        # Get medical history
        medical_history = []
        medical_records = MedicalRecord.objects.filter(
            appointment__doctor=doctor
        ).select_related('appointment__patient__user').order_by('-created_at')[:20]
        
        for record in medical_records:
            medical_history.append({
                'id': str(record.id),
                'patientId': str(record.appointment.patient.user.id),
                'visitId': str(record.appointment.id),
                'date': record.appointment.appointment_date.strftime('%Y-%m-%d'),
                'diagnosis': record.diagnosis,
                'prescription': record.prescription or '',
                'doctorName': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
                'followUpRequired': bool(record.follow_up_date),
                'followUpDate': record.follow_up_date.strftime('%Y-%m-%d') if record.follow_up_date else '',
                'notes': record.doctor_notes or '',
            })
        
        # Statistics
        stats = {
            'totalPatients': len(patients_data),
            'todayAppointments': today_appointments.count(),
            'arrivedPatients': today_appointments.filter(status='arrived').count(),
            'completedToday': today_appointments.filter(status='completed').count(),
        }
        
        return Response({
            'doctor': {
                'id': doctor.user.id,
                'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
                'specialization': doctor.specialization,
                'email': doctor.user.email,
            },
            'patients': patients_data,
            'visits': visits_data,
            'medicalHistory': medical_history,
            'stats': stats,
        })
        
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, appointment_id):
    """Update appointment status"""
    if request.user.user_type not in ['doctor', 'staff']:
        return Response({'error': 'Access denied'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        
        # If doctor, ensure they own this appointment
        if request.user.user_type == 'doctor':
            doctor = Doctor.objects.get(user=request.user)
            if appointment.doctor != doctor:
                return Response({'error': 'Access denied'}, 
                               status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status in ['scheduled', 'confirmed', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show']:
            appointment.status = new_status
            if 'notes' in request.data:
                appointment.notes = request.data.get('notes', '')
            appointment.save()
            
            return Response({'message': 'Status updated successfully', 'status': new_status})
        else:
            return Response({'error': 'Invalid status'}, 
                           status=status.HTTP_400_BAD_REQUEST)
            
    except (Appointment.DoesNotExist, Doctor.DoesNotExist):
        return Response({'error': 'Appointment not found'}, 
                       status=status.HTTP_404_NOT_FOUND)


# Medical Record Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_medical_record(request):
    """Create a new medical record"""
    if request.user.user_type != 'doctor':
        return Response({'error': 'Access denied. Doctor account required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        appointment_id = request.data.get('appointment')
        
        # Verify the appointment belongs to this doctor
        appointment = Appointment.objects.get(id=appointment_id, doctor=doctor)
        
        # Create medical record
        medical_record = MedicalRecord.objects.create(
            appointment=appointment,
            diagnosis=request.data.get('diagnosis', ''),
            prescription=request.data.get('prescription', ''),
            doctor_notes=request.data.get('doctor_notes', ''),
            follow_up_date=request.data.get('follow_up_date') if request.data.get('follow_up_date') else None
        )
        
        serializer = MedicalRecordSerializer(medical_record)
        return Response({
            'message': 'Medical record created successfully',
            'medical_record': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found or access denied'}, 
                       status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)
