75% of storage used … If you run out, you can't create, edit, and upload files. Get 30 GB for ₱25 for 3 months ₱49.
<?php
session_start();
require_once 'Config.php';

/* ================================================================
   Clear class — clears all data from DB
================================================================ */
class Clear
{
    private $conn;

    public function __construct()
    {
        $this->conn = getConnection();
    }

    /* ---- CLEAR ALL ---- */
    public function clearAll()
    {
        /* Disable foreign key checks temporarily */
        $this->conn->query('SET FOREIGN_KEY_CHECKS = 0');

        $tables  = ['attendance', 'grades', 'students', 'sections'];
        $failed  = [];

        foreach ($tables as $table) {
            if (!$this->conn->query("DELETE FROM `$table`")) {
                $failed[] = $table;
            }
        }

        $this->conn->query('SET FOREIGN_KEY_CHECKS = 1');

        if (!empty($failed)) {
            return [
                'success' => false,
                'message' => 'Failed to clear: ' . implode(', ', $failed)
            ];
        }

        return ['success' => true, 'message' => 'All data has been cleared.'];
    }
}

/* ================================================================
   Request handler
================================================================ */
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['action'])) {
    exit;
}

header('Content-Type: application/json');

/* Requires login */
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

/* Teachers only */
if ($_SESSION['role'] !== 'teacher') {
    echo json_encode(['success' => false, 'message' => 'Access denied.']);
    exit;
}

$clearObj = new Clear();
$action   = trim($_POST['action']);

/* ----------------------------------------------------------------
   clear_all
---------------------------------------------------------------- */
if ($action === 'clear_all') {
    echo json_encode($clearObj->clearAll());
    exit;
}

/* ----------------------------------------------------------------
   Unknown action
---------------------------------------------------------------- */
echo json_encode(['success' => false, 'message' => 'Unknown action.']);
exit;
?>