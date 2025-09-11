# Hospital Appointment Booking System - Database Documentation

## Overview
This database is designed to support a comprehensive hospital appointment booking system called "HealthPal". It includes patient management, doctor scheduling, appointment booking, medical history tracking, and prescription management.

## Database Schema

### Core Tables

#### 1. `users`
Central authentication table for all system users.
- **Purpose**: Stores login credentials and basic user information
- **Key Fields**: email, password_hash, role, first_name, last_name, phone
- **Roles**: patient, doctor, receptionist, admin

#### 2. `specialties`
Medical specialties for doctor classification.
- **Purpose**: Categorize doctors by their medical specialization
- **Examples**: Cardiology, Dermatology, Pediatrics, etc.

#### 3. `doctors`
Doctor-specific information linked to users.
- **Purpose**: Store doctor credentials, experience, and availability
- **Key Fields**: license_number, specialty_id, years_of_experience, consultation_fee
- **Schedule**: schedule_start_time, schedule_end_time for daily availability

#### 4. `patients`
Patient-specific information linked to users.
- **Purpose**: Store patient medical and personal information
- **Key Fields**: date_of_birth, gender, blood_group, allergies, chronic_conditions
- **Emergency**: emergency_contact_name, emergency_contact_phone

#### 5. `visits`
Appointment/visit records.
- **Purpose**: Track all patient appointments with doctors
- **Key Fields**: visit_date, visit_time, symptoms, current_disease, urgency_level, status
- **Statuses**: scheduled, in_progress, completed, cancelled, no_show
- **Unique Constraint**: Prevents double-booking (doctor_id, visit_date, visit_time)

#### 6. `medical_history`
Medical records from completed visits.
- **Purpose**: Store diagnosis, treatment notes, and follow-up information
- **Key Fields**: diagnosis, treatment_notes, follow_up_required, vital_signs, lab_results
- **JSONB Fields**: vital_signs and lab_results for flexible data storage

#### 7. `prescriptions`
Medications prescribed during visits.
- **Purpose**: Track prescribed medications with dosage and instructions
- **Key Fields**: medication_name, dosage, frequency, duration, instructions
- **Management**: quantity, refills_allowed, is_active for prescription tracking

### Views

#### 1. `patient_details`
Combines patient and user information for easy querying.

#### 2. `doctor_details`
Combines doctor, user, and specialty information.

#### 3. `visit_details`
Combines visit information with patient and doctor details.

### Functions and Procedures

#### 1. `book_appointment()`
- **Purpose**: Book new appointments with conflict checking
- **Validations**: Time slot availability, doctor availability, no past bookings
- **Returns**: Success status, message, appointment ID

#### 2. `cancel_appointment()`
- **Purpose**: Cancel existing appointments
- **Features**: Adds cancellation reason to notes

#### 3. `complete_appointment_with_medical_record()`
- **Purpose**: Complete appointments and add medical records
- **Features**: Updates visit status, creates medical history, adds prescriptions

#### 4. `register_patient()`
- **Purpose**: Register new patients in the system
- **Features**: Creates user account and patient profile

#### 5. `authenticate_user()`
- **Purpose**: User login authentication
- **Returns**: User details and role for session management

#### 6. `get_doctor_availability()`
- **Purpose**: Get available time slots for a doctor on a specific date
- **Logic**: Generates 30-minute slots excluding booked times

#### 7. `reschedule_appointment()`
- **Purpose**: Move appointments to different dates/times
- **Validations**: New slot availability, no past scheduling

#### 8. `get_patient_summary_for_doctor()`
- **Purpose**: Comprehensive patient information for doctors
- **Returns**: Patient info, visit history, medical records, active prescriptions

## Data Relationships

```
users (1) → (1) doctors
users (1) → (1) patients
specialties (1) → (many) doctors
patients (1) → (many) visits
doctors (1) → (many) visits
visits (1) → (0..1) medical_history
medical_history (1) → (many) prescriptions
```

## Security Features

### 1. Password Security
- Passwords stored as bcrypt hashes
- Sample password for demo accounts: "demo123"

### 2. Role-Based Access
- Four distinct roles with different system permissions
- User activation and email verification flags

### 3. Data Integrity
- Foreign key constraints maintain referential integrity
- Check constraints validate data values
- Unique constraints prevent conflicts

## Performance Optimizations

### 1. Indexes
- Email lookup for authentication
- Visit queries by patient, doctor, and date
- Medical history by patient
- Prescription lookups

### 2. Triggers
- Automatic timestamp updates on record modifications

### 3. JSONB Fields
- Flexible storage for vital signs and lab results
- Efficient querying with PostgreSQL JSONB operators

## Sample Data

The database includes realistic sample data:
- 3 doctors (Cardiology, Dermatology, Pediatrics)
- 4 patients with varying medical conditions
- Current and historical appointments
- Medical history with prescriptions
- Comprehensive prescription records

## Usage Examples

### Common Queries
See `queries.sql` for 15 common queries including:
- Doctor's daily schedule
- Patient medical history
- Available appointment slots
- Dashboard statistics
- Search functionality

### API Integration
The stored procedures are designed for easy integration with REST APIs:
- Input validation and error handling
- Structured return values
- Transaction management

## Maintenance

### 1. Backup Strategy
```sql
-- Full backup
pg_dump -U healthpal_app healthpal_hospital > backup.sql

-- Schema only
pg_dump --schema-only -U healthpal_app healthpal_hospital > schema.sql
```

### 2. Monitoring
- Connection monitoring queries
- Table size tracking
- Index usage statistics

### 3. Performance Tuning
- Recommended PostgreSQL configuration
- Memory and connection settings
- Logging configuration for debugging

## Future Enhancements

### Potential Additions
1. **Billing System**: Invoice and payment tracking
2. **Insurance Management**: Insurance provider and claim tracking
3. **Lab Results**: Detailed laboratory test management
4. **Imaging**: Medical imaging and radiology integration
5. **Notifications**: Appointment reminders and alerts
6. **Telemedicine**: Virtual appointment support
7. **Inventory**: Medical supplies and equipment tracking
8. **Staff Schedule**: Nurse and support staff scheduling

### Scalability Considerations
1. **Partitioning**: Table partitioning for large datasets
2. **Archiving**: Historical data archival strategy
3. **Replication**: Read replicas for reporting
4. **Caching**: Redis integration for frequently accessed data

## Environment Setup

### Development
```bash
# Create database
createdb healthpal_hospital

# Run setup scripts
psql -d healthpal_hospital -f setup.sql
psql -d healthpal_hospital -f schema.sql
psql -d healthpal_hospital -f procedures.sql
```

### Production
- Use connection pooling (recommended: PgBouncer)
- Enable SSL connections
- Configure backup automation
- Set up monitoring and alerting
- Implement proper logging and auditing

This database design provides a solid foundation for a modern hospital appointment booking system with room for future expansion and optimization.
