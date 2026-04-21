<?php
session_start();
require_once 'Config.php';

/* ================================================================
   GradeRecord class — all DB operations
================================================================ */
class GradeRecord
{
    private $conn;

    public function __construct()
    {
        $this->conn = getConnection();
    }

    /* ---- Remarks helper (mirrors Grade.getRemarks() in script.js) ---- */
    public static function getRemarks($grade)
    {
        if ($grade >= 90) return 'Outstanding';
        if ($grade >= 85) return 'Very Good';
        if ($grade >= 80) return 'Good';
        if ($grade >= 75) return 'Passed';
        return 'Failed';
    }

    /* ---- CREATE ---- */
    public function addGrade($student, $subject, $quarter, $grade)
    {
        /* Check for duplicate: same student + same subject + same quarter */
        $check = $this->conn->prepare(
            'SELECT id FROM grades WHERE student = ? AND subject = ? AND quarter = ?'
        );
        $check->bind_param('sss', $student, $subject, $quarter);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            return ['success' => false, 'message' => 'Grade already recorded for this student, subject, and quarter.'];
        }

        $stmt = $this->conn->prepare(
            'INSERT INTO grades (student, subject, quarter, grade) VALUES (?, ?, ?, ?)'
        );
        $stmt->bind_param('sssd', $student, $subject, $quarter, $grade);
        return $stmt->execute()
            ? ['success' => true,  'message' => 'Grade added successfully.', 'id' => $this->conn->insert_id]
            : ['success' => false, 'message' => 'Failed to add grade.'];
    }

    /* ---- READ ALL (with sort, filter, search) ---- */
    public function getAll(
        $search   = '',
        $section  = '',
        $subject  = '',
        $quarter  = '',
        $orderBy  = 'student',
        $orderDir = 'ASC'
    ) {
        /* Whitelist orderBy to prevent SQL injection */
        $allowedOrder = ['student', 'subject', 'quarter', 'grade'];
        if (!in_array($orderBy, $allowedOrder)) $orderBy = 'student';
        $orderDir = $orderDir === 'DESC' ? 'DESC' : 'ASC';

        /* Build WHERE clause dynamically */
        $where  = [];
        $params = [];
        $types  = '';

        if (!empty($search)) {
            $where[]  = 'g.student LIKE ?';
            $params[] = '%' . $search . '%';
            $types   .= 's';
        }

        if (!empty($subject)) {
            $where[]  = 'g.subject = ?';
            $params[] = $subject;
            $types   .= 's';
        }

        if (!empty($quarter)) {
            $where[]  = 'g.quarter = ?';
            $params[] = $quarter;
            $types   .= 's';
        }

        /*
         * Section filter: grades table has no section column, so we join
         * the students table on full name (fname + ' ' + lname).
         */
        if (!empty($section)) {
            $where[]  = 'st.section = ?';
            $params[] = $section;
            $types   .= 's';
        }

        $sql = "SELECT g.id, g.student, g.subject, g.quarter, g.grade,
                       st.section
                FROM grades g
                LEFT JOIN students st
                       ON CONCAT(st.fname, ' ', st.lname) = g.student";

        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        /* Prefix orderBy with table alias to avoid ambiguity */
        $sql .= " ORDER BY g.$orderBy $orderDir";

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
            $row['remarks'] = self::getRemarks((float)$row['grade']);
            $rows[] = $row;
        }
        return $rows;
    }

    /* ---- READ BY STUDENT ---- */
    public function getByStudent($studentName)
    {
        $stmt = $this->conn->prepare(
            'SELECT id, student, subject, quarter, grade
               FROM grades
              WHERE student = ?
              ORDER BY quarter ASC, subject ASC'
        );
        $stmt->bind_param('s', $studentName);
        $stmt->execute();
        $result = $stmt->get_result();

        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $row['remarks'] = self::getRemarks((float)$row['grade']);
            $rows[] = $row;
        }
        return $rows;
    }

    /* ---- UPDATE ---- */
    public function updateGrade($id, $student, $subject, $quarter, $grade)
    {
        /* Check duplicate for a different record */
        $check = $this->conn->prepare(
            'SELECT id FROM grades WHERE student = ? AND subject = ? AND quarter = ? AND id != ?'
        );
        $check->bind_param('sssi', $student, $subject, $quarter, $id);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            return ['success' => false, 'message' => 'Grade already recorded for this student, subject, and quarter.'];
        }

        $stmt = $this->conn->prepare(
            'UPDATE grades SET student = ?, subject = ?, quarter = ?, grade = ? WHERE id = ?'
        );
        $stmt->bind_param('sssdi', $student, $subject, $quarter, $grade, $id);
        return $stmt->execute()
            ? ['success' => true,  'message' => 'Grade updated successfully.']
            : ['success' => false, 'message' => 'Failed to update grade.'];
    }

    /* ---- DELETE ---- */
    public function deleteGrade($id)
    {
        $stmt = $this->conn->prepare('DELETE FROM grades WHERE id = ?');
        $stmt->bind_param('i', $id);
        return $stmt->execute()
            ? ['success' => true,  'message' => 'Grade deleted successfully.']
            : ['success' => false, 'message' => 'Failed to delete grade.'];
    }

    /* ---- DELETE ALL (used by clear data feature) ---- */
    public function clearAll()
    {
        $result = $this->conn->query('DELETE FROM grades');
        return $result
            ? ['success' => true,  'message' => 'All grade records cleared.']
            : ['success' => false, 'message' => 'Failed to clear grades.'];
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

$gradeObj = new GradeRecord();
$action   = trim($_POST['action']);

/* ----------------------------------------------------------------
   get_all — teacher gets all, student gets own records only
---------------------------------------------------------------- */
if ($action === 'get_all') {
    if ($_SESSION['role'] === 'student') {

        $fullName = $_SESSION['display_name'] ?? '';

        if (empty($fullName)) {
            echo json_encode(['success' => false, 'message' => 'Student name not found in session.']);
            exit;
        }

        $data = $gradeObj->getByStudent($fullName);
    } else {
        /* Get sort, filter, search params from POST */
        $search   = trim($_POST['search']   ?? '');
        $section  = trim($_POST['section']  ?? '');
        $subject  = trim($_POST['subject']  ?? '');
        $quarter  = trim($_POST['quarter']  ?? '');
        $orderBy  = trim($_POST['orderBy']  ?? 'student');
        $orderDir = trim($_POST['orderDir'] ?? 'ASC');

        $data = $gradeObj->getAll($search, $section, $subject, $quarter, $orderBy, $orderDir);
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
    $subject = trim($_POST['subject']  ?? '');
    $quarter = trim($_POST['quarter']  ?? 'Q1');
    $grade   = $_POST['grade']         ?? '';

    if (!$student || !$subject) {
        echo json_encode(['success' => false, 'message' => 'Student and subject are required.']);
        exit;
    }

    if (!in_array($quarter, ['Q1', 'Q2', 'Q3', 'Q4'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid quarter. Must be Q1, Q2, Q3, or Q4.']);
        exit;
    }

    if (!is_numeric($grade) || (float)$grade < 0 || (float)$grade > 100) {
        echo json_encode(['success' => false, 'message' => 'Grade must be a number between 0 and 100.']);
        exit;
    }

    $grade = (float)$grade;

    if ($id > 0) {
        $result = $gradeObj->updateGrade($id, $student, $subject, $quarter, $grade);
    } else {
        $result = $gradeObj->addGrade($student, $subject, $quarter, $grade);
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
    echo json_encode($gradeObj->deleteGrade($id));
    exit;
}

/* ----------------------------------------------------------------
   clear_all
---------------------------------------------------------------- */
if ($action === 'clear_all') {
    echo json_encode($gradeObj->clearAll());
    exit;
}

/* ----------------------------------------------------------------
   Unknown action
---------------------------------------------------------------- */
echo json_encode(['success' => false, 'message' => 'Unknown action.']);
exit;
?>