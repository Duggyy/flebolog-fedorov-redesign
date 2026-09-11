<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    respond(500, [
        'error' => 'server_not_configured',
        'message' => 'Create api/config.php from api/config.sample.php and fill MySQL credentials.',
    ]);
}

$config = require $configFile;
session_name('clinicbase_session');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

try {
    $pdo = new PDO(
        sprintf(
            'mysql:host=%s;dbname=%s;charset=utf8mb4',
            $config['db_host'] ?? 'localhost',
            $config['db_name'] ?? ''
        ),
        $config['db_user'] ?? '',
        $config['db_password'] ?? '',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (Throwable $error) {
    respond(500, ['error' => 'database_connection_failed']);
}

$action = $_GET['action'] ?? '';

try {
    match ($action) {
        'session' => handle_session(),
        'login' => handle_login($pdo, $config),
        'logout' => handle_logout(),
        'doctors' => handle_doctors($pdo),
        'doctor_save' => handle_doctor_save($pdo),
        'doctor_delete' => handle_doctor_delete($pdo),
        'records' => handle_records($pdo),
        'records_save' => handle_records_save($pdo),
        'suggestions' => handle_suggestions($pdo),
        'suggestions_save' => handle_suggestions_save($pdo),
        default => respond(404, ['error' => 'unknown_action']),
    };
} catch (Throwable $error) {
    respond(500, ['error' => 'server_error', 'message' => $error->getMessage()]);
}

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function require_role(string $role): void
{
    if (($_SESSION['role'] ?? '') !== $role) {
        respond(401, ['error' => 'unauthorized']);
    }
}

function require_logged_in(): void
{
    if (empty($_SESSION['role'])) {
        respond(401, ['error' => 'unauthorized']);
    }
}

function handle_session(): never
{
    if (empty($_SESSION['role'])) {
        respond(200, ['session' => null]);
    }

    respond(200, [
        'session' => [
            'role' => $_SESSION['role'],
            'doctorId' => $_SESSION['doctor_id'] ?? null,
        ],
    ]);
}

function handle_login(PDO $pdo, array $config): never
{
    $data = read_json();
    $login = trim((string)($data['login'] ?? ''));
    $password = (string)($data['password'] ?? '');

    if ($login === (string)($config['admin_login'] ?? 'admin')) {
        $adminPassword = (string)($config['admin_password'] ?? '');
        if ($adminPassword !== '' && hash_equals($adminPassword, $password)) {
            $_SESSION['role'] = 'admin';
            unset($_SESSION['doctor_id']);
            respond(200, ['session' => ['role' => 'admin']]);
        }
    }

    $statement = $pdo->prepare('SELECT id, password_hash FROM doctors WHERE login = ? AND is_active = 1 LIMIT 1');
    $statement->execute([$login]);
    $doctor = $statement->fetch();

    $storedPassword = (string)($doctor['password_hash'] ?? '');
    if (
        $doctor &&
        (password_verify($password, $storedPassword) || hash_equals($storedPassword, $password))
    ) {
        $_SESSION['role'] = 'doctor';
        $_SESSION['doctor_id'] = (string)$doctor['id'];
        respond(200, ['session' => ['role' => 'doctor', 'doctorId' => (string)$doctor['id']]]);
    }

    respond(401, ['error' => 'invalid_credentials']);
}

function handle_logout(): never
{
    $_SESSION = [];
    session_destroy();
    respond(200, ['ok' => true]);
}

function doctor_to_client(array $doctor): array
{
    return [
        'id' => (string)$doctor['id'],
        'name' => (string)$doctor['full_name'],
        'birthDate' => normalize_date($doctor['birth_date'] ?? null),
        'speciality' => (string)$doctor['speciality'],
        'organization' => (string)($doctor['organization'] ?? ''),
        'address' => (string)($doctor['address'] ?? ''),
        'phone' => (string)($doctor['phone'] ?? ''),
        'email' => (string)($doctor['email'] ?? ''),
        'login' => (string)$doctor['login'],
        'password' => '',
    ];
}

function handle_doctors(PDO $pdo): never
{
    require_logged_in();
    $statement = $pdo->query(
        'SELECT id, full_name, birth_date, speciality, organization, address, phone, email, login
         FROM doctors
         WHERE is_active = 1
         ORDER BY full_name'
    );
    respond(200, ['doctors' => array_map('doctor_to_client', $statement->fetchAll())]);
}

function handle_doctor_save(PDO $pdo): never
{
    require_role('admin');
    $doctor = read_json()['doctor'] ?? [];
    if (!is_array($doctor)) {
        respond(422, ['error' => 'invalid_doctor']);
    }

    $id = trim((string)($doctor['id'] ?? ''));
    if ($id === '') {
        $id = bin2hex(random_bytes(12));
    }

    $login = trim((string)($doctor['login'] ?? ''));
    $name = trim((string)($doctor['name'] ?? ''));
    $speciality = trim((string)($doctor['speciality'] ?? ''));
    $organization = trim((string)($doctor['organization'] ?? ''));
    if ($login === '' || $name === '' || $speciality === '' || $organization === '') {
        respond(422, ['error' => 'missing_required_fields']);
    }

    $password = (string)($doctor['password'] ?? '');
    $exists = $pdo->prepare('SELECT id FROM doctors WHERE id = ? LIMIT 1');
    $exists->execute([$id]);
    $doctorExists = (bool)$exists->fetch();

    if ($doctorExists) {
        $params = [
            $name,
            null_if_empty($doctor['birthDate'] ?? ''),
            $speciality,
            $organization,
            null_if_empty($doctor['address'] ?? ''),
            null_if_empty($doctor['phone'] ?? ''),
            null_if_empty($doctor['email'] ?? ''),
            $login,
        ];
        $sql = 'UPDATE doctors
                SET full_name = ?, birth_date = ?, speciality = ?, organization = ?, address = ?, phone = ?, email = ?, login = ?';
        if ($password !== '') {
            $sql .= ', password_hash = ?';
            $params[] = password_hash($password, PASSWORD_DEFAULT);
        }
        $sql .= ' WHERE id = ?';
        $params[] = $id;
        $pdo->prepare($sql)->execute($params);
    } else {
        $pdo->prepare(
            'INSERT INTO doctors
             (id, full_name, birth_date, speciality, organization, address, phone, email, login, password_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $id,
            $name,
            null_if_empty($doctor['birthDate'] ?? ''),
            $speciality,
            $organization,
            null_if_empty($doctor['address'] ?? ''),
            null_if_empty($doctor['phone'] ?? ''),
            null_if_empty($doctor['email'] ?? ''),
            $login,
            password_hash($password !== '' ? $password : '1234', PASSWORD_DEFAULT),
        ]);
    }

    $statement = $pdo->prepare(
        'SELECT id, full_name, birth_date, speciality, organization, address, phone, email, login
         FROM doctors WHERE id = ?'
    );
    $statement->execute([$id]);
    respond(200, ['doctor' => doctor_to_client($statement->fetch())]);
}

function handle_doctor_delete(PDO $pdo): never
{
    require_role('admin');
    $id = trim((string)(read_json()['id'] ?? ''));
    if ($id === '') {
        respond(422, ['error' => 'missing_id']);
    }
    $pdo->prepare('UPDATE doctors SET is_active = 0 WHERE id = ?')->execute([$id]);
    respond(200, ['ok' => true]);
}

function handle_records(PDO $pdo): never
{
    require_logged_in();
    $doctorId = $_SESSION['role'] === 'doctor' ? (string)$_SESSION['doctor_id'] : null;
    $patientsSql = 'SELECT * FROM patients';
    $visitsSql = 'SELECT * FROM visits';
    $params = [];
    if ($doctorId !== null) {
        $patientsSql .= ' WHERE doctor_id = ?';
        $visitsSql .= ' WHERE doctor_id = ?';
        $params[] = $doctorId;
    }
    $patientsSql .= ' ORDER BY last_name, first_name, middle_name';
    $visitsSql .= ' ORDER BY record_date DESC, updated_at DESC';

    $patients = query_all($pdo, $patientsSql, $params);
    $visits = query_all($pdo, $visitsSql, $params);

    respond(200, [
        'records' => [
            'patients' => array_map('patient_to_client', $patients),
            'visits' => array_map('visit_to_client', $visits),
        ],
    ]);
}

function handle_records_save(PDO $pdo): never
{
    require_logged_in();
    $records = read_json()['records'] ?? [];
    if (!is_array($records)) {
        respond(422, ['error' => 'invalid_records']);
    }

    $doctorId = $_SESSION['role'] === 'doctor' ? (string)$_SESSION['doctor_id'] : null;
    $patients = is_array($records['patients'] ?? null) ? $records['patients'] : [];
    $visits = is_array($records['visits'] ?? null) ? $records['visits'] : [];

    $pdo->beginTransaction();
    foreach ($patients as $patient) {
        if (!is_array($patient)) {
            continue;
        }
        $patientDoctorId = (string)($patient['doctorId'] ?? '');
        if ($doctorId !== null && $patientDoctorId !== $doctorId) {
            continue;
        }
        upsert_patient($pdo, $patient);
    }

    foreach ($visits as $visit) {
        if (!is_array($visit)) {
            continue;
        }
        $visitDoctorId = (string)($visit['doctorId'] ?? '');
        if ($doctorId !== null && $visitDoctorId !== $doctorId) {
            continue;
        }
        upsert_visit($pdo, $visit);
    }
    $pdo->commit();

    handle_records($pdo);
}

function handle_suggestions(PDO $pdo): never
{
    require_logged_in();
    $doctorId = $_SESSION['role'] === 'doctor' ? (string)$_SESSION['doctor_id'] : null;
    $params = [];
    $sql = 'SELECT label, suggestions_json FROM field_suggestions WHERE doctor_id IS NULL';
    if ($doctorId !== null) {
        $sql .= ' OR doctor_id = ?';
        $params[] = $doctorId;
    }

    $result = [];
    foreach (query_all($pdo, $sql, $params) as $row) {
        $label = (string)$row['label'];
        $suggestions = json_decode((string)$row['suggestions_json'], true);
        if (is_array($suggestions)) {
            $result[$label] = $suggestions;
        }
    }
    respond(200, ['suggestions' => $result]);
}

function handle_suggestions_save(PDO $pdo): never
{
    require_logged_in();
    $data = read_json();
    $label = trim((string)($data['label'] ?? ''));
    $suggestions = $data['suggestions'] ?? [];
    if ($label === '' || !is_array($suggestions)) {
        respond(422, ['error' => 'invalid_suggestions']);
    }

    $doctorId = $_SESSION['role'] === 'doctor' ? (string)$_SESSION['doctor_id'] : null;
    $pdo->prepare(
        'INSERT INTO field_suggestions (doctor_id, label, suggestions_json)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE suggestions_json = VALUES(suggestions_json)'
    )->execute([
        $doctorId,
        $label,
        json_encode(array_values($suggestions), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);

    respond(200, ['ok' => true]);
}

function null_if_empty(mixed $value): ?string
{
    $string = trim((string)$value);
    return $string === '' ? null : $string;
}

function normalize_date(mixed $value): string
{
    if ($value === null || $value === '0000-00-00') {
        return '';
    }
    return (string)$value;
}

function query_all(PDO $pdo, string $sql, array $params = []): array
{
    $statement = $pdo->prepare($sql);
    $statement->execute($params);
    return $statement->fetchAll();
}

function patient_to_client(array $patient): array
{
    return [
        'id' => (string)$patient['id'],
        'doctorId' => (string)$patient['doctor_id'],
        'lastName' => (string)$patient['last_name'],
        'firstName' => (string)$patient['first_name'],
        'middleName' => (string)($patient['middle_name'] ?? ''),
        'birthDate' => normalize_date($patient['birth_date'] ?? null),
        'phone' => (string)($patient['phone'] ?? ''),
        'address' => (string)($patient['address'] ?? ''),
    ];
}

function visit_to_client(array $visit): array
{
    $map = [
        'id' => 'id',
        'patientId' => 'patient_id',
        'doctorId' => 'doctor_id',
        'recordDate' => 'record_date',
        'ageAtVisit' => 'age_at_visit',
        'doctorName' => 'doctor_name',
        'consultationType' => 'consultation_type',
        'complaints' => 'complaints',
        'diseaseHistory' => 'disease_history',
        'heredity' => 'heredity',
        'pastDiseases' => 'past_diseases',
        'pastOperations' => 'past_operations',
        'allergies' => 'allergies',
        'generalExam' => 'general_exam',
        'localExam' => 'local_exam',
        'ultrasoundDoctor' => 'ultrasound_doctor',
        'ultrasoundConsultationType' => 'ultrasound_consultation_type',
        'ultrasoundDevice' => 'ultrasound_device',
        'deepVeinsRight' => 'deep_veins_right',
        'deepVeinsLeft' => 'deep_veins_left',
        'surfaceVeinsRightGsv' => 'surface_veins_right_gsv',
        'surfaceVeinsRightSsv' => 'surface_veins_right_ssv',
        'surfaceVeinsLeftGsv' => 'surface_veins_left_gsv',
        'surfaceVeinsLeftSsv' => 'surface_veins_left_ssv',
        'perforators' => 'perforators',
        'edema' => 'edema',
        'ultrasoundConclusion' => 'ultrasound_conclusion',
        'diagnosisMain' => 'diagnosis_main',
        'diagnosisCode' => 'diagnosis_code',
        'diagnosisComorbidities' => 'diagnosis_comorbidities',
        'regimen' => 'regimen',
        'medicationTherapy' => 'medication_therapy',
        'nonMedicationTherapy' => 'non_medication_therapy',
        'specialistConsultations' => 'specialist_consultations',
        'examinationPlan' => 'examination_plan',
        'recommendations' => 'recommendations',
        'manipulationName' => 'manipulation_name',
        'manipulationDone' => 'manipulation_done',
        'manipulationResult' => 'manipulation_result',
        'nextVisitDate' => 'next_visit_date',
        'doctorComment' => 'doctor_comment',
    ];
    $client = [];
    foreach ($map as $clientKey => $dbKey) {
        $client[$clientKey] = (string)($visit[$dbKey] ?? '');
    }
    $client['recordDate'] = normalize_date($visit['record_date'] ?? null);
    $client['nextVisitDate'] = normalize_date($visit['next_visit_date'] ?? null);
    return $client;
}

function upsert_patient(PDO $pdo, array $patient): void
{
    $pdo->prepare(
        'INSERT INTO patients (id, doctor_id, last_name, first_name, middle_name, birth_date, phone, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           doctor_id = VALUES(doctor_id),
           last_name = VALUES(last_name),
           first_name = VALUES(first_name),
           middle_name = VALUES(middle_name),
           birth_date = VALUES(birth_date),
           phone = VALUES(phone),
           address = VALUES(address)'
    )->execute([
        (string)$patient['id'],
        (string)$patient['doctorId'],
        trim((string)($patient['lastName'] ?? '')),
        trim((string)($patient['firstName'] ?? '')),
        null_if_empty($patient['middleName'] ?? ''),
        null_if_empty($patient['birthDate'] ?? ''),
        null_if_empty($patient['phone'] ?? ''),
        null_if_empty($patient['address'] ?? ''),
    ]);
}

function upsert_visit(PDO $pdo, array $visit): void
{
    $fields = [
        'id' => 'id',
        'patientId' => 'patient_id',
        'doctorId' => 'doctor_id',
        'recordDate' => 'record_date',
        'ageAtVisit' => 'age_at_visit',
        'doctorName' => 'doctor_name',
        'consultationType' => 'consultation_type',
        'complaints' => 'complaints',
        'diseaseHistory' => 'disease_history',
        'heredity' => 'heredity',
        'pastDiseases' => 'past_diseases',
        'pastOperations' => 'past_operations',
        'allergies' => 'allergies',
        'generalExam' => 'general_exam',
        'localExam' => 'local_exam',
        'ultrasoundDoctor' => 'ultrasound_doctor',
        'ultrasoundConsultationType' => 'ultrasound_consultation_type',
        'ultrasoundDevice' => 'ultrasound_device',
        'deepVeinsRight' => 'deep_veins_right',
        'deepVeinsLeft' => 'deep_veins_left',
        'surfaceVeinsRightGsv' => 'surface_veins_right_gsv',
        'surfaceVeinsRightSsv' => 'surface_veins_right_ssv',
        'surfaceVeinsLeftGsv' => 'surface_veins_left_gsv',
        'surfaceVeinsLeftSsv' => 'surface_veins_left_ssv',
        'perforators' => 'perforators',
        'edema' => 'edema',
        'ultrasoundConclusion' => 'ultrasound_conclusion',
        'diagnosisMain' => 'diagnosis_main',
        'diagnosisCode' => 'diagnosis_code',
        'diagnosisComorbidities' => 'diagnosis_comorbidities',
        'regimen' => 'regimen',
        'medicationTherapy' => 'medication_therapy',
        'nonMedicationTherapy' => 'non_medication_therapy',
        'specialistConsultations' => 'specialist_consultations',
        'examinationPlan' => 'examination_plan',
        'recommendations' => 'recommendations',
        'manipulationName' => 'manipulation_name',
        'manipulationDone' => 'manipulation_done',
        'manipulationResult' => 'manipulation_result',
        'nextVisitDate' => 'next_visit_date',
        'doctorComment' => 'doctor_comment',
    ];

    $columns = array_values($fields);
    $values = [];
    foreach ($fields as $clientKey => $dbKey) {
        $value = $visit[$clientKey] ?? '';
        if (in_array($dbKey, ['record_date', 'next_visit_date'], true)) {
            $value = null_if_empty($value);
        }
        if ($dbKey === 'age_at_visit') {
            $value = null_if_empty($value);
        }
        $values[] = $value;
    }

    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
    $updates = implode(', ', array_map(fn(string $column) => "$column = VALUES($column)", array_slice($columns, 1)));
    $pdo->prepare(
        sprintf(
            'INSERT INTO visits (%s) VALUES (%s) ON DUPLICATE KEY UPDATE %s',
            implode(', ', $columns),
            $placeholders,
            $updates
        )
    )->execute($values);
}
