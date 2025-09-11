-- Common SQL queries for the Hospital Appointment Booking System

-- 1. Get all appointments for a specific doctor on a given date
SELECT 
    v.id,
    v.visit_time,
    p.first_name || ' ' || p.last_name as patient_name,
    p.email as patient_email,
    p.phone as patient_phone,
    v.symptoms,
    v.current_disease,
    v.urgency_level,
    v.status,
    v.notes,
    p.is_first_time
FROM visits v
JOIN patient_details p ON v.patient_id = p.id
WHERE v.doctor_id = ? AND v.visit_date = ?
ORDER BY v.visit_time;

-- 2. Get all patients for a specific doctor
SELECT DISTINCT
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    p.date_of_birth,
    p.gender,
    p.blood_group,
    p.allergies,
    p.chronic_conditions,
    p.is_first_time,
    COUNT(v.id) as total_visits,
    MAX(v.visit_date) as last_visit_date
FROM patient_details p
JOIN visits v ON p.id = v.patient_id
WHERE v.doctor_id = ?
GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, p.date_of_birth, p.gender, p.blood_group, p.allergies, p.chronic_conditions, p.is_first_time
ORDER BY p.last_name, p.first_name;

-- 3. Get medical history for a specific patient
SELECT 
    mh.id,
    mh.visit_date,
    mh.diagnosis,
    mh.treatment_notes,
    mh.follow_up_required,
    mh.follow_up_date,
    mh.vital_signs,
    mh.lab_results,
    d.first_name || ' ' || d.last_name as doctor_name,
    d.specialty,
    -- Get prescriptions for this medical history record
    ARRAY_AGG(
        CASE WHEN pr.id IS NOT NULL THEN
            pr.medication_name || ' ' || pr.dosage || ' - ' || pr.frequency || ' for ' || pr.duration
        END
    ) FILTER (WHERE pr.id IS NOT NULL) as prescriptions
FROM medical_history mh
JOIN doctor_details d ON mh.doctor_id = d.id
LEFT JOIN prescriptions pr ON mh.id = pr.medical_history_id AND pr.is_active = TRUE
WHERE mh.patient_id = ?
GROUP BY mh.id, mh.visit_date, mh.diagnosis, mh.treatment_notes, mh.follow_up_required, mh.follow_up_date, mh.vital_signs, mh.lab_results, d.first_name, d.last_name, d.specialty
ORDER BY mh.visit_date DESC;

-- 4. Get all visits with patient and doctor details (for receptionist dashboard)
SELECT 
    v.id,
    v.visit_date,
    v.visit_time,
    v.symptoms,
    v.current_disease,
    v.urgency_level,
    v.status,
    v.notes,
    p.first_name as patient_first_name,
    p.last_name as patient_last_name,
    p.email as patient_email,
    p.phone as patient_phone,
    p.is_first_time,
    d.first_name as doctor_first_name,
    d.last_name as doctor_last_name,
    d.specialty,
    v.created_at,
    v.updated_at
FROM visits v
JOIN patient_details p ON v.patient_id = p.id
JOIN doctor_details d ON v.doctor_id = d.id
WHERE v.status = 'scheduled'
ORDER BY v.visit_date, v.visit_time;

-- 5. Get available time slots for a doctor on a specific date
SELECT time_slot
FROM (
    SELECT (schedule_start_time + (interval '30 minutes' * generate_series(0, 
        EXTRACT(EPOCH FROM (schedule_end_time - schedule_start_time))/1800 - 1
    )))::TIME as time_slot
    FROM doctors 
    WHERE id = ? AND is_available = TRUE
) available_slots
WHERE time_slot NOT IN (
    SELECT visit_time 
    FROM visits 
    WHERE doctor_id = ? AND visit_date = ? AND status IN ('scheduled', 'in_progress')
)
ORDER BY time_slot;

-- 6. Search patients by name, email, or phone
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    p.date_of_birth,
    p.gender,
    p.is_first_time,
    COUNT(v.id) as total_visits
FROM patient_details p
LEFT JOIN visits v ON p.id = v.patient_id
WHERE 
    LOWER(p.first_name) LIKE LOWER(?) OR
    LOWER(p.last_name) LIKE LOWER(?) OR
    LOWER(p.email) LIKE LOWER(?) OR
    p.phone LIKE ?
GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, p.date_of_birth, p.gender, p.is_first_time
ORDER BY p.last_name, p.first_name;

-- 7. Get dashboard statistics for doctor
SELECT 
    COUNT(CASE WHEN v.visit_date = CURRENT_DATE AND v.status = 'scheduled' THEN 1 END) as today_appointments,
    COUNT(CASE WHEN v.visit_date = CURRENT_DATE AND v.status = 'completed' THEN 1 END) as completed_today,
    COUNT(CASE WHEN v.status = 'scheduled' THEN 1 END) as pending_visits,
    COUNT(DISTINCT v.patient_id) as total_patients
FROM visits v
WHERE v.doctor_id = ?;

-- 8. Get dashboard statistics for receptionist
SELECT 
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as pending_appointments,
    COUNT(CASE WHEN visit_date = CURRENT_DATE AND status = 'completed' THEN 1 END) as completed_today,
    COUNT(CASE WHEN visit_date = CURRENT_DATE THEN 1 END) as today_appointments
FROM visits;

-- 9. Create a new visit/appointment
INSERT INTO visits (patient_id, doctor_id, visit_date, visit_time, symptoms, current_disease, urgency_level, status, notes)
VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?);

-- 10. Update visit status
UPDATE visits 
SET status = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ?;

-- 11. Add medical history record with prescriptions
WITH new_medical_history AS (
    INSERT INTO medical_history (patient_id, visit_id, doctor_id, visit_date, diagnosis, treatment_notes, follow_up_required, follow_up_date, vital_signs)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?::JSONB)
    RETURNING id
)
INSERT INTO prescriptions (medical_history_id, medication_name, dosage, frequency, duration, instructions, quantity, refills_allowed)
SELECT 
    nmh.id,
    unnest(?::TEXT[]) as medication_name,
    unnest(?::TEXT[]) as dosage,
    unnest(?::TEXT[]) as frequency,
    unnest(?::TEXT[]) as duration,
    unnest(?::TEXT[]) as instructions,
    unnest(?::INTEGER[]) as quantity,
    unnest(?::INTEGER[]) as refills_allowed
FROM new_medical_history nmh;

-- 12. Get upcoming appointments for a patient
SELECT 
    v.id,
    v.visit_date,
    v.visit_time,
    v.current_disease,
    v.status,
    d.first_name || ' ' || d.last_name as doctor_name,
    d.specialty,
    d.consultation_fee
FROM visits v
JOIN doctor_details d ON v.doctor_id = d.id
WHERE v.patient_id = ? AND v.visit_date >= CURRENT_DATE
ORDER BY v.visit_date, v.visit_time;

-- 13. Get active prescriptions for a patient
SELECT 
    pr.id,
    pr.medication_name,
    pr.dosage,
    pr.frequency,
    pr.duration,
    pr.instructions,
    pr.refills_allowed,
    mh.visit_date as prescribed_date,
    d.first_name || ' ' || d.last_name as doctor_name
FROM prescriptions pr
JOIN medical_history mh ON pr.medical_history_id = mh.id
JOIN doctor_details d ON mh.doctor_id = d.id
WHERE mh.patient_id = ? AND pr.is_active = TRUE
ORDER BY mh.visit_date DESC;

-- 14. Check for appointment conflicts
SELECT COUNT(*) as conflicts
FROM visits 
WHERE doctor_id = ? 
AND visit_date = ? 
AND visit_time = ? 
AND status IN ('scheduled', 'in_progress')
AND id != COALESCE(?, 0); -- Exclude current appointment when updating

-- 15. Get patient's visit history with a specific doctor
SELECT 
    v.id,
    v.visit_date,
    v.visit_time,
    v.symptoms,
    v.current_disease,
    v.status,
    v.notes,
    mh.diagnosis,
    mh.treatment_notes,
    mh.follow_up_required,
    mh.follow_up_date
FROM visits v
LEFT JOIN medical_history mh ON v.id = mh.visit_id
WHERE v.patient_id = ? AND v.doctor_id = ?
ORDER BY v.visit_date DESC, v.visit_time DESC;
