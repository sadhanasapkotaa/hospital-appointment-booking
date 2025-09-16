#!/usr/bin/env python
"""
Simple script to create a staff member for testing login
Run this from the backend directory: python create_staff.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append('/workspaces/hospital-appointment-booking/backend')

django.setup()

from user.models import CustomUser, Staff

def create_test_staff():
    """Create a test staff member for login"""
    
    email = 'receptionist@hospital.com'
    
    # Check if staff member already exists
    if CustomUser.objects.filter(email=email).exists():
        print(f"Staff member {email} already exists")
        return False
        
    try:
        # Create user
        user = CustomUser.objects.create_user(
            username='receptionist',
            email=email,
            first_name='Test',
            last_name='Receptionist',
            password='password123',
            user_type='staff',
            phone='+1-555-0001'
        )
        
        # Create staff profile
        Staff.objects.create(
            user=user,
            employee_id='ST001',
            department='Reception',
            position='Receptionist'
        )
        
        print(f"Created staff member: {email}")
        print(f"Password: password123")
        return True
        
    except Exception as e:
        print(f"Error creating staff member: {e}")
        return False

if __name__ == '__main__':
    create_test_staff()