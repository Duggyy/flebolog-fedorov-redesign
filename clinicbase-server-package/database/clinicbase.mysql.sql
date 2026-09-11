CREATE TABLE doctors (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  full_name VARCHAR(180) NOT NULL,
  birth_date DATE NULL,
  speciality VARCHAR(180) NOT NULL,
  organization VARCHAR(180) NOT NULL,
  address TEXT NULL,
  phone VARCHAR(40) NULL,
  email VARCHAR(180) NULL,
  login VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE patients (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  doctor_id VARCHAR(64) NOT NULL,
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
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  doctor_id VARCHAR(64) NOT NULL,
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

CREATE TABLE field_suggestions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  doctor_id VARCHAR(64) NULL,
  label VARCHAR(180) NOT NULL,
  suggestions_json JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_suggestions_scope (doctor_id, label),
  CONSTRAINT fk_suggestions_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Первый врач для проверки. Пароль: 1234
INSERT INTO doctors
  (id, full_name, birth_date, speciality, organization, address, phone, email, login, password_hash)
VALUES
  ('fedorov', 'Федоров А. И.', NULL, 'Врач-флеболог', 'Ниармедик', 'Москва', NULL, NULL, 'fedorov', '1234'),
  ('uzist', 'Иванова М. С.', NULL, 'Врач УЗИ', 'Ниармедик', 'Москва', NULL, NULL, 'ivanova', '1234');

INSERT INTO patients
  (id, doctor_id, last_name, first_name, middle_name, birth_date, phone, address)
VALUES
  ('patient-1', 'fedorov', 'Смирнова', 'Елена', 'Петровна', '1978-04-18', '+7 900 123-45-67', 'Москва'),
  ('patient-2', 'fedorov', 'Кузнецов', 'Андрей', 'Викторович', '1965-11-03', '+7 916 555-12-12', 'Московская область'),
  ('patient-3', 'uzist', 'Орлова', 'Мария', 'Игоревна', '1984-02-09', '+7 985 222-10-44', 'Москва');

INSERT INTO visits
  (id, patient_id, doctor_id, record_date, age_at_visit, doctor_name, consultation_type, complaints, disease_history, heredity, allergies, general_exam, local_exam, ultrasound_device, deep_veins_right, deep_veins_left, surface_veins_right_gsv, ultrasound_conclusion, diagnosis_main, diagnosis_code, medication_therapy, non_medication_therapy, recommendations, next_visit_date)
VALUES
  ('visit-1', 'patient-1', 'fedorov', '2026-05-26', 48, 'Федоров А. И.', 'Первичная консультация флеболога', 'Тяжесть в ногах к вечеру, отечность голеней.', 'Симптомы отмечает около 3 лет, усилились за последние месяцы.', 'У матери варикозная болезнь.', 'Отрицает.', 'Общее состояние удовлетворительное.', 'Варикозно расширенные притоки по медиальной поверхности правой голени.', 'Mindray DC-80', 'Проходимы, компрессия полная.', 'Проходимы, компрессия полная.', 'Рефлюкс по БПВ справа.', 'Эхопризнаки варикозной болезни правой нижней конечности.', 'Варикозная болезнь нижних конечностей.', 'I83.9', 'Венотоник курсом 2 месяца.', 'Компрессионный трикотаж 2 класса.', 'Контрольный осмотр после дообследования.', '2026-06-10');
