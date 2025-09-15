from rest_framework import serializers
from .models import Appointment, Doctor, MedicalRecord, Department, DoctorSchedule, TimeSlot
from user.models import CustomUser

class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'date_of_birth']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Doctor
        fields = ['id', 'full_name', 'user_email', 'specialization', 'experience_years', 'consultation_fee']
    
    def get_full_name(self, obj):
        return f"Dr. {obj.user.first_name} {obj.user.last_name}"

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    patient_email = serializers.CharField(source='patient.user.email', read_only=True)
    patient_phone = serializers.CharField(source='patient.user.phone', read_only=True)
    doctor_name = serializers.SerializerMethodField()
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_name', 'patient_email', 'patient_phone', 
            'doctor_name', 'doctor_specialization', 'appointment_date', 
            'appointment_time', 'status', 'priority', 'reason', 'symptoms', 
            'notes', 'is_first_visit', 'created_at'
        ]
    
    def get_patient_name(self, obj):
        return f"{obj.patient.user.first_name} {obj.patient.user.last_name}"
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.first_name} {obj.doctor.user.last_name}"

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    appointment_date = serializers.DateField(source='appointment.appointment_date', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'patient_name', 'doctor_name', 'appointment_date', 
            'diagnosis', 'prescription', 'treatment_plan', 'follow_up_date', 
            'vital_signs', 'lab_results', 'doctor_notes', 'created_at'
        ]
    
    def get_patient_name(self, obj):
        return f"{obj.appointment.patient.user.first_name} {obj.appointment.patient.user.last_name}"
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.appointment.doctor.user.first_name} {obj.appointment.doctor.user.last_name}"
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment, TimeSlot, DoctorSchedule, Department, MedicalRecord, Payment
from user.models import Doctor, Patient
from user.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class DoctorScheduleSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    
    class Meta:
        model = DoctorSchedule
        fields = ['id', 'doctor', 'doctor_name', 'day_of_week', 'start_time', 'end_time', 'is_available', 'max_patients']

class TimeSlotSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    
    class Meta:
        model = TimeSlot
        fields = ['id', 'doctor', 'doctor_name', 'doctor_specialization', 'date', 'start_time', 'end_time', 'is_available', 'is_booked']

class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['doctor', 'appointment_date', 'appointment_time', 'reason', 'symptoms', 'priority', 'is_first_visit']
    
    def validate_appointment_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Appointment date cannot be in the past")
        return value
    
    def validate(self, attrs):
        doctor = attrs.get('doctor')
        appointment_date = attrs.get('appointment_date')
        appointment_time = attrs.get('appointment_time')
        
        # Check if the time slot is available
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status__in=['scheduled', 'confirmed']
        ).exists():
            raise serializers.ValidationError("This time slot is already booked")
        
        return attrs
    
    def create(self, validated_data):
        # Set the patient from the request user
        patient = Patient.objects.get(user=self.context['request'].user)
        validated_data['patient'] = patient
        
        appointment = Appointment.objects.create(**validated_data)
        
        # Create or update the time slot
        time_slot, created = TimeSlot.objects.get_or_create(
            doctor=appointment.doctor,
            date=appointment.appointment_date,
            start_time=appointment.appointment_time,
            defaults={
                'end_time': (datetime.combine(datetime.today(), appointment.appointment_time) + 
                           appointment.estimated_duration).time(),
                'is_available': False,
                'is_booked': True,
                'appointment': appointment
            }
        )
        
        if not created:
            time_slot.is_available = False
            time_slot.is_booked = True
            time_slot.appointment = appointment
            time_slot.save()
        
        return appointment

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    patient_email = serializers.CharField(source='patient.user.email', read_only=True)
    patient_phone = serializers.CharField(source='patient.user.phone', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'patient_name', 'patient_email', 'patient_phone',
                 'doctor', 'doctor_name', 'doctor_specialization', 'appointment_date',
                 'appointment_time', 'status', 'priority', 'reason', 'notes', 'symptoms',
                 'is_first_visit', 'estimated_duration', 'created_at', 'updated_at']

class AppointmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['status', 'notes', 'appointment_date', 'appointment_time']
    
    def validate_appointment_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Appointment date cannot be in the past")
        return value

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='appointment.patient.user.get_full_name', read_only=True)
    appointment_date = serializers.DateField(source='appointment.appointment_date', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = ['id', 'appointment', 'patient_name', 'appointment_date', 'diagnosis',
                 'prescription', 'treatment_plan', 'follow_up_date', 'vital_signs',
                 'lab_results', 'doctor_notes', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='appointment.patient.user.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='appointment.doctor.user.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'appointment', 'patient_name', 'doctor_name', 'amount',
                 'payment_method', 'payment_status', 'transaction_id', 'payment_date', 'created_at']

class DoctorAvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()
    doctor_id = serializers.IntegerField()
    
    def validate_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Date cannot be in the past")
        return value