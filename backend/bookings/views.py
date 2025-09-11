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
