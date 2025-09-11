-- Stored procedures for the Hospital Appointment Booking System

-- 1. Procedure to book a new appointment
CREATE OR REPLACE FUNCTION book_appointment(
    p_patient_id INTEGER,
    p_doctor_id INTEGER,
    p_visit_date DATE,
    p_visit_time TIME,
    p_symptoms TEXT,
    p_current_disease VARCHAR(255),
    p_urgency_level VARCHAR(20) DEFAULT 'normal',
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, appointment_id INTEGER) AS $$
DECLARE
    v_appointment_id INTEGER;
    v_conflict_count INTEGER;
BEGIN
    -- Check for scheduling conflicts
    SELECT COUNT(*) INTO v_conflict_count
    FROM visits 
    WHERE doctor_id = p_doctor_id 
    AND visit_date = p_visit_date 
    AND visit_time = p_visit_time 
    AND status IN ('scheduled', 'in_progress');
    
    -- Check if doctor is available
    IF NOT EXISTS (SELECT 1 FROM doctors WHERE id = p_doctor_id AND is_available = TRUE) THEN
        RETURN QUERY SELECT FALSE, 'Doctor is not available'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Check for conflicts
    IF v_conflict_count > 0 THEN
        RETURN QUERY SELECT FALSE, 'Time slot is already booked'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Check if appointment is in the past
    IF p_visit_date < CURRENT_DATE OR (p_visit_date = CURRENT_DATE AND p_visit_time < CURRENT_TIME) THEN
        RETURN QUERY SELECT FALSE, 'Cannot book appointments in the past'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Insert the appointment
    INSERT INTO visits (patient_id, doctor_id, visit_date, visit_time, symptoms, current_disease, urgency_level, status, notes)
    VALUES (p_patient_id, p_doctor_id, p_visit_date, p_visit_time, p_symptoms, p_current_disease, p_urgency_level, 'scheduled', p_notes)
    RETURNING id INTO v_appointment_id;
    
    RETURN QUERY SELECT TRUE, 'Appointment booked successfully'::TEXT, v_appointment_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Procedure to cancel an appointment
CREATE OR REPLACE FUNCTION cancel_appointment(
    p_appointment_id INTEGER,
    p_reason TEXT DEFAULT 'Cancelled by user'
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
    -- Check if appointment exists and is not already cancelled/completed
    IF NOT EXISTS (SELECT 1 FROM visits WHERE id = p_appointment_id AND status = 'scheduled') THEN
        RETURN QUERY SELECT FALSE, 'Appointment not found or cannot be cancelled'::TEXT;
        RETURN;
    END IF;
    
    -- Update appointment status
    UPDATE visits 
    SET status = 'cancelled', 
        notes = COALESCE(notes, '') || ' | Cancellation reason: ' || p_reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_appointment_id;
    
    RETURN QUERY SELECT TRUE, 'Appointment cancelled successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 3. Procedure to complete an appointment and add medical record
CREATE OR REPLACE FUNCTION complete_appointment_with_medical_record(
    p_appointment_id INTEGER,
    p_diagnosis TEXT,
    p_treatment_notes TEXT,
    p_follow_up_required BOOLEAN DEFAULT FALSE,
    p_follow_up_date DATE DEFAULT NULL,
    p_vital_signs JSONB DEFAULT NULL,
    p_lab_results JSONB DEFAULT NULL,
    p_prescriptions JSONB DEFAULT NULL -- Array of prescription objects
)
RETURNS TABLE(success BOOLEAN, message TEXT, medical_history_id INTEGER) AS $$
DECLARE
    v_visit RECORD;
    v_medical_history_id INTEGER;
    v_prescription JSONB;
BEGIN
    -- Get visit details
    SELECT * INTO v_visit FROM visits WHERE id = p_appointment_id AND status = 'scheduled';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Appointment not found or not in scheduled status'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Update visit status to completed
    UPDATE visits 
    SET status = 'completed', updated_at = CURRENT_TIMESTAMP
    WHERE id = p_appointment_id;
    
    -- Insert medical history record
    INSERT INTO medical_history (
        patient_id, visit_id, doctor_id, visit_date, diagnosis, 
        treatment_notes, follow_up_required, follow_up_date, vital_signs, lab_results
    )
    VALUES (
        v_visit.patient_id, p_appointment_id, v_visit.doctor_id, v_visit.visit_date,
        p_diagnosis, p_treatment_notes, p_follow_up_required, p_follow_up_date,
        p_vital_signs, p_lab_results
    )
    RETURNING id INTO v_medical_history_id;
    
    -- Insert prescriptions if provided
    IF p_prescriptions IS NOT NULL THEN
        FOR v_prescription IN SELECT * FROM jsonb_array_elements(p_prescriptions)
        LOOP
            INSERT INTO prescriptions (
                medical_history_id, medication_name, dosage, frequency, 
                duration, instructions, quantity, refills_allowed
            )
            VALUES (
                v_medical_history_id,
                v_prescription->>'medication_name',
                v_prescription->>'dosage',
                v_prescription->>'frequency',
                v_prescription->>'duration',
                v_prescription->>'instructions',
                (v_prescription->>'quantity')::INTEGER,
                COALESCE((v_prescription->>'refills_allowed')::INTEGER, 0)
            );
        END LOOP;
    END IF;
    
    RETURN QUERY SELECT TRUE, 'Appointment completed and medical record added'::TEXT, v_medical_history_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to register a new patient
CREATE OR REPLACE FUNCTION register_patient(
    p_email VARCHAR(255),
    p_password_hash VARCHAR(255),
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_phone VARCHAR(20),
    p_date_of_birth DATE,
    p_gender VARCHAR(10),
    p_address TEXT,
    p_emergency_contact_name VARCHAR(100),
    p_emergency_contact_phone VARCHAR(20),
    p_blood_group VARCHAR(5) DEFAULT NULL,
    p_allergies TEXT DEFAULT NULL,
    p_chronic_conditions TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, patient_id INTEGER, user_id INTEGER) AS $$
DECLARE
    v_user_id INTEGER;
    v_patient_id INTEGER;
BEGIN
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        RETURN QUERY SELECT FALSE, 'Email already registered'::TEXT, NULL::INTEGER, NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Insert user record
    INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, email_verified)
    VALUES (p_email, p_password_hash, 'patient', p_first_name, p_last_name, p_phone, TRUE, FALSE)
    RETURNING id INTO v_user_id;
    
    -- Insert patient record
    INSERT INTO patients (
        user_id, date_of_birth, gender, address, emergency_contact_name,
        emergency_contact_phone, blood_group, allergies, chronic_conditions, is_first_time
    )
    VALUES (
        v_user_id, p_date_of_birth, p_gender, p_address, p_emergency_contact_name,
        p_emergency_contact_phone, p_blood_group, p_allergies, p_chronic_conditions, TRUE
    )
    RETURNING id INTO v_patient_id;
    
    RETURN QUERY SELECT TRUE, 'Patient registered successfully'::TEXT, v_patient_id, v_user_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to authenticate user and get role
CREATE OR REPLACE FUNCTION authenticate_user(
    p_email VARCHAR(255),
    p_password_hash VARCHAR(255)
)
RETURNS TABLE(
    success BOOLEAN, 
    message TEXT, 
    user_id INTEGER, 
    role VARCHAR(50), 
    first_name VARCHAR(100), 
    last_name VARCHAR(100)
) AS $$
DECLARE
    v_user RECORD;
BEGIN
    -- Find user by email and password
    SELECT u.* INTO v_user 
    FROM users u 
    WHERE u.email = p_email AND u.password_hash = p_password_hash AND u.is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Invalid email or password'::TEXT, NULL::INTEGER, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR;
        RETURN;
    END IF;
    
    -- Update last login
    UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = v_user.id;
    
    RETURN QUERY SELECT TRUE, 'Login successful'::TEXT, v_user.id, v_user.role, v_user.first_name, v_user.last_name;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get doctor's schedule for a date range
CREATE OR REPLACE FUNCTION get_doctor_schedule(
    p_doctor_id INTEGER,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    visit_date DATE,
    visit_time TIME,
    patient_name TEXT,
    patient_email VARCHAR(255),
    symptoms TEXT,
    current_disease VARCHAR(255),
    urgency_level VARCHAR(20),
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.visit_date,
        v.visit_time,
        (pd.first_name || ' ' || pd.last_name) as patient_name,
        pd.email as patient_email,
        v.symptoms,
        v.current_disease,
        v.urgency_level,
        v.status
    FROM visits v
    JOIN patient_details pd ON v.patient_id = pd.id
    WHERE v.doctor_id = p_doctor_id 
    AND v.visit_date BETWEEN p_start_date AND p_end_date
    AND v.status IN ('scheduled', 'in_progress')
    ORDER BY v.visit_date, v.visit_time;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to reschedule an appointment
CREATE OR REPLACE FUNCTION reschedule_appointment(
    p_appointment_id INTEGER,
    p_new_date DATE,
    p_new_time TIME,
    p_reason TEXT DEFAULT 'Rescheduled by user'
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    v_doctor_id INTEGER;
    v_conflict_count INTEGER;
BEGIN
    -- Get doctor ID from existing appointment
    SELECT doctor_id INTO v_doctor_id FROM visits WHERE id = p_appointment_id AND status = 'scheduled';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Appointment not found or cannot be rescheduled'::TEXT;
        RETURN;
    END IF;
    
    -- Check for conflicts at new time
    SELECT COUNT(*) INTO v_conflict_count
    FROM visits 
    WHERE doctor_id = v_doctor_id 
    AND visit_date = p_new_date 
    AND visit_time = p_new_time 
    AND status IN ('scheduled', 'in_progress')
    AND id != p_appointment_id;
    
    IF v_conflict_count > 0 THEN
        RETURN QUERY SELECT FALSE, 'New time slot is already booked'::TEXT;
        RETURN;
    END IF;
    
    -- Check if new appointment is in the past
    IF p_new_date < CURRENT_DATE OR (p_new_date = CURRENT_DATE AND p_new_time < CURRENT_TIME) THEN
        RETURN QUERY SELECT FALSE, 'Cannot reschedule to past date/time'::TEXT;
        RETURN;
    END IF;
    
    -- Update appointment
    UPDATE visits 
    SET visit_date = p_new_date,
        visit_time = p_new_time,
        notes = COALESCE(notes, '') || ' | Rescheduled: ' || p_reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_appointment_id;
    
    RETURN QUERY SELECT TRUE, 'Appointment rescheduled successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to get patient summary for doctor
CREATE OR REPLACE FUNCTION get_patient_summary_for_doctor(
    p_patient_id INTEGER,
    p_doctor_id INTEGER
)
RETURNS TABLE(
    patient_info JSONB,
    visit_history JSONB,
    medical_history JSONB,
    active_prescriptions JSONB
) AS $$
DECLARE
    v_patient_info JSONB;
    v_visit_history JSONB;
    v_medical_history JSONB;
    v_active_prescriptions JSONB;
BEGIN
    -- Get patient basic info
    SELECT to_jsonb(pd.*) INTO v_patient_info
    FROM patient_details pd 
    WHERE pd.id = p_patient_id;
    
    -- Get visit history with this doctor
    SELECT COALESCE(jsonb_agg(to_jsonb(vh.*)), '[]'::jsonb) INTO v_visit_history
    FROM (
        SELECT visit_date, visit_time, symptoms, current_disease, status, notes
        FROM visits 
        WHERE patient_id = p_patient_id AND doctor_id = p_doctor_id
        ORDER BY visit_date DESC, visit_time DESC
        LIMIT 10
    ) vh;
    
    -- Get medical history with this doctor
    SELECT COALESCE(jsonb_agg(to_jsonb(mh.*)), '[]'::jsonb) INTO v_medical_history
    FROM (
        SELECT visit_date, diagnosis, treatment_notes, follow_up_required, follow_up_date, vital_signs
        FROM medical_history 
        WHERE patient_id = p_patient_id AND doctor_id = p_doctor_id
        ORDER BY visit_date DESC
        LIMIT 5
    ) mh;
    
    -- Get active prescriptions from this doctor
    SELECT COALESCE(jsonb_agg(to_jsonb(ap.*)), '[]'::jsonb) INTO v_active_prescriptions
    FROM (
        SELECT pr.medication_name, pr.dosage, pr.frequency, pr.duration, pr.instructions, mh.visit_date
        FROM prescriptions pr
        JOIN medical_history mh ON pr.medical_history_id = mh.id
        WHERE mh.patient_id = p_patient_id AND mh.doctor_id = p_doctor_id AND pr.is_active = TRUE
        ORDER BY mh.visit_date DESC
    ) ap;
    
    RETURN QUERY SELECT v_patient_info, v_visit_history, v_medical_history, v_active_prescriptions;
END;
$$ LANGUAGE plpgsql;
