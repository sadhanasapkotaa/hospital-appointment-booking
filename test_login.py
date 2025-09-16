#!/usr/bin/env python3
"""
Test script to verify login and API endpoints
"""
import requests
import json
import django
import os
import sys

# Add the backend directory to the Python path
backend_path = '/workspaces/hospital-appointment-booking/backend'
sys.path.append(backend_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from user.models import User, Doctor, Patient
from bookings.models import Appointment

def test_api_endpoints():
    base_url = 'https://friendly-space-trout-xq5jrxgp446hprw-8000.app.github.dev/api/'
    
    # Test basic connectivity
    print("Testing API connectivity...")
    try:
        response = requests.get(f"{base_url}bookings/doctors/")
        print(f"Doctors endpoint: {response.status_code}")
        if response.status_code == 200:
            print("✓ API is accessible")
        else:
            print(f"✗ API returned {response.status_code}")
    except Exception as e:
        print(f"✗ API connection failed: {e}")
    
    # Check if there are any users in the database
    print("\nChecking database users...")
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    
    doctors = Doctor.objects.all()
    print(f"Total doctors: {doctors.count()}")
    
    for doctor in doctors:
        print(f"  - Dr. {doctor.user.get_full_name()} ({doctor.user.email}) - Type: {doctor.user.user_type}")
    
    patients = Patient.objects.all()
    print(f"Total patients: {patients.count()}")
    
    for patient in patients[:3]:  # Show first 3 patients
        print(f"  - {patient.user.get_full_name()} ({patient.user.email}) - Type: {patient.user.user_type}")
    
    appointments = Appointment.objects.all()
    print(f"Total appointments: {appointments.count()}")
    
    # Test login with a doctor account if one exists
    if doctors.exists():
        doctor = doctors.first()
        print(f"\nTesting login with doctor: {doctor.user.email}")
        
        login_data = {
            'email': doctor.user.email,
            'password': 'password123',  # Default password from create_doctors.py
            'user_type': 'doctor'
        }
        
        try:
            response = requests.post(f"{base_url}auth/login/", 
                                   json=login_data,
                                   headers={'Content-Type': 'application/json'})
            print(f"Login response: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                token = data.get('token')
                print(f"✓ Login successful, token: {token[:20]}...")
                
                # Test doctor dashboard with token
                headers = {'Authorization': f'Token {token}'}
                dashboard_response = requests.get(f"{base_url}bookings/doctor/dashboard/", 
                                                headers=headers)
                print(f"Dashboard response: {dashboard_response.status_code}")
                
                if dashboard_response.status_code == 200:
                    dashboard_data = dashboard_response.json()
                    print(f"✓ Doctor dashboard accessible")
                    print(f"  - Doctor: {dashboard_data.get('doctor', {}).get('name')}")
                    print(f"  - Visits: {len(dashboard_data.get('visits', []))}")
                    print(f"  - Patients: {len(dashboard_data.get('patients', []))}")
                else:
                    print(f"✗ Dashboard failed: {dashboard_response.text}")
            else:
                print(f"✗ Login failed: {response.text}")
        except Exception as e:
            print(f"✗ Login test failed: {e}")

if __name__ == '__main__':
    test_api_endpoints()