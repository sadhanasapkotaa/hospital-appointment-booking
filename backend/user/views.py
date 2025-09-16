from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .models import CustomUser, Patient, Doctor

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user
    """
    print(f"Registration request data: {request.data}")  # Debug log
    
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)
    
    print(f"Serializer errors: {serializer.errors}")  # Debug log
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login user and return token
    """
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        login(request, user)
        
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_user(request):
    """
    Logout user and delete token
    """
    try:
        request.user.auth_token.delete()
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except:
        return Response({
            'error': 'Something went wrong'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def user_profile(request):
    """
    Get current user profile
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_patient(request):
    """
    Add a new patient (Staff/Admin only)
    """
    print(f"Add patient request from user: {request.user.email} (type: {request.user.user_type})")
    print(f"Request data: {request.data}")
    
    # Check if user is staff or admin
    if request.user.user_type not in ['staff', 'admin']:
        print(f"Access denied: User type {request.user.user_type} not allowed")
        return Response({
            'error': 'Only staff and admin can add patients'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Create a unique username from email
    email = request.data.get('email')
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate username from email
    username = email.split('@')[0]
    base_username = username
    counter = 1
    while CustomUser.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    # Create user directly without using registration serializer
    try:
        # Create the user
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password='TempPass123!',  # Temporary password
            first_name=request.data.get('firstName', ''),
            last_name=request.data.get('lastName', ''),
            phone=request.data.get('phone', ''),
            date_of_birth=request.data.get('dateOfBirth'),
            address=request.data.get('address', ''),
            user_type='patient'
        )
        
        # Create the patient profile
        patient = Patient.objects.create(
            user=user,
            emergency_contact=request.data.get('emergencyPhone', ''),
            blood_group=request.data.get('bloodGroup', ''),
            medical_history=f"Allergies: {request.data.get('allergies', 'None')}\nChronic Conditions: {request.data.get('chronicConditions', 'None')}"
        )
        
        return Response({
            'message': 'Patient added successfully',
            'patient': {
                'id': user.id,
                'firstName': user.first_name,
                'lastName': user.last_name,
                'email': user.email,
                'phone': user.phone,
                'dateOfBirth': user.date_of_birth,
                'address': user.address,
                'emergencyContact': request.data.get('emergencyContact', ''),
                'emergencyPhone': patient.emergency_contact,
                'bloodGroup': patient.blood_group,
                'allergies': request.data.get('allergies', ''),
                'chronicConditions': request.data.get('chronicConditions', ''),
                'isFirstTime': True,
                'gender': request.data.get('gender', '')
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error creating patient: {str(e)}")
        return Response({
            'error': f'Error creating patient: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patients(request):
    """
    Get all patients (Staff/Admin only)
    """
    # Check if user is staff or admin
    if request.user.user_type not in ['staff', 'admin']:
        return Response({
            'error': 'Only staff and admin can view patients'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        patients = Patient.objects.select_related('user').all()
        patient_data = []
        
        for patient in patients:
            patient_data.append({
                'id': patient.user.id,
                'firstName': patient.user.first_name,
                'lastName': patient.user.last_name,
                'email': patient.user.email,
                'phone': patient.user.phone or '',
                'dateOfBirth': patient.user.date_of_birth,
                'address': patient.user.address or '',
                'emergencyContact': '',  # We'll need to add this field to the model
                'emergencyPhone': patient.emergency_contact or '',
                'bloodGroup': patient.blood_group or '',
                'allergies': patient.medical_history,
                'chronicConditions': patient.medical_history,
            })
        
        return Response({'patients': patient_data}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error fetching patients: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doctors(request):
    """
    Get all doctors (Staff/Admin only)
    """
    # Check if user is staff or admin
    if request.user.user_type not in ['staff', 'admin']:
        return Response({
            'error': 'Only staff and admin can view doctors'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        doctors = Doctor.objects.select_related('user').all()
        doctors_data = []
        
        for doctor in doctors:
            doctors_data.append({
                'id': doctor.user.id,
                'name': f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
                'firstName': doctor.user.first_name,
                'lastName': doctor.user.last_name,
                'email': doctor.user.email,
                'phone': doctor.user.phone,
                'specialization': doctor.specialization,
                'license_number': doctor.license_number,
                'experience_years': doctor.experience_years,
                'consultation_fee': str(doctor.consultation_fee),
                'is_available': doctor.user.is_active
            })
        
        return Response({
            'doctors': doctors_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Error fetching doctors: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
