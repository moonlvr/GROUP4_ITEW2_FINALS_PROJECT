<!-- <!-- <?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>School Portal — Student Management System</title>
  <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <link rel="stylesheet" href="styles.css"/>us
</head>
<body>

<!-- ================================================================
     LOGIN SCREEN
================================================================ -->
<div id="login-screen" class="active">
  <div class="login-panel-left">
    <div class="lpl-content">
      <div class="brand-title">School <span>Portal</span></div>
      <div class="brand-sub">Student Record Management</div>
      <div class="brand-comment">UNIVERSITY OF CABUYAO LAGUNA</div>
    </div>
    <div class="lpl-tagline">
      <p>System for managing student records, grades, attendance, and sections.</p>
    </div>
  </div>

  <div class="login-panel-right">
    <div class="login-inner">
      <div class="login-heading">Sign in</div>
      <div class="login-sub">Access your account to continue</div>

      <div class="role-tabs">
        <button class="rtab active" data-tab="teacher">Teacher</button>
        <button class="rtab" data-tab="student">Student</button>
      </div>

      <div class="login-err" id="login-err"></div>

      <!-- Teacher Login Form -->
      <form class="lform active" id="form-teacher" onsubmit="return false">
        <div class="lfield">
          <label>Username</label>
          <input type="text" id="t-user" placeholder="e.g. teacher1" autocomplete="off"/>
        </div>
        <div class="lfield">
          <label>Password</label>
          <input type="password" id="t-pw" placeholder="Enter password"/>
        </div>
        <button type="submit" class="login-btn" id="btn-tlogin">Sign In</button>
        <div class="demo-creds">
          <div class="dc-title">Demo Accounts</div>
          <table>
            <tr><td>teacher1</td><td>pass123</td></tr>
            <tr><td>teacher2</td><td>pass123</td></tr>
          </table>
        </div>
      </form>

      <!-- Student Login Form -->
      <form class="lform" id="form-student" onsubmit="return false">
        <div class="lfield">
          <label>Username</label>
          <input type="text" id="s-user" placeholder="e.g. student1" autocomplete="off"/>
        </div>
        <div class="lfield">
          <label>Password</label>
          <input type="password" id="s-pw" placeholder="Enter password"/>
        </div>
        <button type="submit" class="login-btn" id="btn-slogin">Sign In</button>
        <div class="demo-creds">
          <div class="dc-title">Demo Accounts</div>
          <table><tr><td>student1 - student4</td><td>pass123</td></tr></table>
        </div>
      </form>

    </div>
  </div>
</div>


<!-- ================================================================
     APP SCREEN
================================================================ -->
<div id="app-screen">

  <!-- Sidebar -->
  <aside id="sidebar">
    <div class="sb-brand">
      <h1>School <span>Portal</span></h1>
      <small>Record Management</small>
      <p class="sb-comment">Manage students, grades &amp; attendance</p>
    </div>

    <nav>
      <div class="sb-section">Records</div>
      <a class="nav-link teacher-only" data-page="students">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        Students
      </a>
      <a class="nav-link" data-page="grades">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
        Grades
      </a>
      <a class="nav-link" data-page="attendance">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        Attendance
      </a>
      <a class="nav-link teacher-only" data-page="sections">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
        Sections
      </a>

      <div class="sb-section teacher-only">System</div>
      <a class="nav-link teacher-only" data-page="reports">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        Reports
      </a>
      <a class="nav-link teacher-only" data-page="settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
        Clear Data
      </a>

      <a class="nav-link teacher-only" data-page="users">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 00-8 0v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Users
      </a>
    </nav>

    <div class="sb-user">
      <div class="sb-av" id="sb-av">?</div>
      <div>
        <div class="sb-name" id="sb-name">-</div>
        <div class="sb-role" id="sb-role">-</div>
      </div>
    </div>

    <div class="sb-footer">
      <button id="btn-sidebar-logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign Out
      </button>
    </div>
  </aside>

  <div class="mob-cover" id="mob-cover"></div>

  <!-- Main Content -->
  <main id="main">
    <header id="topbar">
      <div class="tb-left">
        <button class="hbg" id="hbg">&#9776;</button>
        <span id="topbar-title">Grades</span>
      </div>
      <div class="tb-right"></div>
    </header>

    <div id="content">

      <!-- STUDENTS PAGE -->
      <section class="page" id="page-students">
        <div class="ph">
          <div><h3>Students</h3><p>Manage all student records</p></div>
          <button class="btn btn-primary" id="btn-add-student">+ Add Student</button>
        </div>
        <div class="fbar">
          <input type="text" id="search-students" placeholder="Search by name or ID..."/>
          <select id="filter-section-students"><option value="">All Sections</option></select>
          <span id="sort-btn-students"></span>
        </div>
        <div class="card">
          <div class="card-body p0 tw">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="students-tbody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- GRADES PAGE -->
      <section class="page" id="page-grades">
        <div class="ph">
          <div><h3>Grades</h3><p>Student grade records per subject and quarter</p></div>
          <button class="btn btn-primary teacher-only" id="btn-add-grade">+ Record Grade</button>
        </div>
        <div class="fbar">
          <input type="text" id="search-grades" placeholder="Search by student name..."/>
          <select id="filter-section-grades"><option value="">All Sections</option></select>
          <select id="filter-subject-grades"><option value="">All Subjects</option></select>
          <select id="filter-period-grades">
            <option value="">All Quarters</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
          <span id="sort-btn-grades"></span>
        </div>
        <div class="card">
          <div class="card-body p0 tw">
            <table>
              <thead>
                <tr>
                  <th class="col-student">Student</th>
                  <th>Subject</th>
                  <th>Quarter</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody id="grades-tbody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ATTENDANCE PAGE -->
      <section class="page" id="page-attendance">
        <div class="ph">
          <div><h3>Attendance</h3><p>Daily attendance records</p></div>
          <button class="btn btn-primary teacher-only" id="btn-add-attendance">+ Log Attendance</button>
        </div>
        <div class="fbar">
          <input type="text" id="search-attendance" placeholder="Search by student name..."/>
          <select id="filter-section-attendance"><option value="">All Sections</option></select>
          <select id="filter-status-attendance">
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
          <span id="sort-btn-attendance"></span>
        </div>
        <div class="card">
          <div class="card-body p0 tw">
            <table>
              <thead>
                <tr>
                  <th class="col-student">Student</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Section</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody id="attendance-tbody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- SECTIONS PAGE -->
      <section class="page" id="page-sections">
        <div class="ph">
          <div><h3>Sections</h3><p>Manage class sections and adviser assignments</p></div>
          <button class="btn btn-primary" id="btn-add-section">+ Add Section</button>
        </div>
        <div class="fbar">
          <input type="text" id="search-sections" placeholder="Search sections..."/>
          <span id="sort-btn-sections"></span>
        </div>
        <div class="sec-grid" id="sections-grid"></div>
      </section>

      <!-- REPORTS PAGE -->
      <section class="page" id="page-reports">
        <div class="ph">
          <div><h3>Reports</h3><p>Generate student performance reports</p></div>
        </div>
        <div class="card">
          <div class="card-head"><h4>Report Generator</h4></div>
          <div class="card-body">
            <div class="fr3">
              <div class="fg">
                <label class="fl">Section</label>
                <select id="report-section-filter" class="fc"><option value="">All Sections</option></select>
              </div>
              <div class="fg">
                <label class="fl">Report Type</label>
                <select id="report-type" class="fc">
                  <option value="grades">Grade Report</option>
                  <option value="attendance">Attendance Report</option>
                </select>
              </div>
              <div class="fg" style="display:flex;align-items:flex-end">
                <button class="btn btn-primary" id="btn-generate-report" style="width:100%">Generate</button>
              </div>
            </div>
          </div>
        </div>
        <div id="report-output"></div>
      </section>

      <!-- SETTINGS PAGE -->
      <section class="page" id="page-settings">
        <div class="ph">
          <div><h3>Settings</h3><p>Manage application data</p></div>
        </div>
        <div class="card" style="max-width:440px">
          <div class="card-head"><h4>Clear Data</h4></div>
          <div class="card-body">
            <p style="font-size:.8rem;color:var(--muted);line-height:1.7;margin-bottom:14px">
              Permanently erase all students, sections, grades, and attendance records.
              User accounts and your current session will be kept. This cannot be undone.
            </p>
            <button class="btn btn-danger" id="btn-clear-sidebar">Clear All Data</button>
          </div>
        </div>
      </section>

      <!-- USERS PAGE -->
      <section class="page" id="page-users">
        <div class="ph">
          <div>
            <h3>User Management</h3>
            <p>Manage system accounts</p>
          </div>
          <button class="btn btn-primary" id="btn-add-user">+ Add User</button>
        </div>
        <div class="card">
          <div class="card-body p0 tw">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="users-tbody"></tbody>
            </table>
          </div>
        </div>
      </section>

    </div><!-- /#content -->
  </main>
</div><!-- /#app-screen -->

<div id="toasts"></div>


<!-- ================================================================
     MODALS
================================================================ -->

<!-- Add / Edit Student -->
<div id="student-modal" class="overlay" style="display:none">
  <div class="mbox">
    <div class="mhead">
      <h3 id="smo-title">Add Student</h3>
      <button type="button" class="mclose" data-close="student-modal">&times;</button>
    </div>
    <form class="mbody" id="form-student-modal" onsubmit="return false">
      <input type="hidden" id="s-id"/>
      <div class="fr2">
        <div class="fg">
          <label class="fl">First Name *</label>
          <input type="text" id="s-fname" class="fc"/>
          <span class="field-error" id="fe-fname"></span>
        </div>
        <div class="fg">
          <label class="fl">Last Name *</label>
          <input type="text" id="s-lname" class="fc"/>
          <span class="field-error" id="fe-lname"></span>
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label class="fl">Section *</label>
          <select id="s-section" class="fc"><option value="">- select -</option></select>
          <span class="field-error" id="fe-section"></span>
        </div>
        <div class="fg">
          <label class="fl">Contact *</label>
          <input type="text" id="s-contact" class="fc" placeholder="09XXXXXXXXX"/>
          <span class="field-error" id="fe-contact"></span>
        </div>
      </div>
    </form>
    <div class="mfoot">
      <button type="button" class="btn btn-ghost" data-close="student-modal">Cancel</button>
      <button type="button" class="btn btn-primary" id="save-student">Save</button>
    </div>
  </div>
</div>

<!-- Add / Edit Grade -->
<div id="grade-modal" class="overlay" style="display:none">
  <div class="mbox">
    <div class="mhead">
      <h3 id="gmo-title">Record Grade</h3>
      <button type="button" class="mclose" data-close="grade-modal">&times;</button>
    </div>
    <form class="mbody" id="form-grade-modal" onsubmit="return false">
      <input type="hidden" id="g-id"/>
      <div class="fg">
        <label class="fl">Student *</label>
        <select id="g-student" class="fc"><option value="">- select -</option></select>
        <span class="field-error" id="fe-g-student"></span>
      </div>
      <div class="fr2">
        <div class="fg">
          <label class="fl">Subject *</label>
          <select id="g-subject" class="fc">
            <option value="">- select -</option>
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
            <option>Filipino</option>
            <option>Araling Panlipunan</option>
            <option>MAPEH</option>
            <option>TLE</option>
            <option>Values Education</option>
          </select>
          <span class="field-error" id="fe-g-subject"></span>
        </div>
        <div class="fg">
          <label class="fl">Quarter</label>
          <select id="g-quarter" class="fc">
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label class="fl">Grade (0-100) *</label>
        <input type="number" id="g-grade" class="fc" min="0" max="100" placeholder="e.g. 88"/>
        <span class="field-error" id="fe-g-grade"></span>
      </div>
    </form>
    <div class="mfoot">
      <button type="button" class="btn btn-ghost" data-close="grade-modal">Cancel</button>
      <button type="button" class="btn btn-primary" id="save-grade">Save</button>
    </div>
  </div>
</div>

<!-- Add / Edit Attendance -->
<div id="att-modal" class="overlay" style="display:none">
  <div class="mbox">
    <div class="mhead">
      <h3 id="atmo-title">Log Attendance</h3>
      <button type="button" class="mclose" data-close="att-modal">&times;</button>
    </div>
    <form class="mbody" id="form-att-modal" onsubmit="return false">
      <input type="hidden" id="at-id"/>
      <div class="fg">
        <label class="fl">Student *</label>
        <select id="at-student" class="fc"><option value="">- select -</option></select>
        <span class="field-error" id="fe-at-student"></span>
      </div>
      <div class="fr2">
        <div class="fg">
          <label class="fl">Date *</label>
          <input type="date" id="at-date" class="fc"/>
          <span class="field-error" id="fe-at-date"></span>
        </div>
        <div class="fg">
          <label class="fl">Status</label>
          <select id="at-status" class="fc">
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>
    </form>
    <div class="mfoot">
      <button type="button" class="btn btn-ghost" data-close="att-modal">Cancel</button>
      <button type="button" class="btn btn-primary" id="save-att">Save</button>
    </div>
  </div>
</div>

<!-- Add / Edit User -->
<div id="user-modal" class="overlay" style="display:none">
  <div class="mbox">
    <div class="mhead">
      <h3 id="user-modal-title">Add User</h3>
      <button type="button" class="mclose" data-close="user-modal">&times;</button>
    </div>
    <form class="mbody" id="form-user-modal" onsubmit="return false">
      <input type="hidden" id="user-index"/>
      <div class="fg">
        <label class="fl">Username *</label>
        <input type="text" id="user-username" class="fc"/>
      </div>
      <div class="fg">
        <label class="fl">Password *</label>
        <input type="password" id="user-password" class="fc"/>
      </div>
      <div class="fg">
        <label class="fl">Role</label>
        <select id="user-role" class="fc">
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>
    </form>
    <div class="mfoot">
      <button type="button" class="btn btn-ghost" data-close="user-modal">Cancel</button>
      <button type="button" class="btn btn-primary" id="save-user-btn">Save</button>
    </div>
  </div>
</div>

<!-- Add / Edit Section -->
<div id="section-modal" class="overlay" style="display:none">
  <div class="mbox">
    <div class="mhead">
      <h3 id="secmo-title">Add Section</h3>
      <button type="button" class="mclose" data-close="section-modal">&times;</button>
    </div>
    <form class="mbody" id="form-section-modal" onsubmit="return false">
      <input type="hidden" id="sec-id"/>
      <div class="fg">
        <label class="fl">Section Name *</label>
        <input type="text" id="sec-name" class="fc" placeholder="e.g. Grade 7 - Rizal"/>
        <span class="field-error" id="fe-sec-name"></span>
      </div>
      <div class="fr2">
        <div class="fg">
          <label class="fl">Grade Level</label>
          <select id="sec-grade" class="fc">
            <option>7</option><option>8</option><option>9</option>
            <option>10</option><option>11</option><option>12</option>
          </select>
        </div>
        <div class="fg">
          <label class="fl">Room</label>
          <input type="text" id="sec-room" class="fc" placeholder="Room 101"/>
        </div>
      </div>
      <div class="fg">
        <label class="fl">Assigned Teacher</label>
        <select id="sec-teacher" class="fc"><option value="">- select -</option></select>
      </div>
    </form>
    <div class="mfoot">
      <button type="button" class="btn btn-ghost" data-close="section-modal">Cancel</button>
      <button type="button" class="btn btn-primary" id="save-section">Save</button>
    </div>
  </div>
</div>

<!-- Confirm Delete -->
<div id="confirm-modal" class="overlay" style="display:none">
  <div class="mbox" style="max-width:370px">
    <div class="mhead">
      <h3>Confirm Delete</h3>
      <button type="button" class="mclose" data-close="confirm-modal">&times;</button>
    </div>
    <div class="mbody">
      <p class="confirm-msg" id="confirm-msg"></p>
    </div>
    <div class="mfoot">
      <button type="button" class="btn btn-ghost" data-close="confirm-modal">Cancel</button>
      <button type="button" class="btn btn-danger" id="confirm-ok">Delete</button>
    </div>
  </div>
</div>


<!-- ================================================================
     JAVASCRIPT
================================================================ -->
<script>
'use strict';

/* ================================================================
   1. BASE CLASSES
================================================================ */
class Person {
    constructor(fname, lname, contact) {
        this.fname   = fname;
        this.lname   = lname;
        this.contact = contact;
    }
    getFullName() { return `${this.fname} ${this.lname}`; }
    getInfo()     { return `Name: ${this.getFullName()}, Contact: ${this.contact}`; }
}

class BaseRecord {
    constructor(id, student) {
        this.id      = id;
        this.student = student;
    }
    getRecordInfo() { return `Record ID: ${this.id}, Student: ${this.student}`; }
}

class Section {
    constructor(id, name, grade, room, teacher = '') {
        this.id      = id;
        this.name    = name;
        this.grade   = grade;
        this.room    = room;
        this.teacher = teacher;
    }
    getAssignedTeacher() { return this.teacher || 'No teacher assigned'; }
}

/* ================================================================
   2. DERIVED CLASSES
================================================================ */
class Student extends Person {
    constructor(id, fname, lname, section, contact) {
        super(fname, lname, contact);
        this.id      = id;
        this.section = section;
    }
    getInfo()    { return `${super.getInfo()}, Section: ${this.section}`; }
    getSummary() { return `[${this.id}] ${this.getFullName()} - ${this.section}`; }
}

class Grade extends BaseRecord {
    constructor(id, student, subject, quarter, grade) {
        super(id, student);
        this.subject = subject;
        this.quarter = quarter;
        this.grade   = grade;
    }
    getRemarks() {
        const g = this.grade;
        if (g >= 90) return 'Outstanding';
        if (g >= 85) return 'Very Good';
        if (g >= 80) return 'Good';
        if (g >= 75) return 'Passed';
        return 'Failed';
    }
    getRecordInfo() {
        return `${super.getRecordInfo()} | ${this.subject} ${this.quarter}: ${this.grade} (${this.getRemarks()})`;
    }
}

class Attendance extends BaseRecord {
    constructor(id, student, date, status, section = '') {
        super(id, student);
        this.date    = date;
        this.status  = status;
        this.section = section;
    }
    getRecordInfo() {
        return `${super.getRecordInfo()} | Date: ${this.date}, Status: ${this.status}`;
    }
}

class User {
    constructor(username, password, role, isDemo = false) {
        this.username = username;
        this.password = password;
        this.role     = role;
        this.isDemo   = isDemo;
    }
    isTeacher() { return this.role === 'teacher'; }
    isStudent() { return this.role === 'student'; }
}

/* ================================================================
   3. DUMMY DATA
================================================================ */
//REMOVED NA TO KASI NAGAWAN KO NA SA PHP I COMMENT NIYO NLNG MGA IREREMOVE NIYO KUNG DI NA NEED ----------------------------------
// let users = [ 
//     new User('teacher1', 'pass123', 'teacher', true),
//     new User('teacher2', 'pass123', 'teacher', true),
//     new User('student1', 'pass123', 'student', true),
//     new User('student2', 'pass123', 'student', true),
//     new User('student3', 'pass123', 'student', true),
//     new User('student4', 'pass123', 'student', true),
// ];

let students = [
    new Student(1, 'King',    'De Matta',  'Grade 7 - Rizal',     '09171234567'),
    new Student(2, 'Brent',   'Ignacio',   'Grade 7 - Rizal',     '09181234567'),
    new Student(3, 'Jhon',    'Fabiala',   'Grade 7 - Rizal',     '09191234567'),
    new Student(4, 'Merie',   'Navea',     'Grade 8 - Bonifacio', '09201234567'),
    new Student(5, 'Les',     'Dejayco',   'Grade 8 - Bonifacio', '09211234567'),
    new Student(6, 'Emjay',   'Gargarino', 'Grade 8 - Bonifacio', '09221234567'),
    new Student(7, 'Miah',    'Jesalva',   'Grade 9 - Mabini',    '09231234567'),
    new Student(8, 'Justine', 'Malawit',   'Grade 9 - Mabini',    '09241234567'),
    new Student(9, 'Rich',    'Escopete',  'Grade 9 - Mabini',    '09251234567'),
];

const studentAccountMap = {
    student1: 'Brent Ignacio',
    student2: 'Jhon Fabiala',
    student3: 'Miah Jesalva',
    student4: 'Emjay Gargarino',
};
const teacherAccountMap = {
    teacher1: 'Janus Tan',
    teacher2: 'Patrick Ogacales',
};

let grades = [
    new Grade(1,  'Brent Ignacio',   'Mathematics', 'Q1', 88),
    new Grade(2,  'Brent Ignacio',   'Science',     'Q1', 60),
    new Grade(3,  'Brent Ignacio',   'English',     'Q2', 85),
    new Grade(4,  'King De Matta',   'Mathematics', 'Q1', 92),
    new Grade(5,  'King De Matta',   'Science',     'Q2', 89),
    new Grade(6,  'King De Matta',   'Filipino',    'Q3', 51),
    new Grade(7,  'Jhon Fabiala',    'Mathematics', 'Q1', 75),
    new Grade(8,  'Jhon Fabiala',    'English',     'Q2', 80),
    new Grade(9,  'Jhon Fabiala',    'Science',     'Q3', 78),
    new Grade(10, 'Merie Navea',     'Filipino',    'Q1', 81),
    new Grade(11, 'Merie Navea',     'English',     'Q2', 84),
    new Grade(12, 'Merie Navea',     'Science',     'Q3', 79),
    new Grade(13, 'Les Dejayco',     'Mathematics', 'Q1', 82),
    new Grade(14, 'Les Dejayco',     'Science',     'Q2', 88),
    new Grade(15, 'Les Dejayco',     'English',     'Q3', 70),
    new Grade(16, 'Emjay Gargarino', 'Mathematics', 'Q1', 95),
    new Grade(17, 'Emjay Gargarino', 'Science',     'Q2', 92),
    new Grade(18, 'Emjay Gargarino', 'Filipino',    'Q3', 88),
    new Grade(19, 'Miah Jesalva',    'English',     'Q1', 84),
    new Grade(20, 'Miah Jesalva',    'Science',     'Q2', 60),
    new Grade(21, 'Justine Malawit', 'Filipino',    'Q1', 77),
    new Grade(22, 'Justine Malawit', 'Mathematics', 'Q2', 82),
    new Grade(23, 'Rich Escopete',   'Mathematics', 'Q1', 90),
    new Grade(24, 'Rich Escopete',   'Science',     'Q2', 85),
];

let attendance = [
    new Attendance(1,  'Brent Ignacio',   '2026-04-01', 'Present', 'Grade 7 - Rizal'),
    new Attendance(2,  'Brent Ignacio',   '2026-04-02', 'Late',    'Grade 7 - Rizal'),
    new Attendance(3,  'Brent Ignacio',   '2026-04-03', 'Absent',  'Grade 7 - Rizal'),
    new Attendance(4,  'King De Matta',   '2026-04-01', 'Present', 'Grade 7 - Rizal'),
    new Attendance(5,  'King De Matta',   '2026-04-02', 'Present', 'Grade 7 - Rizal'),
    new Attendance(6,  'King De Matta',   '2026-04-03', 'Late',    'Grade 7 - Rizal'),
    new Attendance(7,  'Jhon Fabiala',    '2026-04-01', 'Late',    'Grade 7 - Rizal'),
    new Attendance(8,  'Jhon Fabiala',    '2026-04-02', 'Absent',  'Grade 7 - Rizal'),
    new Attendance(9,  'Jhon Fabiala',    '2026-04-03', 'Present', 'Grade 7 - Rizal'),
    new Attendance(10, 'Merie Navea',     '2026-04-01', 'Present', 'Grade 8 - Bonifacio'),
    new Attendance(11, 'Merie Navea',     '2026-04-02', 'Late',    'Grade 8 - Bonifacio'),
    new Attendance(12, 'Merie Navea',     '2026-04-03', 'Present', 'Grade 8 - Bonifacio'),
    new Attendance(13, 'Les Dejayco',     '2026-04-01', 'Present', 'Grade 8 - Bonifacio'),
    new Attendance(14, 'Les Dejayco',     '2026-04-02', 'Absent',  'Grade 8 - Bonifacio'),
    new Attendance(15, 'Les Dejayco',     '2026-04-03', 'Late',    'Grade 8 - Bonifacio'),
    new Attendance(16, 'Emjay Gargarino', '2026-04-01', 'Absent',  'Grade 8 - Bonifacio'),
    new Attendance(17, 'Emjay Gargarino', '2026-04-02', 'Present', 'Grade 8 - Bonifacio'),
    new Attendance(18, 'Emjay Gargarino', '2026-04-03', 'Late',    'Grade 8 - Bonifacio'),
    new Attendance(19, 'Miah Jesalva',    '2026-04-01', 'Present', 'Grade 9 - Mabini'),
    new Attendance(20, 'Miah Jesalva',    '2026-04-02', 'Present', 'Grade 9 - Mabini'),
    new Attendance(21, 'Justine Malawit', '2026-04-01', 'Late',    'Grade 9 - Mabini'),
    new Attendance(22, 'Justine Malawit', '2026-04-02', 'Absent',  'Grade 9 - Mabini'),
    new Attendance(23, 'Rich Escopete',   '2026-04-01', 'Present', 'Grade 9 - Mabini'),
    new Attendance(24, 'Rich Escopete',   '2026-04-02', 'Late',    'Grade 9 - Mabini'),
];

let sections = [
    new Section(1, 'Grade 7 - Rizal',     7, 'Room 101', 'Janus Tan'),
    new Section(2, 'Grade 8 - Bonifacio', 8, 'Room 102', 'Patrick Ogacales'),
    new Section(3, 'Grade 9 - Mabini',    9, 'Room 103', 'Janus Tan'),
];

let currentUser = null;

/* ================================================================
   4. UTILITY HELPERS
================================================================ */
function esc(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function toast(msg, type = 'ok') {
    const $t = $(`<div class="toast ${type}">${msg}</div>`);
    $('#toasts').append($t);
    setTimeout(() => $t.fadeOut(300, () => $t.remove()), 3000);
}

function populateSectionFilter(sel) {
    const $f = $(sel).empty().append('<option value="">All Sections</option>');
    sections.forEach(s => $f.append(`<option value="${esc(s.name)}">${esc(s.name)}</option>`));
}

function refreshAllSectionFilters() {
    populateSectionFilter('#filter-section-students');
    populateSectionFilter('#filter-section-grades');
    populateSectionFilter('#filter-section-attendance');
    populateSectionFilter('#report-section-filter');
}

function populateSubjects() {
    const subjects = [
        'Mathematics', 'Science', 'English', 'Filipino',
        'Araling Panlipunan', 'MAPEH', 'TLE', 'Values Education',
    ];
    const $f = $('#filter-subject-grades').empty().append('<option value="">All Subjects</option>');
    subjects.forEach(s => $f.append(`<option value="${s}">${s}</option>`));
}

/* ================================================================
   5. SORT HELPERS
================================================================ */
const sortState = {
    students:   null,
    grades:     null,
    attendance: null,
    sections:   null,
};

function sortIcon(dir) {
    return dir === 'asc'
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
             <path d="M12 5v14M5 12l7-7 7 7"/>
           </svg>`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
             <path d="M12 19V5M5 12l7 7 7-7"/>
           </svg>`;
}

function sortBtn(page) {
    return `<button type="button" class="btn btn-ghost sort-btn" data-sort-page="${page}"
        style="display:inline-flex;align-items:center;gap:5px;font-size:.75rem;padding:5px 11px;">
        ${sortIcon('asc')}<span>A to Z</span>
    </button>`;
}

function studentSortKey(fullName) {
    const s = students.find(x => x.getFullName() === fullName);
    return s ? (s.lname + ' ' + s.fname).toLowerCase() : fullName.toLowerCase();
}

$(document).on('click', '.sort-btn', function () {
    const page = $(this).data('sort-page');
    sortState[page] = sortState[page] === 'asc' ? 'desc' : 'asc';
    const dir = sortState[page];
    $(this).find('span').text(dir === 'asc' ? 'A to Z' : 'Z to A');
    $(this).find('svg').replaceWith($(sortIcon(dir)));
    const renderMap = {
        students:   renderStudents,
        grades:     renderGrades,
        attendance: renderAttendance,
        sections:   renderSections,
    };
    if (renderMap[page]) renderMap[page]();
});

/* ================================================================
   6. CONFIRM MODAL
================================================================ */
let confirmCallback = null;

function showConfirm(message, callback) {
    confirmCallback = callback;
    $('#confirm-msg').text(message);
    $('#confirm-modal').fadeIn();
}

$(document).on('click', '#confirm-ok', function () {
    $('#confirm-modal').fadeOut();
    if (typeof confirmCallback === 'function') {
        confirmCallback();
        confirmCallback = null;
    }
});

/* ================================================================
   7. MODAL CLOSE
================================================================ */
$(document).on('click', '.overlay', function (e) {
    if ($(e.target).hasClass('overlay')) $(this).fadeOut();
});
$(document).on('click', '.mclose, [data-close]', function (e) {
    e.stopPropagation();
    const target = $(this).data('close');
    if (target) $(`#${target}`).fadeOut();
    else $('.overlay').fadeOut();
});
$(document).on('click', '.mbox', e => e.stopPropagation());

/* ================================================================
   8. LOGIN
================================================================ */
$('.rtab').click(function () {
    $('.rtab').removeClass('active');
    $(this).addClass('active');
    const tab = $(this).data('tab');
    $('.lform').removeClass('active');
    $(`#form-${tab}`).addClass('active');
    $('#login-err').fadeOut().text('');
});

$('#btn-tlogin').click(() => login($('#t-user').val(), $('#t-pw').val(), 'teacher'));
$('#btn-slogin').click(() => login($('#s-user').val(), $('#s-pw').val(), 'student'));

/* Enter key support on login forms */
$('#form-teacher').on('submit', () => login($('#t-user').val(), $('#t-pw').val(), 'teacher'));
$('#form-student').on('submit', () => login($('#s-user').val(), $('#s-pw').val(), 'student'));

function login(username, password, role) {
    const found = users.find(u => u.username === username && u.password === password && u.role === role);

    if (!found) {
        $('#login-err').text('Invalid credentials').fadeIn();
        return;
    }

    currentUser = found;
    $('#login-screen').removeClass('active');
    $('#app-screen').addClass('active');
    $('#sb-role').text(found.role);

    if (found.isTeacher()) {
        $('.teacher-only').show();
        const name = teacherAccountMap[found.username] || found.username;
        $('#sb-name').text(name);
        $('#sb-av').text(name.charAt(0));
    } else {
        $('.teacher-only').hide();
        const name = studentAccountMap[found.username] || found.username;
        $('#sb-name').text(name);
        $('#sb-av').text(name.charAt(0));
    }

    refreshAllSectionFilters();
    populateSubjects();

    $('#sort-btn-students').html(sortBtn('students'));
    $('#sort-btn-grades').html(sortBtn('grades'));
    $('#sort-btn-attendance').html(sortBtn('attendance'));
    $('#sort-btn-sections').html(sortBtn('sections'));

    renderStudents();
    renderGrades();
    renderAttendance();
    renderSections();
    renderUsers();
    showPage(found.isTeacher() ? 'students' : 'grades');
}

/* ================================================================
   9. NAVIGATION
================================================================ */
$(document).on('click', '.nav-link', function () {
    showPage($(this).data('page'));
});

function showPage(page) {
    $('.page').removeClass('active');
    $('.nav-link').removeClass('active');
    $(`#page-${page}`).addClass('active');
    $(`.nav-link[data-page="${page}"]`).addClass('active');
    $('#topbar-title').text(page.charAt(0).toUpperCase() + page.slice(1));
    if (page === 'users') renderUsers();
}

$('#hbg').on('click', () => {
    $('#sidebar').toggleClass('open');
    $('#mob-cover').toggleClass('show');
});
$('#mob-cover').on('click', () => {
    $('#sidebar').removeClass('open');
    $('#mob-cover').removeClass('show');
});

/* ================================================================
   10. STUDENTS CRUD
================================================================ */
function renderStudents() {
    const q   = ($('#search-students').val() || '').toLowerCase();
    const sec = $('#filter-section-students').val();
    const dir = sortState.students;

    let list = students.filter(s => {
        const name = s.getFullName().toLowerCase();
        return (name.includes(q) || String(s.id).includes(q)) && (!sec || s.section === sec);
    });

    if (dir) {
        list.sort((a, b) => {
            const na = (a.lname + ' ' + a.fname).toLowerCase();
            const nb = (b.lname + ' ' + b.fname).toLowerCase();
            return dir === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
        });
    }

    if (!list.length) {
        $('#students-tbody').html(`<tr><td colspan="5">
            <div class="empty"><div class="empty-val">-</div><p>No students found.</p></div>
        </td></tr>`);
        return;
    }

    $('#students-tbody').html(list.map(s => `
        <tr>
            <td><span class="badge b-blue">${s.id}</span></td>
            <td><b>${esc(s.getFullName())}</b></td>
            <td>${esc(s.section)}</td>
            <td>${esc(s.contact)}</td>
            <td>
                <button type="button" class="btn-sm btn-sm-edit edit-student" data-id="${s.id}">Edit</button>
                <button type="button" class="btn-sm btn-sm-delete delete-student" data-id="${s.id}">Delete</button>
            </td>
        </tr>`).join(''));
}

$('#search-students, #filter-section-students').on('input change', renderStudents);

function openStudentModal(id = null) {
    const s = id ? students.find(x => x.id == id) : null;
    const secOpts = sections.map(sec =>
        `<option value="${esc(sec.name)}" ${s && s.section === sec.name ? 'selected' : ''}>${esc(sec.name)}</option>`
    ).join('');
    $('#s-section').html('<option value="">- select -</option>' + secOpts);

    if (s) {
        $('#s-id').val(s.id);
        $('#s-fname').val(s.fname);
        $('#s-lname').val(s.lname);
        $('#s-contact').val(s.contact);
        $('#s-section').val(s.section);
        $('#smo-title').text('Edit Student');
    } else {
        $('#s-id, #s-fname, #s-lname, #s-contact').val('');
        $('#s-section').val('');
        $('#smo-title').text('Add Student');
    }
    $('.field-error').text('');
    $('#student-modal').fadeIn();
}

function saveStudent() {
    const id      = $('#s-id').val();
    const fname   = $('#s-fname').val().trim();
    const lname   = $('#s-lname').val().trim();
    const section = $('#s-section').val();
    const contact = $('#s-contact').val().trim();
    let ok = true;

    $('#fe-fname, #fe-lname, #fe-section, #fe-contact').text('');
    if (!fname)   { $('#fe-fname').text('First name required.');  ok = false; }
    if (!lname)   { $('#fe-lname').text('Last name required.');   ok = false; }
    if (!section) { $('#fe-section').text('Section required.');   ok = false; }
    if (!contact) { $('#fe-contact').text('Contact required.');   ok = false; }
    if (!ok) return;

    if (id) {
        students = students.map(s =>
            s.id == Number(id) ? new Student(Number(id), fname, lname, section, contact) : s
        );
        toast('Student updated');
    } else {
        const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
        students.push(new Student(newId, fname, lname, section, contact));
        toast('Student added');
    }

    renderStudents();
    renderSections();
    $('#student-modal').fadeOut();
}

function deleteStudent(id) {
    id = Number(id);
    showConfirm('Delete this student and all their records?', () => {
        const name = students.find(s => s.id === id)?.getFullName();
        students   = students.filter(s => s.id !== id);
        grades     = grades.filter(g => g.student !== name);
        attendance = attendance.filter(a => a.student !== name);
        renderStudents();
        renderSections();
        toast('Student deleted', 'bad');
    });
}

$('#btn-add-student').click(() => openStudentModal());
$('#save-student').click(saveStudent);
$(document).on('click', '.edit-student',   function () { openStudentModal($(this).data('id')); });
$(document).on('click', '.delete-student', function () { deleteStudent($(this).data('id')); });

/* ================================================================
   11. GRADES CRUD
================================================================ */
function renderGrades() {
    const q       = ($('#search-grades').val() || '').toLowerCase();
    const sec     = $('#filter-section-grades').val();
    const subject = $('#filter-subject-grades').val();
    const period  = $('#filter-period-grades').val();
    const dir     = sortState.grades;
    const isT     = currentUser && currentUser.isTeacher();

    let list = grades;

    if (currentUser && currentUser.isStudent()) {
        const fullName = studentAccountMap[currentUser.username];
        list = list.filter(g => g.student === fullName);
    }

    list = list.filter(g => {
        const stuObj       = students.find(s => s.getFullName() === g.student);
        const sectionMatch = !sec     || (stuObj && stuObj.section === sec);
        const subjectMatch = !subject || g.subject === subject;
        const periodMatch  = !period  || g.quarter === period;
        return g.student.toLowerCase().includes(q) && sectionMatch && subjectMatch && periodMatch;
    });

    if (dir) {
        list.sort((a, b) => {
            const na = studentSortKey(a.student);
            const nb = studentSortKey(b.student);
            return dir === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
        });
    }

    if (!list.length) {
        $('#grades-tbody').html(`<tr><td colspan="6">
            <div class="empty"><div class="empty-val">-</div><p>No grades found.</p></div>
        </td></tr>`);
    } else {
        $('#grades-tbody').html(list.map(g => {
            const pass = g.grade >= 75;
            return `<tr>
                ${isT ? `<td class="col-student">${esc(g.student)}</td>` : ''}
                <td>${esc(g.subject)}</td>
                <td><span class="badge b-blue">${esc(g.quarter)}</span></td>
                <td><b>${g.grade}</b></td>
                <td><span class="badge ${pass ? 'b-ok' : 'b-err'}">${g.getRemarks()}</span></td>
                ${isT ? `<td class="col-actions">
                    <button type="button" class="btn-sm btn-sm-edit edit-grade" data-id="${g.id}">Edit</button>
                    <button type="button" class="btn-sm btn-sm-delete delete-grade" data-id="${g.id}">Delete</button>
                </td>` : ""}
            </tr>`;
        }).join(''));
    }

    $('.col-student, .col-actions').toggle(!!isT);
}

$('#search-grades, #filter-section-grades, #filter-subject-grades, #filter-period-grades')
    .on('input change', renderGrades);

function openGradeModal(id = null) {
    const g    = id ? grades.find(x => x.id == id) : null;
    const opts = students.map(s =>
        `<option value="${esc(s.getFullName())}" ${g && g.student === s.getFullName() ? 'selected' : ''}>${esc(s.getFullName())}</option>`
    ).join('');
    $('#g-student').html('<option value="">- select -</option>' + opts);

    if (g) {
        $('#g-id').val(g.id);
        $('#g-student').val(g.student);
        $('#g-subject').val(g.subject);
        $('#g-quarter').val(g.quarter);
        $('#g-grade').val(g.grade);
        $('#gmo-title').text('Edit Grade');
    } else {
        $('#g-id, #g-grade').val('');
        $('#g-student, #g-subject').val('');
        $('#g-quarter').val('Q1');
        $('#gmo-title').text('Record Grade');
    }
    $('.field-error').text('');
    $('#grade-modal').fadeIn();
}

function saveGrade() {
    const id      = $('#g-id').val();
    const student = $('#g-student').val();
    const subject = $('#g-subject').val();
    const quarter = $('#g-quarter').val();
    const grade   = parseFloat($('#g-grade').val());
    let ok = true;

    $('#fe-g-student, #fe-g-subject, #fe-g-grade').text('');
    if (!student)                                 { $('#fe-g-student').text('Student required.'); ok = false; }
    if (!subject)                                 { $('#fe-g-subject').text('Subject required.'); ok = false; }
    if (isNaN(grade) || grade < 0 || grade > 100) { $('#fe-g-grade').text('Enter 0-100.');        ok = false; }
    if (!ok) return;

    if (id) {
        const g = grades.find(x => x.id == id);
        Object.assign(g, { student, subject, quarter, grade });
        toast('Grade updated');
    } else {
        grades.push(new Grade(Date.now(), student, subject, quarter, grade));
        toast('Grade added');
    }
    renderGrades();
    $('#grade-modal').fadeOut();
}

function deleteGrade(id) {
    showConfirm('Delete this grade record?', () => {
        grades = grades.filter(g => g.id != id);
        renderGrades();
        toast('Grade deleted', 'bad');
    });
}

$('#btn-add-grade').click(() => openGradeModal());
$('#save-grade').click(saveGrade);
$(document).on('click', '.edit-grade',   function () { openGradeModal($(this).data('id')); });
$(document).on('click', '.delete-grade', function () { deleteGrade($(this).data('id')); });

/* ================================================================
   12. ATTENDANCE CRUD
================================================================ */
function renderAttendance() {
    const q      = ($('#search-attendance').val() || '').toLowerCase();
    const sec    = $('#filter-section-attendance').val();
    const status = $('#filter-status-attendance').val();
    const dir    = sortState.attendance;
    const isT    = currentUser && currentUser.isTeacher();

    let list = attendance;

    if (currentUser && currentUser.isStudent()) {
        const fullName = studentAccountMap[currentUser.username];
        list = list.filter(a => a.student === fullName);
    }

    list = list.filter(a =>
        a.student.toLowerCase().includes(q) &&
        (!sec    || a.section === sec) &&
        (!status || a.status  === status)
    );

    if (dir) {
        list.sort((a, b) => {
            const na  = studentSortKey(a.student);
            const nb  = studentSortKey(b.student);
            const cmp = dir === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
            return cmp !== 0 ? cmp : b.date.localeCompare(a.date);
        });
    }

    const statusClass = { Present: 'b-ok', Absent: 'b-err', Late: 'b-warn' };

    if (!list.length) {
        $('#attendance-tbody').html(`<tr><td colspan="5">
            <div class="empty"><div class="empty-val">-</div><p>No attendance records found.</p></div>
        </td></tr>`);
    } else {
        $('#attendance-tbody').html(list.map(a => `
            <tr>
                ${isT ? `<td class="col-student">${esc(a.student)}</td>` : ''}
                <td>${a.date}</td>
                <td><span class="badge ${statusClass[a.status] || 'b-gray'}">${esc(a.status)}</span></td>
                <td>${esc(a.section || '-')}</td>
                ${isT ? `<td class="col-actions">
                    <button type="button" class="btn-sm btn-sm-edit edit-att" data-id="${a.id}">Edit</button>
                    <button type="button" class="btn-sm btn-sm-delete delete-att" data-id="${a.id}">Delete</button>
                </td>` : ""}
            </tr>`).join(''));
    }

    $('.col-student, .col-actions').toggle(!!isT);
}

$('#search-attendance, #filter-section-attendance, #filter-status-attendance')
    .on('input change', renderAttendance);

function openAttendanceModal(id = null) {
    const a       = id ? attendance.find(x => x.id == id) : null;
    const options = students.map(s => {
        const name = s.getFullName();
        return `<option value="${esc(name)}" ${a && a.student === name ? 'selected' : ''}>${esc(name)}</option>`;
    }).join('');
    $('#at-student').html('<option value="">- select -</option>' + options);

    if (a) {
        $('#at-id').val(a.id);
        $('#at-student').val(a.student);
        $('#at-date').val(a.date);
        $('#at-status').val(a.status);
        $('#atmo-title').text('Edit Attendance');
    } else {
        $('#at-id').val('');
        $('#at-student').val('');
        $('#at-date').val(new Date().toISOString().split('T')[0]);
        $('#at-status').val('Present');
        $('#atmo-title').text('Log Attendance');
    }
    $('.field-error').text('');
    $('#att-modal').fadeIn();
}

function saveAttendance() {
    const id      = $('#at-id').val();
    const student = $('#at-student').val();
    const date    = $('#at-date').val();
    const status  = $('#at-status').val();
    let ok = true;

    $('#fe-at-student, #fe-at-date').text('');
    if (!student) { $('#fe-at-student').text('Student required.'); ok = false; }
    if (!date)    { $('#fe-at-date').text('Date required.');        ok = false; }
    if (!ok) return;

    const duplicate = attendance.some(a => a.student === student && a.date === date && a.id != id);
    if (duplicate) { alert('Attendance already logged for this student on this date.'); return; }

    const section = students.find(s => s.getFullName() === student)?.section || '';

    if (id) {
        const a = attendance.find(x => x.id == id);
        Object.assign(a, { student, date, status, section });
        toast('Attendance updated');
    } else {
        const newId = attendance.length ? Math.max(...attendance.map(a => a.id)) + 1 : 1;
        attendance.push(new Attendance(newId, student, date, status, section));
        toast('Attendance added');
    }
    renderAttendance();
    $('#att-modal').fadeOut();
}

function deleteAttendance(id) {
    showConfirm('Delete this attendance record?', () => {
        attendance = attendance.filter(a => a.id != id);
        renderAttendance();
        toast('Attendance deleted', 'bad');
    });
}

$('#btn-add-attendance').click(() => openAttendanceModal());
$('#save-att').click(saveAttendance);
$(document).on('click', '.edit-att',   function () { openAttendanceModal($(this).data('id')); });
$(document).on('click', '.delete-att', function () { deleteAttendance($(this).data('id')); });

/* ================================================================
   13. SECTIONS
================================================================ */
function renderSections() {
    const q   = ($('#search-sections').val() || '').toLowerCase();
    const dir = sortState.sections;

    let list = sections.filter(s => s.name.toLowerCase().includes(q));

    if (dir) {
        list.sort((a, b) => dir === 'asc'
            ? a.name.toLowerCase().localeCompare(b.name.toLowerCase())
            : b.name.toLowerCase().localeCompare(a.name.toLowerCase())
        );
    }

    if (!list.length) {
        $('#sections-grid').html(`
            <div class="empty" style="grid-column:1/-1">
              <div class="empty-val">-</div><p>No sections found.</p>
            </div>`);
        return;
    }

    $('#sections-grid').html(list.map(sec => {
        const count = students.filter(s => s.section === sec.name).length;
        return `
            <div class="sec-card">
                <div class="sec-card-name">${esc(sec.name)}</div>
                <div class="sec-card-meta">Grade ${esc(String(sec.grade))} &middot; ${esc(sec.room || '-')}</div>
                <div class="sec-stat-num">${count}</div>
                <div class="sec-stat-lbl">Students enrolled</div>
                <div class="sec-teacher">Adviser: ${esc(sec.getAssignedTeacher())}</div>
                <div class="sec-card-actions">
                    <button type="button" class="btn-sm btn-sm-edit edit-section" data-id="${sec.id}">Edit</button>
                    <button type="button" class="btn-sm btn-sm-delete delete-section" data-id="${sec.id}">Delete</button>
                </div>
            </div>`;
    }).join(''));
}

$('#search-sections').on('input', renderSections);

function openSectionModal(id = null) {
    const sec         = id ? sections.find(s => s.id == id) : null;
    const teacherOpts = Object.values(teacherAccountMap).map(name =>
        `<option value="${esc(name)}" ${sec && sec.teacher === name ? 'selected' : ''}>${esc(name)}</option>`
    ).join('');
    $('#sec-teacher').html('<option value="">- select teacher -</option>' + teacherOpts);

    if (sec) {
        $('#sec-id').val(sec.id);
        $('#sec-name').val(sec.name);
        $('#sec-grade').val(sec.grade);
        $('#sec-room').val(sec.room || '');
        $('#sec-teacher').val(sec.teacher || '');
        $('#secmo-title').text('Edit Section');
    } else {
        $('#sec-id, #sec-name, #sec-room').val('');
        $('#sec-grade').val('7');
        $('#secmo-title').text('Add Section');
    }
    $('.field-error').text('');
    $('#section-modal').fadeIn();
}

function saveSection() {
    const id      = $('#sec-id').val();
    const name    = $('#sec-name').val().trim();
    const grade   = $('#sec-grade').val();
    const room    = $('#sec-room').val().trim();
    const teacher = $('#sec-teacher').val();

    $('#fe-sec-name').text('');
    if (!name) { $('#fe-sec-name').text('Section name required.'); return; }

    if (id) {
        sections = sections.map(s =>
            s.id == id ? new Section(Number(id), name, grade, room, teacher) : s
        );
        toast('Section updated');
    } else {
        const newId = sections.length ? Math.max(...sections.map(s => s.id)) + 1 : 1;
        sections.push(new Section(newId, name, grade, room, teacher));
        toast('Section added');
    }
    renderSections();
    refreshAllSectionFilters();
    $('#section-modal').fadeOut();
}

function deleteSection(id) {
    showConfirm('Delete this section? Students will remain but become unassigned.', () => {
        sections = sections.filter(s => s.id != id);
        renderSections();
        refreshAllSectionFilters();
        toast('Section deleted', 'bad');
    });
}

$('#btn-add-section').click(() => openSectionModal());
$('#save-section').click(saveSection);
$(document).on('click', '.edit-section',   function () { openSectionModal($(this).data('id')); });
$(document).on('click', '.delete-section', function () { deleteSection($(this).data('id')); });

/* ================================================================
   14. REPORTS
================================================================ */
$('#btn-generate-report').click(function () {
    const secName   = $('#report-section-filter').val();
    const type      = $('#report-type').val();
    const list      = secName ? students.filter(s => s.section === secName) : students;
    const label     = secName || 'All Sections';
    const typeLabel = type === 'grades' ? 'Grade Report' : 'Attendance Report';

    const $out = $('#report-output').empty();
    $out.append(`
        <div class="rcard">
            <div class="rcard-head">
                <div class="rcard-school">
                    School Portal Report
                    <small>${typeLabel} &mdash; ${esc(label)}</small>
                </div>
                <div style="font-size:.7rem;color:var(--muted)">Generated: ${new Date().toLocaleString()}</div>
            </div>
            <div id="rpt-inner"></div>
        </div>`);

    if (type === 'grades') {
        const subjects = ['Mathematics', 'Science', 'English', 'Filipino', 'Araling Panlipunan'];
        let html = `<div class="tw"><table>
            <thead><tr style="background:var(--green-dark)">
                <th style="color:#fff">Student</th>
                <th style="color:#fff">Subject</th>
                <th style="color:#fff">Q1</th><th style="color:#fff">Q2</th>
                <th style="color:#fff">Q3</th><th style="color:#fff">Q4</th>
                <th style="color:#fff">Average</th>
                <th style="color:#fff">Status</th>
            </tr></thead><tbody>`;

        list.forEach(s => {
            subjects.forEach(sub => {
                const vals   = ['Q1', 'Q2', 'Q3', 'Q4'].map(p => {
                    const g = grades.find(g => g.student === s.getFullName() && g.subject === sub && g.quarter === p);
                    return g ? g.grade : null;
                });
                const filled = vals.filter(v => v !== null);
                const avg    = filled.length ? (filled.reduce((a, b) => a + b, 0) / filled.length).toFixed(1) : '-';
                const pass   = parseFloat(avg) >= 75;
                html += `<tr>
                    <td>${esc(s.getFullName())}</td><td>${sub}</td>
                    ${vals.map(v => `<td>${v !== null ? v : '-'}</td>`).join('')}
                    <td><b>${avg}</b></td>
                    <td><span class="badge ${pass ? 'b-ok' : 'b-err'}">${pass ? 'Passed' : 'Failed'}</span></td>
                </tr>`;
            });
        });
        html += '</tbody></table></div>';
        $('#rpt-inner').html(html);

    } else {
        let html = `<div class="tw"><table>
            <thead><tr style="background:var(--green-dark)">
                <th style="color:#fff">Student</th>
                <th style="color:#fff">Present</th><th style="color:#fff">Absent</th>
                <th style="color:#fff">Late</th><th style="color:#fff">Total</th>
                <th style="color:#fff">Rate</th>
            </tr></thead><tbody>`;

        list.forEach(s => {
            const recs    = attendance.filter(a => a.student === s.getFullName());
            const present = recs.filter(a => a.status === 'Present').length;
            const absent  = recs.filter(a => a.status === 'Absent').length;
            const late    = recs.filter(a => a.status === 'Late').length;
            const total   = recs.length;
            const rate    = total ? ((present / total) * 100).toFixed(1) + '%' : '-';
            html += `<tr>
                <td>${esc(s.getFullName())}</td>
                <td><span class="badge b-ok">${present}</span></td>
                <td><span class="badge b-err">${absent}</span></td>
                <td><span class="badge b-warn">${late}</span></td>
                <td>${total}</td>
                <td><b>${rate}</b></td>
            </tr>`;
        });
        html += '</tbody></table></div>';
        $('#rpt-inner').html(html);
    }

    $out.hide().fadeIn(400, () => toast('Report generated.', 'inf'));
});

/* ================================================================
   15. USERS CRUD
================================================================ */
function renderUsers() {
    if (!users.length) {
        $('#users-tbody').html(`<tr><td colspan="4">No users found</td></tr>`);
        return;
    }

    let html = '';
    users.forEach((u, index) => {
        html += `
        <tr>
            <td>${esc(u.username)}</td>
            <td>${esc(u.password)}</td>
            <td>${esc(u.role)}</td>
            <td>
                <button type="button" class="btn-sm btn-sm-edit" onclick="editUser(${index})">Edit</button>
                <button type="button" class="btn-sm btn-sm-delete" onclick="removeUser(${index})">Delete</button>
            </td>
        </tr>`;
    });

    $('#users-tbody').html(html);
}

function openUserModal(index = null) {
    if (index !== null) {
        const u = users[index];
        $('#user-index').val(index);
        $('#user-username').val(u.username);
        $('#user-password').val(u.password);
        $('#user-role').val(u.role);
        $('#user-modal-title').text('Edit User');
    } else {
        $('#user-index').val('');
        $('#user-username').val('');
        $('#user-password').val('');
        $('#user-role').val('teacher');
        $('#user-modal-title').text('Add User');
    }
    $('#user-modal').fadeIn();
}

function saveUser() {
    const index    = $('#user-index').val();
    const username = $('#user-username').val().trim();
    const password = $('#user-password').val().trim();
    const role     = $('#user-role').val();

    if (!username || !password) {
        alert('Please fill all fields');
        return;
    }

    if (index !== '') {
        users[index] = new User(username, password, role);
        toast('User updated');
    } else {
        users.push(new User(username, password, role));
        toast('User added');
    }

    renderUsers();
    $('#user-modal').fadeOut();
}

function removeUser(index) {
    if (users[index].isDemo) {
        alert('Demo accounts cannot be deleted.');
        return;
    }
    if (users[index].username === currentUser.username) {
        alert('You cannot delete your own account.');
        return;
    }
    showConfirm('Are you sure you want to delete this user?', () => {
        users.splice(index, 1);
        renderUsers();
        toast('User deleted', 'bad');
    });
}

function editUser(index) {
    openUserModal(index);
}

$('#btn-add-user').click(() => openUserModal());
$('#save-user-btn').click(saveUser);

/* ================================================================
   16. CLEAR DATA
================================================================ */
$(document).on('click', '#btn-clear-sidebar', function () {
    showConfirm('This will permanently delete all students, grades, attendance, and sections. Continue?', () => {
        students   = [];
        grades     = [];
        attendance = [];
        sections   = [];
        renderStudents();
        renderGrades();
        renderAttendance();
        renderSections();
        refreshAllSectionFilters();
        toast('All data has been cleared.', 'inf');
    });
});

/* ================================================================
   17. LOGOUT
================================================================ */
$('#btn-sidebar-logout').click(() => {
    currentUser = null;
    $('#app-screen').removeClass('active');
    $('#login-screen').addClass('active');
    $('#t-pw, #t-user, #s-pw, #s-user').val('');
    $('#login-err').hide();
    toast('Signed out successfully.', 'inf');
});
</script>
</body>
</html> -->