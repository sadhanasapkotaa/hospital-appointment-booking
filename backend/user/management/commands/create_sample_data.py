from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from user.models import Doctor, Staff
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample doctors and staff for testing'
    
    def handle(self, *args, **options):
        # Sample doctors data
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
            {
                'first_name': 'Emily',
                'last_name': 'Wilson',
                'email': 'emily.wilson@hospital.com',
                'specialization': 'Dermatology',
                'license_number': 'MD004',
                'experience_years': 6,
                'consultation_fee': 100.00
            },
            {
                'first_name': 'Robert',
                'last_name': 'Brown',
                'email': 'robert.brown@hospital.com',
                'specialization': 'Neurology',
                'license_number': 'MD005',
                'experience_years': 15,
                'consultation_fee': 200.00
            }
        ]
        
        # Sample staff data
        staff_data = [
            {
                'first_name': 'Alice',
                'last_name': 'Cooper',
                'email': 'alice.cooper@hospital.com',
                'employee_id': 'ST001',
                'department': 'Reception',
                'position': 'Receptionist'
            },
            {
                'first_name': 'David',
                'last_name': 'Miller',
                'email': 'david.miller@hospital.com',
                'employee_id': 'ST002',
                'department': 'Administration',
                'position': 'Admin Assistant'
            }
        ]
        
        # Create doctors
        created_doctors = 0
        for doctor_data in doctors_data:
            username = doctor_data['email'].split('@')[0]
            
            # Check if user already exists
            if not User.objects.filter(email=doctor_data['email']).exists():
                # Create user
                user = User.objects.create_user(
                    username=username,
                    email=doctor_data['email'],
                    first_name=doctor_data['first_name'],
                    last_name=doctor_data['last_name'],
                    password='password123',
                    user_type='doctor',
                    phone=f'+1-555-{random.randint(1000, 9999)}'
                )
                
                # Create doctor profile
                Doctor.objects.create(
                    user=user,
                    specialization=doctor_data['specialization'],
                    license_number=doctor_data['license_number'],
                    experience_years=doctor_data['experience_years'],
                    consultation_fee=doctor_data['consultation_fee']
                )
                
                created_doctors += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created doctor: Dr. {doctor_data["first_name"]} {doctor_data["last_name"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Doctor already exists: {doctor_data["email"]}')
                )
        
        # Create staff
        created_staff = 0
        for staff_member in staff_data:
            username = staff_member['email'].split('@')[0]
            
            # Check if user already exists
            if not User.objects.filter(email=staff_member['email']).exists():
                # Create user
                user = User.objects.create_user(
                    username=username,
                    email=staff_member['email'],
                    first_name=staff_member['first_name'],
                    last_name=staff_member['last_name'],
                    password='password123',
                    user_type='staff',
                    phone=f'+1-555-{random.randint(1000, 9999)}'
                )
                
                # Create staff profile
                Staff.objects.create(
                    user=user,
                    employee_id=staff_member['employee_id'],
                    department=staff_member['department'],
                    position=staff_member['position']
                )
                
                created_staff += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created staff: {staff_member["first_name"]} {staff_member["last_name"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Staff member already exists: {staff_member["email"]}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nSummary: Created {created_doctors} doctors and {created_staff} staff members')
        )
        
        # Create an admin user if it doesn't exist
        admin_email = 'admin@hospital.com'
        if not User.objects.filter(email=admin_email).exists():
            admin_user = User.objects.create_user(
                username='admin',
                email=admin_email,
                first_name='Admin',
                last_name='User',
                password='admin123',
                user_type='admin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created admin user: {admin_email}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Admin user already exists: {admin_email}')
            )