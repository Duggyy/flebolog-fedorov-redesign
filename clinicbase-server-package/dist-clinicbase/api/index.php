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
        'dictionaries' => handle_dictionaries($pdo),
        'dictionary_save' => handle_dictionary_save($pdo),
        'dictionary_delete' => handle_dictionary_delete($pdo),
        'dictionaries_import' => handle_dictionaries_import($pdo),
        'dictionaries_replace' => handle_dictionaries_replace($pdo),
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

/**
 * Запись справочника в том виде, в каком её ждёт клиент.
 *
 * Наружу отдаём scope, а не doctor_id: врачу незачем знать идентификаторы
 * чужих личных справочников, а интерфейсу нужно ровно одно поле, чтобы
 * разложить записи по вкладкам «Общие» и «Мои».
 */
function dictionary_to_client(array $row): array
{
    return [
        'id' => (string)$row['id'],
        'section' => (string)$row['section'],
        'short' => (string)$row['short_text'],
        'full' => (string)($row['full_text'] ?? ''),
        'color' => (string)($row['color'] ?? ''),
        'parentId' => (string)($row['parent_id'] ?? ''),
        'order' => (int)$row['sort_order'],
        'scope' => $row['doctor_id'] === null ? 'global' : 'personal',
    ];
}

/**
 * Проверка и нормализация записи справочника. null — запись негодная.
 *
 * Идентификатор приходит с клиента: записи создаются и в офлайн-режиме,
 * поэтому генерировать его на сервере значило бы терять связь с тем, что
 * уже лежит в браузере врача. Заодно это делает сохранение идемпотентным —
 * повторная отправка той же записи не создаёт вторую.
 */
function normalize_dictionary_entry(mixed $entry): ?array
{
    if (!is_array($entry)) {
        return null;
    }

    $id = trim((string)($entry['id'] ?? ''));
    $section = trim((string)($entry['section'] ?? ''));
    $short = trim((string)($entry['short'] ?? ''));
    if ($id === '' || $section === '' || $short === '') {
        return null;
    }

    // Цвет принимаем только как #rrggbb. Любое другое значение уехало бы
    // в style и стало либо невидимым текстом, либо дырой в вёрстке.
    $color = trim((string)($entry['color'] ?? ''));
    if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
        $color = '';
    }

    return [
        'id' => mb_substr($id, 0, 64),
        'section' => mb_substr($section, 0, 180),
        // 2000, а не 500: в шаблоне истории болезни есть готовые назначения
        // длиной под 650 знаков, и прежний предел молча срезал бы хвост
        // рецепта — самая дорогая из возможных потерь.
        'short' => mb_substr($short, 0, 2000),
        'full' => (string)($entry['full'] ?? ''),
        'color' => $color,
        'parentId' => mb_substr(trim((string)($entry['parentId'] ?? '')), 0, 64),
        'order' => (int)($entry['order'] ?? 0),
        'scope' => ($entry['scope'] ?? 'personal') === 'global' ? 'global' : 'personal',
    ];
}

/**
 * Записать одну запись справочника.
 *
 * Область уже существующей записи не меняется: иначе врач мог бы «повысить»
 * свою личную запись до общей одним запросом, и она всплыла бы у всех коллег.
 */
function save_dictionary_entry(PDO $pdo, array $entry): void
{
    $isAdmin = ($_SESSION['role'] ?? '') === 'admin';
    $doctorId = $isAdmin ? null : (string)($_SESSION['doctor_id'] ?? '');

    $existing = query_all($pdo, 'SELECT doctor_id FROM dictionary_entries WHERE id = ?', [$entry['id']]);
    $ownerId = $entry['scope'] === 'global' || $isAdmin ? null : $doctorId;

    if ($existing) {
        $owner = $existing[0]['doctor_id'];
        if (!$isAdmin && $owner !== null && (string)$owner !== $doctorId) {
            respond(403, ['error' => 'forbidden']);
        }
        $ownerId = $owner === null ? null : $doctorId;
    }

    $pdo->prepare(
        'INSERT INTO dictionary_entries
            (id, doctor_id, section, short_text, full_text, color, parent_id, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            doctor_id = VALUES(doctor_id),
            section = VALUES(section),
            short_text = VALUES(short_text),
            full_text = VALUES(full_text),
            color = VALUES(color),
            parent_id = VALUES(parent_id),
            sort_order = VALUES(sort_order)'
    )->execute([
        $entry['id'],
        $ownerId,
        $entry['section'],
        $entry['short'],
        null_if_empty($entry['full']),
        null_if_empty($entry['color']),
        null_if_empty($entry['parentId']),
        $entry['order'],
    ]);
}

function handle_dictionaries(PDO $pdo): never
{
    require_logged_in();
    $doctorId = ($_SESSION['role'] ?? '') === 'doctor' ? (string)$_SESSION['doctor_id'] : null;

    $params = [];
    $sql = 'SELECT id, doctor_id, section, short_text, full_text, color, parent_id, sort_order
            FROM dictionary_entries
            WHERE doctor_id IS NULL';
    if ($doctorId !== null) {
        $sql .= ' OR doctor_id = ?';
        $params[] = $doctorId;
    }
    $sql .= ' ORDER BY section, sort_order, short_text';

    // Раньше здесь склеивались области: результат был словарём label => массив,
    // и личная запись молча затирала общую с тем же именем поля. Теперь каждая
    // строка несёт свой scope, и терять нечего.
    respond(200, [
        'entries' => array_map('dictionary_to_client', query_all($pdo, $sql, $params)),
    ]);
}

function handle_dictionary_save(PDO $pdo): never
{
    require_logged_in();
    $entry = normalize_dictionary_entry(read_json()['entry'] ?? null);
    if ($entry === null) {
        respond(422, ['error' => 'invalid_entry']);
    }

    save_dictionary_entry($pdo, $entry);
    respond(200, ['ok' => true]);
}

function handle_dictionary_delete(PDO $pdo): never
{
    require_logged_in();
    $id = trim((string)(read_json()['id'] ?? ''));
    if ($id === '') {
        respond(422, ['error' => 'invalid_id']);
    }

    $existing = query_all($pdo, 'SELECT doctor_id FROM dictionary_entries WHERE id = ?', [$id]);
    if (!$existing) {
        // Уже удалена — это не ошибка: повторное нажатие не должно ругаться.
        respond(200, ['ok' => true]);
    }

    $owner = $existing[0]['doctor_id'];
    if (($_SESSION['role'] ?? '') !== 'admin'
        && $owner !== null
        && (string)$owner !== (string)($_SESSION['doctor_id'] ?? '')) {
        respond(403, ['error' => 'forbidden']);
    }

    $pdo->prepare('DELETE FROM dictionary_entries WHERE id = ?')->execute([$id]);
    respond(200, ['ok' => true]);
}

/**
 * Групповая вставка — «Вставить из буфера».
 *
 * Идентификаторы здесь генерирует сервер: вставляют обычно текст, а не готовые
 * записи, и совпасть с чьим-то чужим id случайно было бы обидно. Клиент после
 * импорта забирает список заново, поэтому расхождение id ему не мешает.
 */
function handle_dictionaries_import(PDO $pdo): never
{
    require_logged_in();
    $rawEntries = read_json()['entries'] ?? [];
    if (!is_array($rawEntries)) {
        respond(422, ['error' => 'invalid_entries']);
    }

    $isAdmin = ($_SESSION['role'] ?? '') === 'admin';
    $doctorId = $isAdmin ? null : (string)($_SESSION['doctor_id'] ?? '');
    $scope = ($_SESSION['role'] ?? '') === 'admin' ? 'global' : 'personal';

    $pdo->beginTransaction();
    $saved = 0;
    foreach ($rawEntries as $raw) {
        if (!is_array($raw)) {
            continue;
        }
        // array_merge, а не «+»: если клиент прислал пустой id, «+» его
        // сохранил бы (ключ уже есть), и проверка отбросила бы запись.
        $entry = normalize_dictionary_entry(array_merge($raw, ['id' => 'import', 'scope' => $scope]));
        if ($entry === null) {
            continue;
        }
        $entry['id'] = bin2hex(random_bytes(16));
        $entry['scope'] = $scope;

        $pdo->prepare(
            'INSERT INTO dictionary_entries
                (id, doctor_id, section, short_text, full_text, color, parent_id, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )->execute([
            $entry['id'],
            $doctorId,
            $entry['section'],
            $entry['short'],
            null_if_empty($entry['full']),
            null_if_empty($entry['color']),
            null_if_empty($entry['parentId']),
            $entry['order'],
        ]);
        $saved++;
    }
    $pdo->commit();

    handle_dictionaries($pdo);
}

/**
 * Полная замена набора в одной транзакции — загрузка шаблона истории болезни
 * и её отмена.
 *
 * Не то же самое, что `dictionaries_import`: там дописывают строки из буфера
 * и id генерирует сервер. Здесь клиент присылает готовый набор с устойчивыми
 * id, а прежние общие записи должны исчезнуть целиком. Без транзакции на
 * полпути получилась бы смесь двух шаблонов — худшее из возможных состояний.
 *
 * Отмена загрузки — тот же запрос с прежним набором, поэтому отдельного
 * «undo» на сервере не нужно.
 */
function handle_dictionaries_replace(PDO $pdo): never
{
    require_logged_in();
    $payload = read_json();
    $scope = ($payload['scope'] ?? 'global') === 'personal' ? 'personal' : 'global';
    if ($scope !== 'global') {
        // Личные записи принадлежат конкретному врачу, и «заменить все личные
        // одним запросом» означало бы стереть чужие. Массовая замена — только
        // для общих.
        respond(422, ['error' => 'only_global_replaceable']);
    }

    $rawEntries = $payload['entries'] ?? [];
    if (!is_array($rawEntries)) {
        respond(422, ['error' => 'invalid_entries']);
    }

    $pdo->beginTransaction();
    try {
        $pdo->exec('DELETE FROM dictionary_entries WHERE doctor_id IS NULL');

        // ON DUPLICATE KEY UPDATE, а не голый INSERT: если в присланном наборе
        // случайно окажутся два одинаковых id, транзакция целиком упала бы на
        // дубликате ключа, и сервер остался бы без шаблона, а браузер — с ним.
        $statement = $pdo->prepare(
            'INSERT INTO dictionary_entries
                (id, doctor_id, section, short_text, full_text, color, parent_id, sort_order)
             VALUES (?, NULL, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                section = VALUES(section),
                short_text = VALUES(short_text),
                full_text = VALUES(full_text),
                color = VALUES(color),
                parent_id = VALUES(parent_id),
                sort_order = VALUES(sort_order)'
        );
        $saved = 0;
        foreach ($rawEntries as $raw) {
            if (!is_array($raw)) {
                continue;
            }
            $entry = normalize_dictionary_entry(array_merge($raw, ['scope' => 'global']));
            if ($entry === null) {
                continue;
            }
            // id приходит от клиента: он же лежит в localStorage, и при отмене
            // восстановятся ровно те же строки, а не новые с другими id.
            $statement->execute([
                $entry['id'],
                $entry['section'],
                $entry['short'],
                null_if_empty($entry['full']),
                null_if_empty($entry['color']),
                null_if_empty($entry['parentId']),
                $entry['order'],
            ]);
            $saved++;
        }
        $pdo->commit();
    } catch (Throwable $error) {
        // Откат обязателен: иначе после неудачной загрузки на сервере
        // остались бы удалённые общие записи и ни одной новой.
        $pdo->rollBack();
        respond(500, ['error' => 'replace_failed', 'message' => $error->getMessage()]);
    }

    respond(200, ['ok' => true, 'saved' => $saved]);
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
        'recordTime' => 'record_time',
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
        'recordTime' => 'record_time',
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
        if (in_array($dbKey, ['record_date', 'record_time', 'next_visit_date'], true)) {
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
