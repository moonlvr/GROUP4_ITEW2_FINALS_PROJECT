<?php
session_start();
require_once 'Config.php';

/*
 * Demo accounts that must never be deleted.
 * Enforced both here (server) and in script.js (client).
 */
define('DEMO_USERNAMES', ['teacher1', 'teacher2', 'student1', 'student2', 'student3', 'student4']);

/* ================================================================
   User class — all DB operations
================================================================ */
class User
{
    private $conn;

    public function __construct()
    {
        $this->conn = getConnection();
    }

    /* ---- CREATE ---- */
    public function createUser($username, $password, $role, $display_name)
    {
        if ($this->usernameExists($username)) {
            return ['success' => false, 'message' => 'Username already taken.'];
        }
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt   = $this->conn->prepare(
            'INSERT INTO users (username, password, role, display_name) VALUES (?, ?, ?, ?)'
        );
        $stmt->bind_param('ssss', $username, $hashed, $role, $display_name);
        return $stmt->execute()
            ? ['success' => true,  'message' => 'User added successfully.']
            : ['success' => false, 'message' => 'Failed to add user.'];
    }

    /* ---- READ ALL ---- */
    public function getUsers()
    {
        $result = $this->conn->query(
            'SELECT id, username, role, display_name, created_at FROM users ORDER BY id ASC'
        );
        if (!$result) return [];
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        return $users;
    }

    /* ---- UPDATE ---- */
    public function updateUser($id, $username, $role, $display_name, $new_password = '')
    {
        /* Check if username is taken by a different user */
        $stmt = $this->conn->prepare(
            'SELECT id FROM users WHERE username = ? AND id != ?'
        );
        $stmt->bind_param('si', $username, $id);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            return ['success' => false, 'message' => 'Username already taken by another user.'];
        }

        if (!empty($new_password)) {
            /* Update password too */
            $hashed = password_hash($new_password, PASSWORD_DEFAULT);
            $stmt   = $this->conn->prepare(
                'UPDATE users SET username = ?, password = ?, role = ?, display_name = ? WHERE id = ?'
            );
            $stmt->bind_param('ssssi', $username, $hashed, $role, $display_name, $id);
        } else {
            /* Keep existing password */
            $stmt = $this->conn->prepare(
                'UPDATE users SET username = ?, role = ?, display_name = ? WHERE id = ?'
            );
            $stmt->bind_param('sssi', $username, $role, $display_name, $id);
        }

        return $stmt->execute()
            ? ['success' => true,  'message' => 'User updated successfully.']
            : ['success' => false, 'message' => 'Failed to update user.'];
    }

    /* ---- DELETE ---- */
    public function deleteUser($id, $current_user_id)
    {
        /* Prevent self-deletion */
        if ((int)$id === (int)$current_user_id) {
            return ['success' => false, 'message' => 'You cannot delete your own account.'];
        }

        /* Look up username to guard demo accounts */
        $stmt = $this->conn->prepare('SELECT username FROM users WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();

        if (!$row) {
            return ['success' => false, 'message' => 'User not found.'];
        }
        if (in_array($row['username'], DEMO_USERNAMES)) {
            return ['success' => false, 'message' => 'Demo accounts cannot be deleted.'];
        }

        $stmt = $this->conn->prepare('DELETE FROM users WHERE id = ?');
        $stmt->bind_param('i', $id);
        return $stmt->execute()
            ? ['success' => true,  'message' => 'User deleted successfully.']
            : ['success' => false, 'message' => 'Failed to delete user.'];
    }

    /* ---- LOGIN ---- */
    public function login($username, $password)
    {
        $stmt = $this->conn->prepare(
            'SELECT id, username, password, role, display_name FROM users WHERE username = ?'
        );
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if ($user && password_verify($password, $user['password'])) {
            return ['success' => true, 'user' => $user];
        }
        return ['success' => false, 'message' => 'Invalid username or password.'];
    }

    /* ---- HELPERS ---- */
    private function usernameExists($username)
    {
        $stmt = $this->conn->prepare('SELECT id FROM users WHERE username = ?');
        $stmt->bind_param('s', $username);
        $stmt->execute();
        return $stmt->get_result()->num_rows > 0;
    }
}

/* ================================================================
   Request handler — only handles POST requests with an `action`
================================================================ */
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['action'])) {
    /* Not an API call — silently exit */
    exit;
}

header('Content-Type: application/json');

$userObj = new User();
$action  = trim($_POST['action']);

/* ----------------------------------------------------------------
   login  (no session required)
---------------------------------------------------------------- */
if ($action === 'login') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!$username || !$password) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all fields.']);
        exit;
    }

    $result = $userObj->login($username, $password);

    if ($result['success']) {
        $_SESSION['user_id']      = $result['user']['id'];
        $_SESSION['username']     = $result['user']['username'];
        $_SESSION['role']         = $result['user']['role'];
        $_SESSION['display_name'] = $result['user']['display_name'];

        echo json_encode([
            'success'      => true,
            'role'         => $result['user']['role'],
            'display_name' => $result['user']['display_name'],
        ]);
    } else {
        echo json_encode($result);
    }
    exit;
}

/* ----------------------------------------------------------------
   logout  (no session required)
---------------------------------------------------------------- */
if ($action === 'logout') {
    session_unset();
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}

/* ----------------------------------------------------------------
   All other actions require an active session
---------------------------------------------------------------- */
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in.']);
    exit;
}

/* ----------------------------------------------------------------
   get_all
---------------------------------------------------------------- */
if ($action === 'get_all') {
    echo json_encode(['success' => true, 'data' => $userObj->getUsers()]);
    exit;
}

/* ----------------------------------------------------------------
   save  (create or update)
   Reads 'display' from POST and stores it as display_name.
---------------------------------------------------------------- */
if ($action === 'save') {
    $id          = (int)($_POST['id']       ?? 0);
    $username    = trim($_POST['username']  ?? '');
    $password    = trim($_POST['password']  ?? '');
    $role        = trim($_POST['role']      ?? 'student');
    $displayName= trim($_POST['display']   ?? '');

    if (!$username || !$displayName) {
        echo json_encode(['success' => false, 'message' => 'Username and display name are required.']);
        exit;
    }
    if (!in_array($role, ['teacher', 'student'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid role.']);
        exit;
    }

    if ($id > 0) {
        /* UPDATE — password is optional (blank = keep existing) */
        $result = $userObj->updateUser($id, $username, $role, $displayName, $password);
    } else {
        /* CREATE — password is required */
        if (!$password) {
            echo json_encode(['success' => false, 'message' => 'Password is required for new users.']);
            exit;
        }
        $result = $userObj->createUser($username, $password, $role, $displayName);
    }

    /* If the logged-in user edited their own record, refresh session data */
    if ($result['success'] && $id === (int)$_SESSION['user_id']) {
        $_SESSION['username']     = $username;
        $_SESSION['display_name'] = $displayName;
    }

    echo json_encode($result);
    exit;
}

/* ----------------------------------------------------------------
   delete
---------------------------------------------------------------- */
if ($action === 'delete') {
    $id     = (int)($_POST['id'] ?? 0);
    $result = $userObj->deleteUser($id, (int)$_SESSION['user_id']);
    echo json_encode($result);
    exit;
}

/* ----------------------------------------------------------------
   Unknown action
---------------------------------------------------------------- */
echo json_encode(['success' => false, 'message' => 'Unknown action.']);
exit;
?>
