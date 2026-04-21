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

/* ================================================================
   3. DATA STORES
================================================================ */
let students   = [
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

/* Demo usernames that must never be deleted from the UI */
const DEMO_USERNAMES = ['teacher1', 'teacher2', 'student1', 'student2', 'student3', 'student4'];

let grades     = [];  /* local cache — synced from DB via Grades.php     */
let attendance = [];  /* local cache — synced from DB via Attendance.php  */

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

$('#btn-tlogin').click(() => loginAjax($('#t-user').val(), $('#t-pw').val(), 'teacher'));
$('#btn-slogin').click(() => loginAjax($('#s-user').val(), $('#s-pw').val(), 'student'));
$('#form-teacher').on('submit', () => loginAjax($('#t-user').val(), $('#t-pw').val(), 'teacher'));
$('#form-student').on('submit', () => loginAjax($('#s-user').val(), $('#s-pw').val(), 'student'));

function loginAjax(username, password, role) {
    $.ajax({
        url: 'Users.php',
        type: 'POST',
        dataType: 'json',
        data: { action: 'login', username, password, role },
        success: function (res) {
            if (!res.success) {
                $('#login-err').text(res.message || 'Invalid credentials').fadeIn();
                return;
            }

            currentUser = {
                username,
                role,
                display_name: res.display_name || username,
                isTeacher: () => role === 'teacher',
                isStudent: () => role === 'student'
            };

            $('#login-screen').removeClass('active');
            $('#app-screen').addClass('active');
            $('#sb-role').text(role);

            if (role === 'teacher') {
                $('.teacher-only').show();
                const name = teacherAccountMap[username] || res.display_name || username;
                $('#sb-name').text(name);
                $('#sb-av').text(name.charAt(0));
            } else {
                $('.teacher-only').hide();
                const name = studentAccountMap[username] || res.display_name || username;
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
            showPage(role === 'teacher' ? 'students' : 'grades');
        },
        error: function (xhr) {
            console.error('Login failed:', xhr.status, xhr.responseText);
            $('#login-err').text('Server error (' + xhr.status + '). Check console.').fadeIn();
        }
    });
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
        students   = students.filter(s => s.id !== id);
        renderStudents();
        renderGrades();
        renderAttendance();
        renderSections();
        toast('Student deleted', 'bad');
    });
}

$('#btn-add-student').click(() => openStudentModal());
$('#save-student').click(saveStudent);
$(document).on('click', '.edit-student',   function () { openStudentModal($(this).data('id')); });
$(document).on('click', '.delete-student', function () { deleteStudent($(this).data('id')); });

/* ================================================================
   11. GRADES CRUD  (DB-backed via Grades.php)
================================================================ */

/* ---- BUILD SORT PARAMS from sortState ---- */
function gradesSortParams() {
    const dir = sortState.grades;
    if (!dir) return {};
    return { orderBy: 'student', orderDir: dir === 'asc' ? 'ASC' : 'DESC' };
}

/* ---- RENDER / FETCH ---- */
function renderGrades() {
    const isT = currentUser && currentUser.isTeacher();

    const payload = Object.assign({
        action  : 'get_all',
        search  : ($('#search-grades').val()          || '').trim(),
        section : ($('#filter-section-grades').val()  || ''),
        subject : ($('#filter-subject-grades').val()  || ''),
        quarter : ($('#filter-period-grades').val()   || ''),
    }, gradesSortParams());

    $.post('Grades.php', payload)
        .done(res => {
            if (!res.success) { toast(res.message || 'Failed to load grades.', 'bad'); return; }

            grades = res.data.map(r =>
                new Grade(r.id, r.student, r.subject, r.quarter, parseFloat(r.grade))
            );

            if (!res.data.length) {
                $('#grades-tbody').html(`<tr><td colspan="6">
                    <div class="empty"><div class="empty-val">-</div><p>No grades found.</p></div>
                </td></tr>`);
            } else {
                $('#grades-tbody').html(res.data.map(g => {
                    const pass = parseFloat(g.grade) >= 75;
                    return `<tr>
                        ${isT ? `<td class="col-student">${esc(g.student)}</td>` : ''}
                        <td>${esc(g.subject)}</td>
                        <td><span class="badge b-blue">${esc(g.quarter)}</span></td>
                        <td><b>${g.grade}</b></td>
                        <td><span class="badge ${pass ? 'b-ok' : 'b-err'}">${esc(g.remarks)}</span></td>
                        ${isT ? `<td class="col-actions">
                            <button type="button" class="btn-sm btn-sm-edit edit-grade" data-id="${g.id}">Edit</button>
                            <button type="button" class="btn-sm btn-sm-delete delete-grade" data-id="${g.id}">Delete</button>
                        </td>` : ''}
                    </tr>`;
                }).join(''));
            }

            $('.col-student, .col-actions').toggle(!!isT);
        })
        .fail(() => toast('Failed to load grades.', 'bad'));
}

$('#search-grades, #filter-section-grades, #filter-subject-grades, #filter-period-grades')
    .on('input change', renderGrades);

/* ---- OPEN MODAL ---- */
function openGradeModal(id = null) {
    const opts = students.map(s =>
        `<option value="${esc(s.getFullName())}">${esc(s.getFullName())}</option>`
    ).join('');
    $('#g-student').html('<option value="">- select -</option>' + opts);

    if (id) {
        $.post('Grades.php', { action: 'get_all' })
            .done(res => {
                const g = res.success ? res.data.find(x => x.id == id) : null;
                if (g) {
                    $('#g-id').val(g.id);
                    $('#g-student').val(g.student);
                    $('#g-subject').val(g.subject);
                    $('#g-quarter').val(g.quarter);
                    $('#g-grade').val(g.grade);
                    $('#gmo-title').text('Edit Grade');
                }
                $('.field-error').text('');
                $('#grade-modal').fadeIn();
            })
            .fail(() => toast('Could not load grade data.', 'bad'));
    } else {
        $('#g-id, #g-grade').val('');
        $('#g-student, #g-subject').val('');
        $('#g-quarter').val('Q1');
        $('#gmo-title').text('Record Grade');
        $('.field-error').text('');
        $('#grade-modal').fadeIn();
    }
}

/* ---- SAVE ---- */
function saveGrade() {
    const id      = $('#g-id').val();
    const student = $('#g-student').val();
    const subject = $('#g-subject').val();
    const quarter = $('#g-quarter').val();
    const grade   = $('#g-grade').val();
    let ok = true;

    $('#fe-g-student, #fe-g-subject, #fe-g-grade').text('');
    if (!student)                                               { $('#fe-g-student').text('Student required.'); ok = false; }
    if (!subject)                                               { $('#fe-g-subject').text('Subject required.'); ok = false; }
    if (grade === '' || isNaN(grade) || +grade < 0 || +grade > 100) { $('#fe-g-grade').text('Enter 0-100.');   ok = false; }
    if (!ok) return;

    $.post('Grades.php', { action: 'save', id: id || 0, student, subject, quarter, grade })
        .done(res => {
            if (!res.success) { alert(res.message); return; }
            toast(res.message);
            $('#grade-modal').fadeOut();
            renderGrades();
        })
        .fail(() => toast('Server error.', 'bad'));
}

/* ---- DELETE ---- */
function deleteGrade(id) {
    showConfirm('Delete this grade record?', () => {
        $.post('Grades.php', { action: 'delete', id })
            .done(res => {
                if (!res.success) { alert(res.message); return; }
                toast('Grade deleted.', 'bad');
                renderGrades();
            })
            .fail(() => toast('Server error.', 'bad'));
    });
}

$('#btn-add-grade').click(() => openGradeModal());
$('#save-grade').click(saveGrade);
$(document).on('click', '.edit-grade',   function () { openGradeModal($(this).data('id')); });
$(document).on('click', '.delete-grade', function () { deleteGrade($(this).data('id')); });

/* ================================================================
   12. ATTENDANCE CRUD  (DB-backed via Attendance.php)
================================================================ */

/* ---- BUILD SORT PARAMS ---- */
function attendanceSortParams() {
    const dir = sortState.attendance;
    if (!dir) return {};
    return { orderBy: 'student', orderDir: dir === 'asc' ? 'ASC' : 'DESC' };
}

/* ---- RENDER / FETCH ---- */
function renderAttendance() {
    const isT = currentUser && currentUser.isTeacher();

    const payload = Object.assign({
        action  : 'get_all',
        search  : ($('#search-attendance').val()          || '').trim(),
        section : ($('#filter-section-attendance').val()  || ''),
        status  : ($('#filter-status-attendance').val()   || ''),
    }, attendanceSortParams());

    $.post('Attendance.php', payload)
        .done(res => {
            if (!res.success) { toast(res.message || 'Failed to load attendance.', 'bad'); return; }

            /* Keep local cache in sync for Reports */
            attendance = res.data.map(r =>
                new Attendance(r.id, r.student, r.date, r.status, r.section)
            );

            const statusClass = { Present: 'b-ok', Absent: 'b-err', Late: 'b-warn' };

            if (!res.data.length) {
                $('#attendance-tbody').html(`<tr><td colspan="5">
                    <div class="empty"><div class="empty-val">-</div><p>No attendance records found.</p></div>
                </td></tr>`);
            } else {
                $('#attendance-tbody').html(res.data.map(a => `
                    <tr>
                        ${isT ? `<td class="col-student">${esc(a.student)}</td>` : ''}
                        <td>${esc(a.date)}</td>
                        <td><span class="badge ${statusClass[a.status] || 'b-gray'}">${esc(a.status)}</span></td>
                        <td>${esc(a.section || '-')}</td>
                        ${isT ? `<td class="col-actions">
                            <button type="button" class="btn-sm btn-sm-edit edit-att" data-id="${a.id}">Edit</button>
                            <button type="button" class="btn-sm btn-sm-delete delete-att" data-id="${a.id}">Delete</button>
                        </td>` : ''}
                    </tr>`).join(''));
            }

            $('.col-student, .col-actions').toggle(!!isT);
        })
        .fail(() => toast('Failed to load attendance.', 'bad'));
}

/* Re-fetch whenever search/filter inputs change */
$('#search-attendance, #filter-section-attendance, #filter-status-attendance')
    .on('input change', renderAttendance);

/* ---- OPEN MODAL ---- */
function openAttendanceModal(id = null) {
    const opts = students.map(s =>
        `<option value="${esc(s.getFullName())}">${esc(s.getFullName())}</option>`
    ).join('');
    $('#at-student').html('<option value="">- select -</option>' + opts);

    if (id) {
        /* Fetch the record from DB for pre-fill */
        $.post('Attendance.php', { action: 'get_all' })
            .done(res => {
                const a = res.success ? res.data.find(x => x.id == id) : null;
                if (a) {
                    $('#at-id').val(a.id);
                    $('#at-student').val(a.student);
                    $('#at-date').val(a.date);
                    $('#at-status').val(a.status);
                    $('#atmo-title').text('Edit Attendance');
                }
                $('.field-error').text('');
                $('#att-modal').fadeIn();
            })
            .fail(() => toast('Could not load attendance data.', 'bad'));
    } else {
        $('#at-id').val('');
        $('#at-student').val('');
        $('#at-date').val(new Date().toISOString().split('T')[0]);
        $('#at-status').val('Present');
        $('#atmo-title').text('Log Attendance');
        $('.field-error').text('');
        $('#att-modal').fadeIn();
    }
}

/* ---- SAVE (create or update via DB) ---- */
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

    /* Derive section from the students cache */
    const section = students.find(s => s.getFullName() === student)?.section || '';

    $.post('Attendance.php', {
        action: 'save',
        id     : id || 0,
        student,
        date,
        status,
        section,
    })
    .done(res => {
        if (!res.success) { alert(res.message); return; }
        toast(res.message);
        $('#att-modal').fadeOut();
        renderAttendance();
    })
    .fail(() => toast('Server error.', 'bad'));
}

/* ---- DELETE (via DB) ---- */
function deleteAttendance(id) {
    showConfirm('Delete this attendance record?', () => {
        $.post('Attendance.php', { action: 'delete', id })
            .done(res => {
                if (!res.success) { alert(res.message); return; }
                toast('Attendance deleted.', 'bad');
                renderAttendance();
            })
            .fail(() => toast('Server error.', 'bad'));
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

    function buildReport() {
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
    }

    /* Fetch both grades and attendance fresh from DB before building report */
    const fetchGrades = $.post('Grades.php', { action: 'get_all' })
        .done(res => {
            if (res.success) {
                grades = res.data.map(r =>
                    new Grade(r.id, r.student, r.subject, r.quarter, parseFloat(r.grade))
                );
            }
        });

    const fetchAttendance = $.post('Attendance.php', { action: 'get_all' })
        .done(res => {
            if (res.success) {
                attendance = res.data.map(r =>
                    new Attendance(r.id, r.student, r.date, r.status, r.section)
                );
            }
        });

    $.when(fetchGrades, fetchAttendance).always(buildReport);
});

/* ================================================================
   15. USERS CRUD
================================================================ */

/* ---- LOAD USERS ---- */
function renderUsers() {
    $.post('Users.php', { action: 'get_all' })
        .done(res => {
            if (!res.success || !res.data.length) {
                $('#users-tbody').html(`
                    <tr><td colspan="4">
                        <div class="empty"><div class="empty-val">-</div>
                        <p>No users found.</p></div>
                    </td></tr>`);
                return;
            }

            $('#users-tbody').html(res.data.map(u => `
                <tr>
                    <td>${esc(u.username)}</td>
                    <td>${esc(u.display_name)}</td>
                    <td>${esc(u.role)}</td>
                    <td>
                        <button class="btn-sm btn-sm-edit" onclick="editUser(${u.id})">Edit</button>
                        ${
                            DEMO_USERNAMES.includes(u.username)
                            ? `<button class="btn-sm btn-sm-delete" disabled title="Demo account">Delete</button>`
                            : `<button class="btn-sm btn-sm-delete" onclick="deleteUser(${u.id})">Delete</button>`
                        }
                    </td>
                </tr>
            `).join(''));
        })
        .fail(() => toast('Failed to load users.', 'bad'));
}

/* ---- OPEN MODAL ---- */
function openUserModal(user = null) {
    $('#user-index').val(user ? user.id : '');
    $('#user-username').val(user ? user.username : '');
    $('#user-password').val('');
    $('#user-displayname').val(user ? user.display_name : '');
    $('#user-role').val(user ? user.role : 'teacher');

    $('#user-modal-title').text(user ? 'Edit User' : 'Add User');
    $('#user-modal').fadeIn();
}

/* ---- EDIT ---- */
function editUser(id) {
    $.post('Users.php', { action: 'get_all' })
        .done(res => {
            const user = res.data.find(u => u.id == id);
            if (user) openUserModal(user);
        });
}

/* ---- SAVE ---- */
function saveUser() {
    const id       = $('#user-index').val();
    const username = $('#user-username').val().trim();
    const password = $('#user-password').val().trim();
    const role     = $('#user-role').val();
    const display  = $('#user-displayname').val().trim();

    if (!username || !display) {
        alert('Username and display name are required.');
        return;
    }

    if (!id && !password) {
        alert('Password is required for new users.');
        return;
    }

    $.post('Users.php', {
        action: 'save',
        id: id || 0,
        username,
        password,
        role,
        display
    })
    .done(res => {
        if (!res.success) {
            alert(res.message);
            return;
        }

        toast(res.message);
        $('#user-modal').fadeOut();
        renderUsers();
    })
    .fail(() => toast('Server error.', 'bad'));
}

/* ---- DELETE ---- */
function deleteUser(id) {
    showConfirm('Delete this user?', () => {
        $.post('Users.php', { action: 'delete', id })
            .done(res => {
                if (!res.success) {
                    alert(res.message);
                    return;
                }

                toast('User deleted.', 'bad');
                renderUsers();
            })
            .fail(() => toast('Server error.', 'bad'));
    });
}

/* ---- BUTTON EVENTS ---- */
$('#btn-add-user').click(() => openUserModal());
$('#save-user-btn').click(saveUser);

/* ================================================================
   16. CLEAR DATA
================================================================ */
$(document).on('click', '#btn-clear-sidebar', function () {
    showConfirm('This will permanently delete all students, grades, attendance, and sections. Continue?', () => {
        $.post('Clear.php', { action: 'clear_all' })
            .done(res => {
                if (!res.success) { toast(res.message || 'Clear failed.', 'bad'); return; }
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
            })
            .fail(() => toast('Server error during clear.', 'bad'));
    });
});

/* ================================================================
   17. LOGOUT
================================================================ */
$('#btn-sidebar-logout').click(() => {
    $.post('Users.php', { action: 'logout' }).always(() => {
        currentUser = null;
        $('#app-screen').removeClass('active');
        $('#login-screen').addClass('active');
        $('#t-pw, #t-user, #s-pw, #s-user').val('');
        $('#login-err').hide();
        toast('Signed out successfully.', 'inf');
    });
});