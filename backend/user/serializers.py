from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Doctor, Patient, Staff

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    # Additional fields for different user types
    specialization = serializers.CharField(required=False, allow_blank=True)
    license_number = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False, default=0)
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    
    employee_id = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    position = serializers.CharField(required=False, allow_blank=True)
    
    emergency_contact = serializers.CharField(required=False, allow_blank=True)
    blood_group = serializers.CharField(required=False, allow_blank=True)
    medical_history = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'password', 'confirm_password', 
            'first_name', 'last_name', 'user_type', 'phone', 'date_of_birth', 'address',
            # Doctor fields
            'specialization', 'license_number', 'experience_years', 'consultation_fee',
            # Staff fields
            'employee_id', 'department', 'position',
            # Patient fields
            'emergency_contact', 'blood_group', 'medical_history'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        
        user_type = attrs.get('user_type')
        
        # Validate required fields based on user type
        if user_type == 'doctor':
            if not attrs.get('specialization'):
                raise serializers.ValidationError("Specialization is required for doctors")
            if not attrs.get('license_number'):
                raise serializers.ValidationError("License number is required for doctors")
                
        elif user_type == 'staff':
            if not attrs.get('employee_id'):
                raise serializers.ValidationError("Employee ID is required for staff")
            if not attrs.get('department'):
                raise serializers.ValidationError("Department is required for staff")
            if not attrs.get('position'):
                raise serializers.ValidationError("Position is required for staff")
        
        return attrs
    
    def create(self, validated_data):
        # Extract profile-specific fields
        doctor_fields = {
            'specialization': validated_data.pop('specialization', ''),
            'license_number': validated_data.pop('license_number', ''),
            'experience_years': validated_data.pop('experience_years', 0),
            'consultation_fee': validated_data.pop('consultation_fee', 0),
        }
        
        staff_fields = {
            'employee_id': validated_data.pop('employee_id', ''),
            'department': validated_data.pop('department', ''),
            'position': validated_data.pop('position', ''),
        }
        
        patient_fields = {
            'emergency_contact': validated_data.pop('emergency_contact', ''),
            'blood_group': validated_data.pop('blood_group', ''),
            'medical_history': validated_data.pop('medical_history', ''),
        }
        
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')
        
        try:
            user = CustomUser(**validated_data)
            user.set_password(password)
            user.save()
            
            # Create related profile based on user type
            if user.user_type == 'doctor':
                Doctor.objects.create(
                    user=user,
                    specialization=doctor_fields['specialization'],
                    license_number=doctor_fields['license_number'],
                    experience_years=doctor_fields['experience_years'],
                    consultation_fee=doctor_fields['consultation_fee']
                )
            elif user.user_type == 'staff':
                Staff.objects.create(
                    user=user,
                    employee_id=staff_fields['employee_id'],
                    department=staff_fields['department'],
                    position=staff_fields['position']
                )
            elif user.user_type == 'patient':
                Patient.objects.create(
                    user=user,
                    emergency_contact=patient_fields['emergency_contact'],
                    blood_group=patient_fields['blood_group'],
                    medical_history=patient_fields['medical_history']
                )
            
            return user
            
        except Exception as e:
            # If profile creation fails, delete the user to maintain consistency
            if user and user.pk:
                user.delete()
            raise serializers.ValidationError(f"Registration failed: {str(e)}")

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    user_type = serializers.CharField(required=False)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user_type = attrs.get('user_type')
        
        if email and password:
            # Find user by email
            try:
                user_obj = CustomUser.objects.get(email=email)
                username = user_obj.username
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError('Invalid email or password')
            
            # Authenticate with username
            user = authenticate(username=username, password=password)
            
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled')
                
                # Check user type if provided
                if user_type and user.user_type != user_type:
                    raise serializers.ValidationError('Invalid user type for this account')
                
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError('Invalid email or password')
        else:
            raise serializers.ValidationError('Must include email and password')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'user_type', 'phone', 'is_active', 'date_joined')
        read_only_fields = ('id', 'username', 'date_joined')