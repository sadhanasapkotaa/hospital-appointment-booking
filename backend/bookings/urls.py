from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('doctor/dashboard/', views.doctor_dashboard, name='doctor_dashboard'),
    
    # Appointments
    path('appointments/', views.user_appointments, name='user_appointments'),
    path('appointments/create/', views.create_appointment, name='create_appointment'),
    path('appointments/create-by-staff/', views.create_appointment_by_staff, name='create_appointment_by_staff'),
    path('appointments/<int:appointment_id>/', views.appointment_detail, name='appointment_detail'),
    path('appointments/<int:appointment_id>/update-status/', views.update_appointment_status, name='update_appointment_status'),
    
    # Doctors
    path('doctors/', views.doctors_list, name='doctors_list'),
    
    # Time slots
    path('time-slots/', views.available_time_slots, name='available_time_slots'),
    
    # Schedules
    path('schedules/', views.doctor_schedules, name='doctor_schedules'),
    path('schedules/create/', views.create_doctor_schedule, name='create_doctor_schedule'),
    
    # Departments
    path('departments/', views.DepartmentListView.as_view(), name='departments_list'),
    
    # Medical records
    path('medical-records/', views.medical_records, name='medical_records'),
    path('medical-records/create/', views.create_medical_record, name='create_medical_record'),
    
    # Payments
    path('payments/', views.payments, name='payments'),
]