from django.contrib import admin
from .models import Department, DoctorSchedule, Appointment, TimeSlot, MedicalRecord, Payment

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'head_doctor', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)

@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'day_of_week', 'start_time', 'end_time', 'is_available', 'max_patients')
    list_filter = ('day_of_week', 'is_available')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'appointment_date', 'appointment_time', 'status', 'priority')
    list_filter = ('status', 'priority', 'appointment_date', 'is_first_visit')
    search_fields = ('patient__user__first_name', 'patient__user__last_name', 
                    'doctor__user__first_name', 'doctor__user__last_name')
    date_hierarchy = 'appointment_date'
    ordering = ['-appointment_date', '-appointment_time']

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'date', 'start_time', 'end_time', 'is_available', 'is_booked')
    list_filter = ('is_available', 'is_booked', 'date')
    search_fields = ('doctor__user__first_name', 'doctor__user__last_name')
    date_hierarchy = 'date'

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'created_at', 'follow_up_date')
    search_fields = ('appointment__patient__user__first_name', 'appointment__patient__user__last_name',
                    'diagnosis')
    list_filter = ('created_at', 'follow_up_date')
    date_hierarchy = 'created_at'

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'amount', 'payment_method', 'payment_status', 'payment_date')
    list_filter = ('payment_method', 'payment_status', 'payment_date')
    search_fields = ('appointment__patient__user__first_name', 'appointment__patient__user__last_name',
                    'transaction_id')
    date_hierarchy = 'payment_date'
