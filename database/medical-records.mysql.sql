CREATE TABLE doctors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(180) NOT NULL,
  birth_date DATE NULL,
  speciality VARCHAR(180) NOT NULL,
  organization VARCHAR(180) NULL,
  address TEXT NULL,
  phone VARCHAR(40) NULL,
  email VARCHAR(180) NULL,
  login VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE patients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doctor_id BIGINT UNSIGNED NOT NULL,
  last_name VARCHAR(120) NOT NULL,
  first_name VARCHAR(120) NOT NULL,
  middle_name VARCHAR(120) NULL,
  birth_date DATE NULL,
  phone VARCHAR(40) NULL,
  address TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_patients_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE visits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  record_date DATE NOT NULL,
  age_at_visit SMALLINT UNSIGNED NULL,
  doctor_name VARCHAR(180) NULL,
  consultation_type VARCHAR(180) NULL,
  complaints TEXT NULL,
  disease_history TEXT NULL,
  heredity TEXT NULL,
  past_diseases TEXT NULL,
  past_operations TEXT NULL,
  allergies TEXT NULL,
  general_exam TEXT NULL,
  local_exam TEXT NULL,
  ultrasound_doctor VARCHAR(180) NULL,
  ultrasound_consultation_type VARCHAR(180) NULL,
  ultrasound_device VARCHAR(180) NULL,
  deep_veins_right TEXT NULL,
  deep_veins_left TEXT NULL,
  surface_veins_right_gsv TEXT NULL,
  surface_veins_right_ssv TEXT NULL,
  surface_veins_left_gsv TEXT NULL,
  surface_veins_left_ssv TEXT NULL,
  perforators TEXT NULL,
  edema TEXT NULL,
  ultrasound_conclusion TEXT NULL,
  diagnosis_main TEXT NULL,
  diagnosis_code VARCHAR(40) NULL,
  diagnosis_comorbidities TEXT NULL,
  regimen TEXT NULL,
  medication_therapy TEXT NULL,
  non_medication_therapy TEXT NULL,
  specialist_consultations TEXT NULL,
  examination_plan TEXT NULL,
  recommendations TEXT NULL,
  manipulation_name TEXT NULL,
  manipulation_done TEXT NULL,
  manipulation_result TEXT NULL,
  next_visit_date DATE NULL,
  doctor_comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_visits_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_visits_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE RESTRICT,
  INDEX idx_visits_patient_date (patient_id, record_date),
  INDEX idx_visits_doctor_date (doctor_id, record_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
