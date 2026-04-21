<?php
session_start();
require_once 'Config.php';

/* ================================================================
   Attendance class — all DB operations
================================================================ */
class AttendanceRecord
{
    private $conn;

    public function __construct()
    {
        $this->conn = getConnection();
    }

    /* ---- CREATE ---- */
    public function addAttendance($student, $date, $status, $section)
    {
        /* Check for duplicate: same student + same date */
        $check = $this->conn->prepare(
            'SELECT id FROM attendance WHERE student = ? AND date = ?'
        );
        $check->bind_param('ss', $student, $date);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            return ['success' => false, 'message' => 'Attendance already logged for this student on this date.'];
        }

        $stmt = $this->conn->prepare(
            'INSERT INTO attendance (student, date, status, section) VALUES (?, ?, ?, ?)'
        );
        $stmt->bind_param('ssss', $student, $date, $status, $section);
        return $stmt->execute()
            ? ['success' => true,  'message' => 'Attendance added successfully.', 'id' => $this->conn->insert_id]
            : ['success' => false, 'message' => 'Failed to add attendance.'];
    }

    /* ---- READ ALL (with sort, filter, search) ---- */
    public function getAll($search = '', $section = '', $status = '', $orderBy = 'date', $orderDir = 'DESC')
    {
        /* Whitelist orderBy to prevent SQL injection */
        $allowedOrder = ['student', 'date', 'status', 'section'];
        if (!in_array($orderBy, $allowedOrder)) $orderBy = 'date';
        $orderDir = $orderDir === 'ASC' ? 'ASC' : 'DESC';

        /* Build WHERE clause dynamically */
        $where  = [];
        $params = [];
        $types  = '';

        if (!empty($search)) {
            $where[]  = 'student LIKE ?';
            $params[] = '%' . $search . '%';
            $types   .= 's';
        }

        if (!empty($section)) {
            $where[]  = 'section = ?';
            $params[] = $section;
            $types   .= 's';
        }

        if (!empty($status)) {
            $where[]  = 'status = ?';
            $params[] = $status;
            $types   .= 's';
        }

        $sql = "SELECT id, student, date, status, section FROM attendance";
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= " ORDER BY $orderBy $orderDir";

        if (empty($params)) {
            $result = $this->conn->query($sql);
        } else {
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        }

        if (!$result) return [];
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }

    /* ---- READ BY STUDENT ---- */
    public function getByStudent($studentName)
    {
        $stmt = $this->conn->prepare(
            'SELECT id, student, date, status, section FROM attendance WHERE student = ? ORDER BY date DESC'
        );
        $stmt->bind_param('s', $studentName);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows   = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }

    /* ---- UPDATE ---- */
    public function updateAttendance($id, $student, $date, $status, $section)
    {
        /* Check duplicate for another record */
        $check = $this->conn->prepare(
            'SELECT id FROM attendance WHERE student = ? AND date = ? AND id != ?'
        );
        $check->bind_param('ssi', $student, $date, $id);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            return ['success' => false, 'message' => 'Attendance already logged for this student on this date.'];
        }

        $stmt = $this->conn->prepare(
            'UPDATE attendance SET student = ?, date = ?, status = ?, section = ? WHERE id = ?'
        );
        $stmt->bind_param('ssssi', $student, $date, $status, $section, $id);
        return $stmt->execute()
            ? ['success' => true,  'message' => 'Attendance updated successfully.']
            : ['success' => false, 'message' => 'Failed to update attendance.'];
    }

    /* ---- DELETE ---- */
    public function deleteAttendance($id)
    {
        $stmt = $this->conn->prepare('DELETE FROM attendance WHERE id = ?');
        $stmt->bind_param('i', $id);
        return $stmt->execute()
            ? ['success' => true,  'message' => 'Attendance deleted successfully.']
            : ['success' => false, 'message' => 'Failed to delete attendance.'];
    }

    /* ---- DELETE ALL (used by clear data feature) ---- */
    public function clearAll()
    {
        $result = $this->conn->query('DELETE FROM attendance');
        return $result
            ? ['success' => true,  'message' => 'All attendance records cleared.']
            : ['success' => false, 'message' => 'Failed to clear attendance.'];
    }
}

/* ================================================================
   Request handler — only handles POST requests with an `action`
================================================================ */
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['action'])) {
    exit;
}

header('Content-Type: application/json');

/* All actions require login */
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

$attObj = new AttendanceRecord();
$action = trim($_POST['action']);

/* ----------------------------------------------------------------
   get_all  — teacher gets all, student gets own records only
---------------------------------------------------------------- */
if ($action === 'get_all') {
    if ($_SESSION['role'] === 'student') {

        $fullName = $_SESSION['display_name'] ?? '';

        if (empty($fullName)) {
            echo json_encode(['success' => false, 'message' => 'Student name not found in session.']);
            exit;
        }

        $data = $attObj->getByStudent($fullName);
    } else {
        /* Get sort, filter, search params from POST */
        $search   = trim($_POST['search']   ?? '');
        $section  = trim($_POST['section']  ?? '');
        $status   = trim($_POST['status']   ?? '');
        $orderBy  = trim($_POST['orderBy']  ?? 'date');
        $orderDir = trim($_POST['orderDir'] ?? 'DESC');

        $data = $attObj->getAll($search, $section, $status, $orderBy, $orderDir);
    }
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

/* ----------------------------------------------------------------
   Teachers only beyond this point
---------------------------------------------------------------- */
if ($_SESSION['role'] !== 'teacher') {
    echo json_encode(['success' => false, 'message' => 'Access denied.']);
    exit;
}

/* ----------------------------------------------------------------
   save  
---------------------------------------------------------------- */
if ($action === 'save') {
    $id      = (int)($_POST['id']      ?? 0);
    $student = trim($_POST['student']  ?? '');
    $date    = trim($_POST['date']     ?? '');
    $status  = trim($_POST['status']   ?? 'Present');
    $section = trim($_POST['section']  ?? '');

    if (!$student || !$date) {
        echo json_encode(['success' => false, 'message' => 'Student and date are required.']);
        exit;
    }

    /* Added section validation */
    if (!$section) {
        echo json_encode(['success' => false, 'message' => 'Section is required.']);
        exit;
    }

    if (!in_array($status, ['Present', 'Absent', 'Late'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid status.']);
        exit;
    }

    if ($id > 0) {
        $result = $attObj->updateAttendance($id, $student, $date, $status, $section);
    } else {
        $result = $attObj->addAttendance($student, $date, $status, $section);
    }

    echo json_encode($result);
    exit;
}

/* ----------------------------------------------------------------
   delete
---------------------------------------------------------------- */
if ($action === 'delete') {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'Invalid ID.']);
        exit;
    }
    echo json_encode($attObj->deleteAttendance($id));
    exit;
}

/* ----------------------------------------------------------------
   clear_all
---------------------------------------------------------------- */
if ($action === 'clear_all') {
    echo json_encode($attObj->clearAll());
    exit;
}

/* ----------------------------------------------------------------
   Unknown action
---------------------------------------------------------------- */
echo json_encode(['success' => false, 'message' => 'Unknown action.']);
exit;
?>