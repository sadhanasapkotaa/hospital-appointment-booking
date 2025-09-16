#!/usr/bin/env python
"""
Simple script to create sample doctors for testing
Run this from the backend directory: python create_doctors.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append('/workspaces/hospital-appointment-booking/backend')

django.setup()

from user.models import CustomUser, Doctor

def create_sample_doctors():
    """Create sample doctors for testing"""
    
    doctors_data = [
        {
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john.smith@hospital.com',
            'specialization': 'Cardiology',
            'license_number': 'MD001',
            'experience_years': 10,
            'consultation_fee': 150.00
        },
        {
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'email': 'sarah.johnson@hospital.com',
            'specialization': 'Pediatrics',
            'license_number': 'MD002',
            'experience_years': 8,
            'consultation_fee': 120.00
        },
        {
            'first_name': 'Michael',
            'last_name': 'Davis',
            'email': 'michael.davis@hospital.com',
            'specialization': 'Orthopedics',
            'license_number': 'MD003',
            'experience_years': 12,
            'consultation_fee': 180.00
        },
    ]
    
    created_count = 0
    
    for doctor_data in doctors_data:
        # Check if doctor already exists
        if CustomUser.objects.filter(email=doctor_data['email']).exists():
            print(f"Doctor {doctor_data['email']} already exists, skipping...")
            continue
            
        try:
            # Create user
            username = doctor_data['email'].split('@')[0]
            user = CustomUser.objects.create_user(
                username=username,
                email=doctor_data['email'],
                first_name=doctor_data['first_name'],
                last_name=doctor_data['last_name'],
                password='password123',
                user_type='doctor',
                phone=f'+1-555-{1000 + created_count}'
            )
            
            # Create doctor profile
            Doctor.objects.create(
                user=user,
                specialization=doctor_data['specialization'],
                license_number=doctor_data['license_number'],
                experience_years=doctor_data['experience_years'],
                consultation_fee=doctor_data['consultation_fee']
            )
            
            print(f"Created doctor: Dr. {doctor_data['first_name']} {doctor_data['last_name']} ({doctor_data['specialization']})")
            created_count += 1
            
        except Exception as e:
            print(f"Error creating doctor {doctor_data['email']}: {e}")
    
    print(f"\nTotal doctors created: {created_count}")
    return created_count

if __name__ == '__main__':
    create_sample_doctors()