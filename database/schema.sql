-- Hospital Appointment Booking System Database Schema
-- Created for HealthPal Hospital Management System

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_history CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS specialties CASCADE;

-- Create Specialties table
CREATE TABLE specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Users table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'receptionist', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Doctors table
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialty_id INTEGER REFERENCES specialties(id),
    years_of_experience INTEGER,
    qualifications TEXT,
    bio TEXT,
    consultation_fee DECIMAL(10,2),
    is_available BOOLEAN DEFAULT TRUE,
    schedule_start_time TIME DEFAULT '09:00:00',
    schedule_end_time TIME DEFAULT '17:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    blood_group VARCHAR(5),
    allergies TEXT,
    chronic_conditions TEXT,
    insurance_number VARCHAR(100),
    is_first_time BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Visits/Appointments table
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    symptoms TEXT NOT NULL,
    current_disease VARCHAR(255),
    urgency_level VARCHAR(20) DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    estimated_duration INTEGER DEFAULT 30, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure no double booking
    UNIQUE(doctor_id, visit_date, visit_time)
);

-- Create Medical History table
CREATE TABLE medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_id INTEGER REFERENCES visits(id) ON DELETE SET NULL,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    visit_date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    vital_signs JSONB, -- Store blood pressure, temperature, etc.
    lab_results JSONB, -- Store lab test results
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Prescriptions table
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    medical_history_id INTEGER NOT NULL REFERENCES medical_history(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    quantity INTEGER,
    refills_allowed INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_visits_patient_id ON visits(patient_id);
CREATE INDEX idx_visits_doctor_id ON visits(doctor_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_medical_history_patient_id ON medical_history(patient_id);
CREATE INDEX idx_medical_history_visit_date ON medical_history(visit_date);
CREATE INDEX idx_prescriptions_medical_history_id ON prescriptions(medical_history_id);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_history_updated_at BEFORE UPDATE ON medical_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample specialties
INSERT INTO specialties (name, description) VALUES
('Cardiology', 'Heart and cardiovascular system disorders'),
('Dermatology', 'Skin, hair, and nail conditions'),
('Pediatrics', 'Medical care for infants, children, and adolescents'),
('Orthopedics', 'Musculoskeletal system disorders'),
('Neurology', 'Nervous system disorders'),
('Oncology', 'Cancer diagnosis and treatment'),
('Psychiatry', 'Mental health disorders'),
('Radiology', 'Medical imaging and diagnosis'),
('Emergency Medicine', 'Emergency and urgent care'),
('Internal Medicine', 'General internal medicine for adults');

-- Insert sample users (passwords are hashed versions of 'demo123')
INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, email_verified) VALUES
-- Doctors
('sarah.johnson@healthpal.com', '$2b$10$rQZ9kHf7Y8pKjF.QJbEz8eGxQ9kP2F5nF8mH9jK2L4mP6qR8sT0uV', 'doctor', 'Sarah', 'Johnson', '+1-555-0101', TRUE, TRUE),
('michael.chen@healthpal.com', '$2b$10$rQZ9kHf7Y8pKjF.QJbEz8eGxQ9kP2F5nF8mH9jK2L4mP6qR8sT0uV', 'doctor', 'Michael', 'Chen', '+1-555-0102', TRUE, TRUE),
('emily.rodriguez@healthpal.com', '$2b$10$rQZ9kHf7Y8pKjF.QJbEz8eGxQ9kP2F5nF8mH9jK2L4mP6qR8sT0uV', 'doctor', 'Emily', 'Rodriguez', '+1-555-0103', TRUE, TRUE),

-- Receptionists
('mary.wilson@healthpal.com', '$2b$10$rQZ9kHf7Y8pKjF.QJbEz8eGxQ9kP2F5nF8mH9jK2L4mP6qR8sT0uV', 'receptionist', 'Mary', 'Wilson', '+1-555-0201', TRUE, TRUE),
('james.anderson@healthpal.com', '$2b$10$rQZ9kHf7Y8pKjF.QJbEz8eGxQ9kP2F5nF8mH9jK2L4mP6qR8sT0uV', 'receptionist', 'James', 'Anderson', '+1-555-0202', TRUE, TRUE),

-- Patients
('john.doe@email.com', '$2b$10$rQZ9kHf7Y8pKjF.QJbEz8eGxQ9kP2F5nF8mH9jK2L4mP6qR8sT0uV', 'patient', 'John', 'Doe', '+1-555-0123', TRUE, TRUE),
('maria.garcia@email.com', '$2b$10$rQZ9kHf7Y8pKjF.QJbEz8eGxQ9kP2F5nF8mH9jK2L4mP6qR8sT0uV', 'patient', 'Maria', 'Garcia', '+1-555-0125', TRUE, TRUE),
('robert.smith@email.com', '$2b$10$rQZ9kHf7Y8pKjF.QJbEz8eGxQ9kP2F5nF8mH9jK2L4mP6qR8sT0uV', 'patient', 'Robert', 'Smith', '+1-555-0127', TRUE, TRUE),
('jane.smith@email.com', '$2b$10$rQZ9kHf7Y8pKjF.QJbEz8eGxQ9kP2F5nF8mH9jK2L4mP6qR8sT0uV', 'patient', 'Jane', 'Smith', '+1-555-0129', TRUE, TRUE);

-- Insert sample doctors
INSERT INTO doctors (user_id, license_number, specialty_id, years_of_experience, qualifications, bio, consultation_fee) VALUES
(1, 'MD-CARD-001', 1, 15, 'MD, Board Certified in Cardiology, Fellowship in Interventional Cardiology', 'Leading cardiologist specializing in interventional procedures and heart disease prevention.', 250.00),
(2, 'MD-DERM-002', 2, 12, 'MD, Board Certified in Dermatology, Fellowship in Dermatopathology', 'Expert dermatologist focusing on skin cancer detection and cosmetic dermatology.', 200.00),
(3, 'MD-PED-003', 3, 10, 'MD, Board Certified in Pediatrics, Fellowship in Pediatric Cardiology', 'Dedicated pediatrician providing comprehensive care for children and adolescents.', 180.00);

-- Insert sample patients
INSERT INTO patients (user_id, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, blood_group, allergies, chronic_conditions, is_first_time) VALUES
(6, '1985-06-15', 'male', '123 Main St, City, State 12345', 'Jane Doe', '+1-555-0124', 'A+', 'Penicillin', 'Hypertension', FALSE),
(7, '1978-03-22', 'female', '456 Oak Avenue, City, State 12345', 'Carlos Garcia', '+1-555-0126', 'O-', 'Shellfish', 'Diabetes Type 2', TRUE),
(8, '1965-11-08', 'male', '789 Pine Street, City, State 12345', 'Linda Smith', '+1-555-0128', 'B+', 'None', 'High Cholesterol, Hypertension', FALSE),
(9, '1990-03-22', 'female', '456 Oak Ave, City, State 12345', 'Robert Smith', '+1-555-0126', 'O-', 'None', 'None', TRUE);

-- Insert sample visits (using current date context - September 11, 2025)
INSERT INTO visits (patient_id, doctor_id, visit_date, visit_time, symptoms, current_disease, urgency_level, status, notes) VALUES
-- Today's appointments
(1, 1, '2025-09-11', '09:00:00', 'Chest pain, shortness of breath during exercise', 'Cardiac evaluation follow-up', 'normal', 'scheduled', 'Patient reports symptoms worsening over past week. Previous ECG showed minor irregularities.'),
(2, 1, '2025-09-11', '10:30:00', 'Fatigue, dizziness, irregular heartbeat', 'First-time cardiac consultation', 'high', 'scheduled', 'New patient referral from family doctor. Recent episodes of palpitations.'),
(3, 1, '2025-09-11', '14:00:00', 'High blood pressure readings at home', 'Hypertension management', 'normal', 'scheduled', 'Regular follow-up for blood pressure management. Patient on Lisinopril.'),

-- Past appointments
(1, 1, '2025-09-10', '11:00:00', 'Chest pain follow-up', 'Post-stress test evaluation', 'normal', 'completed', 'Stress test results reviewed. No significant abnormalities found.'),
(3, 1, '2025-09-05', '15:00:00', 'Routine cardiac checkup', 'Regular follow-up', 'normal', 'completed', 'Blood pressure well controlled. Continue current medication.'),

-- Future appointments
(4, 2, '2025-09-12', '10:00:00', 'Skin rash, itching', 'Dermatological consultation', 'normal', 'scheduled', 'New patient presenting with persistent skin condition.'),
(2, 3, '2025-09-13', '09:30:00', 'Diabetes management', 'Routine diabetes checkup', 'normal', 'scheduled', 'Regular follow-up for Type 2 diabetes management.');

-- Insert sample medical history
INSERT INTO medical_history (patient_id, visit_id, doctor_id, visit_date, diagnosis, treatment_notes, follow_up_required, follow_up_date, vital_signs) VALUES
(1, 4, 1, '2025-09-10', 'Essential Hypertension - Well Controlled', 'Patient showing good response to current medication. Blood pressure readings within normal range. Continue current treatment plan.', TRUE, '2025-10-10', '{"blood_pressure": "120/80", "heart_rate": "72", "temperature": "98.6", "weight": "180"}'),

(3, 5, 1, '2025-09-05', 'Hyperlipidemia, Essential Hypertension', 'Cholesterol levels improved significantly. Blood pressure under excellent control. Patient compliant with medication regimen.', TRUE, '2025-12-05', '{"blood_pressure": "118/75", "heart_rate": "68", "temperature": "98.4", "weight": "175", "cholesterol": "180"}'),

-- Historical records
(1, NULL, 1, '2025-08-15', 'Essential Hypertension', 'Initial diagnosis and treatment plan established. Patient education provided on lifestyle modifications.', TRUE, '2025-09-15', '{"blood_pressure": "140/90", "heart_rate": "78", "temperature": "98.6", "weight": "182"}'),

(3, NULL, 1, '2025-08-01', 'Coronary Artery Disease - Stable', 'Post-angioplasty follow-up. Stent patent and functioning well. No chest pain reported. Exercise tolerance improved significantly.', TRUE, '2025-11-01', '{"blood_pressure": "125/82", "heart_rate": "65", "temperature": "98.4", "weight": "178"}'),

(2, NULL, 1, '2025-08-25', 'Type 2 Diabetes - Newly Diagnosed', 'HbA1c elevated at 8.2%. Patient started on Metformin. Comprehensive diabetes education provided. Nutritionist referral made.', TRUE, '2025-09-25', '{"blood_pressure": "135/85", "heart_rate": "75", "temperature": "98.7", "weight": "165", "glucose": "180", "hba1c": "8.2"}');

-- Insert sample prescriptions
INSERT INTO prescriptions (medical_history_id, medication_name, dosage, frequency, duration, instructions, quantity, refills_allowed) VALUES
-- For Essential Hypertension
(1, 'Lisinopril', '10mg', 'Once daily', '90 days', 'Take in the morning with or without food. Monitor blood pressure regularly.', 90, 2),

-- For Hyperlipidemia and Hypertension
(2, 'Atorvastatin', '20mg', 'Once daily', '90 days', 'Take in the evening with dinner. Avoid grapefruit juice.', 90, 2),
(2, 'Amlodipine', '5mg', 'Once daily', '90 days', 'Take at the same time each day. May cause ankle swelling.', 90, 2),

-- For initial Hypertension treatment
(3, 'Lisinopril', '5mg', 'Once daily', '30 days', 'Start with low dose. Monitor for dry cough or dizziness.', 30, 1),

-- For Coronary Artery Disease
(4, 'Metoprolol', '50mg', 'Twice daily', '90 days', 'Take with meals. Do not stop suddenly.', 180, 2),
(4, 'Aspirin', '81mg', 'Once daily', '90 days', 'Take with food to reduce stomach irritation.', 90, 2),
(4, 'Clopidogrel', '75mg', 'Once daily', '90 days', 'Blood thinner - watch for unusual bleeding.', 90, 2),

-- For Type 2 Diabetes
(5, 'Metformin', '500mg', 'Twice daily', '90 days', 'Take with meals to reduce stomach upset. Monitor blood sugar levels.', 180, 2);

-- Create views for easier data retrieval
CREATE VIEW patient_details AS
SELECT 
    p.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    p.date_of_birth,
    p.gender,
    p.address,
    p.emergency_contact_name,
    p.emergency_contact_phone,
    p.blood_group,
    p.allergies,
    p.chronic_conditions,
    p.is_first_time,
    p.created_at,
    p.updated_at
FROM patients p
JOIN users u ON p.user_id = u.id;

CREATE VIEW doctor_details AS
SELECT 
    d.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    d.license_number,
    s.name as specialty,
    d.years_of_experience,
    d.qualifications,
    d.bio,
    d.consultation_fee,
    d.is_available,
    d.schedule_start_time,
    d.schedule_end_time,
    d.created_at,
    d.updated_at
FROM doctors d
JOIN users u ON d.user_id = u.id
LEFT JOIN specialties s ON d.specialty_id = s.id;

CREATE VIEW visit_details AS
SELECT 
    v.id,
    v.visit_date,
    v.visit_time,
    v.symptoms,
    v.current_disease,
    v.urgency_level,
    v.status,
    v.notes,
    -- Patient details
    p.first_name as patient_first_name,
    p.last_name as patient_last_name,
    p.email as patient_email,
    p.is_first_time,
    -- Doctor details
    d.first_name as doctor_first_name,
    d.last_name as doctor_last_name,
    d.specialty,
    v.created_at,
    v.updated_at
FROM visits v
JOIN patient_details p ON v.patient_id = p.id
JOIN doctor_details d ON v.doctor_id = d.id;

-- Add some useful functions
CREATE OR REPLACE FUNCTION get_doctor_availability(doctor_id INTEGER, check_date DATE)
RETURNS TABLE(available_slots TIME[]) AS $$
DECLARE
    start_time TIME;
    end_time TIME;
    slot_duration INTERVAL := '30 minutes';
    current_slot TIME;
    slots TIME[] := ARRAY[]::TIME[];
    booked_times TIME[];
BEGIN
    -- Get doctor's schedule
    SELECT schedule_start_time, schedule_end_time 
    INTO start_time, end_time
    FROM doctors 
    WHERE id = doctor_id AND is_available = TRUE;
    
    -- Get booked appointment times for the date
    SELECT ARRAY_AGG(visit_time) 
    INTO booked_times
    FROM visits 
    WHERE doctor_id = get_doctor_availability.doctor_id 
    AND visit_date = check_date 
    AND status IN ('scheduled', 'in_progress');
    
    -- Generate available slots
    current_slot := start_time;
    WHILE current_slot < end_time LOOP
        IF booked_times IS NULL OR current_slot != ALL(booked_times) THEN
            slots := array_append(slots, current_slot);
        END IF;
        current_slot := current_slot + slot_duration;
    END LOOP;
    
    RETURN QUERY SELECT slots;
END;
$$ LANGUAGE plpgsql;

-- Function to get patient medical summary
CREATE OR REPLACE FUNCTION get_patient_medical_summary(patient_id INTEGER)
RETURNS TABLE(
    total_visits INTEGER,
    last_visit_date DATE,
    active_prescriptions INTEGER,
    chronic_conditions TEXT,
    allergies TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM visits WHERE patient_id = get_patient_medical_summary.patient_id),
        (SELECT MAX(visit_date) FROM visits WHERE patient_id = get_patient_medical_summary.patient_id),
        (SELECT COUNT(*)::INTEGER FROM prescriptions pr 
         JOIN medical_history mh ON pr.medical_history_id = mh.id 
         WHERE mh.patient_id = get_patient_medical_summary.patient_id AND pr.is_active = TRUE),
        (SELECT chronic_conditions FROM patients WHERE id = get_patient_medical_summary.patient_id),
        (SELECT allergies FROM patients WHERE id = get_patient_medical_summary.patient_id);
END;
$$ LANGUAGE plpgsql;

COMMENT ON DATABASE CURRENT_DATABASE() IS 'HealthPal Hospital Appointment Booking System Database';
