(function checkStorage() {
  // Stops the app if the browser doesn't support localStorage
  if (typeof Storage === 'undefined') {
    document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif;text-align:center"><h2>Browser Not Supported</h2><p>This application requires localStorage support. Please use a modern browser.</p></div>';
    throw new Error('localStorage not supported');
  }
})();

// Main class that controls the entire app — login, navigation, and all pages
class App {
  #currentUser = null; // Stores the currently logged-in user
  #confirmCb   = null; // Stores the callback for the confirm/delete dialog

  constructor() {
    try {
      DataSeeder.seed();
    } catch (err) {
      console.error('DataSeeder error:', err.message);
    }

    $(document).ready(() => {
      this.#bindLogin();
      this.#bindNav();
      this.#bindModals();
      this.#bindTopbar();
      this.#bindActions();

      // Restores the previous session if the user didn't log out
      const saved = Store.getObj('session', null);
      if (saved) {
        this.#currentUser = saved;
        this.#showApp();
      }
    });
  }

  // ---- LOGIN ----

  // Sets up the login form — handles role tab switching and sign-in button clicks
  #bindLogin() {
    $('.rtab').on('click', function () {
      $('.rtab').removeClass('active');
      $(this).addClass('active');
      const tab = $(this).data('tab');
      $('.lform').removeClass('active');
      $(`#form-${tab}`).addClass('active');
      $('#login-err').slideUp(150);
    });

    $('#btn-tlogin').on('click', () => this.#doLogin('teacher'));
    $('#btn-slogin').on('click', () => this.#doLogin('student'));
    $('#t-pw, #t-user').on('keypress', e => { if (e.key === 'Enter') this.#doLogin('teacher'); });
    $('#s-pw, #s-user').on('keypress', e => { if (e.key === 'Enter') this.#doLogin('student'); });
  }

  // Checks the entered credentials against stored users and logs them in
  #doLogin(role) {
    const isT = role === 'teacher';
    const username = isT ? $('#t-user').val().trim() : $('#s-user').val().trim();
    const password = isT ? $('#t-pw').val().trim()   : $('#s-pw').val().trim();
    $('#login-err').hide();

    try {
      if (!username || !password) {
        throw new ValidationError('Please enter both username and password.');
      }

      const users = Store.get('users');
      const userData = users.find(u => u.username === username && u.password === password && u.role === role);

      if (!userData) {
        throw new ValidationError('Incorrect username, password, or role.');
      }

      this.#currentUser = userData;
      Store.setObj('session', userData);
      this.#showApp();

    } catch (err) {
      if (err instanceof ValidationError) {
        $('#login-err').text(err.message).slideDown(200);
      }
    }
  }

  // Hides the login screen and shows the main app after a successful login
  #showApp() {
    $('#login-screen').removeClass('active');
    $('#app-screen').show();
    const u = this.#currentUser;
    $('#sb-av').text(u.name.charAt(0));
    $('#sb-name').text(u.name);
    $('#sb-role').text(u.role);

    // Shows teacher-only menu items; hides them for students
    if (u.role === 'teacher') {
      $('.teacher-only').slideDown(200);
    } else {
      $('.teacher-only').hide();
    }
    this.#navigateTo(u.role === 'teacher' ? 'students' : 'grades');
  }

  // ---- NAV ----

  // Sets up sidebar navigation so clicking a link opens the correct page
  #bindNav() {
    $(document).on('click', '.nav-link', e => {
      e.preventDefault();
      const page = $(e.currentTarget).data('page');
      if (!page) return;
      this.#navigateTo(page);
      if (window.innerWidth <= 820) {
        $('#sidebar').removeClass('open');
        $('#mob-cover').removeClass('show');
      }
    });
  }

  // Switches to the selected page and renders its content
  #navigateTo(page) {
    // Redirects students away from teacher-only pages
    const teacherOnly = ['students','sections','reports','settings'];
    if (teacherOnly.includes(page) && this.#currentUser.role !== 'teacher') {
      page = 'grades';
    }

    $('.nav-link').removeClass('active');
    $(`.nav-link[data-page="${page}"]`).addClass('active');
    $('.page').removeClass('active');
    $(`#page-${page}`).addClass('active');

    const titles = {
      students:'Students', grades:'Grades',
      attendance:'Attendance', sections:'Sections',
      reports:'Reports', settings:'Settings'
    };
    $('#topbar-title').text(titles[page] || page);

    const map = {
      students:   () => this.#renderStudents(),
      grades:     () => this.#renderGrades(),
      attendance: () => this.#renderAttendance(),
      sections:   () => this.#renderSections(),
      reports:    () => this.#setupReports(),
      settings:   () => this.#renderSettings(),
    };
    if (map[page]) map[page]();
  }

  // ---- TOPBAR ----

  // Sets up the hamburger menu toggle and the sign-out button
  #bindTopbar() {
    $('#hbg').on('click', () => {
      $('#sidebar').toggleClass('open');
      $('#mob-cover').toggleClass('show');
    });

    $('#mob-cover').on('click', () => {
      $('#sidebar').removeClass('open');
      $('#mob-cover').removeClass('show');
    });

    // Clears the session and returns the user to the login screen
    $('#btn-sidebar-logout').on('click', () => {
      Store.setObj('session', null);
      this.#currentUser = null;
      $('#app-screen').fadeOut(250, () => {
        $('#app-screen').hide().css('opacity','');
        $('#login-screen').addClass('active');
        $('#t-pw, #t-user, #s-pw, #s-user').val('');
        $('#login-err').hide();
      });
      this.#toast('Signed out successfully.', 'inf');
    });
  }

  // ---- TOAST ----

  // Shows a short pop-up notification at the bottom of the screen
  #toast(msg, type = 'ok') {
    const $t = $(`<div class="toast ${type}">${msg}</div>`);
    $('#toasts').append($t);
    setTimeout(() => $t.fadeOut(300, () => $t.remove()), 3000);
  }

  // ---- CONFIRM ----

  // Opens a confirmation dialog before performing a delete action
  #showConfirm(msg, cb) {
    this.#confirmCb = cb;
    $('#confirm-msg').text(msg);
    $('#confirm-modal').show();
  }

  // ---- MODALS ----

  // Sets up all modal behavior — closing, backdrop click, and save buttons
  #bindModals() {
    $(document).on('click', '.mbox', e => e.stopPropagation());

    $(document).on('click', '.overlay', function (e) {
      if ($(e.target).hasClass('overlay')) $(this).hide();
    });

    $(document).on('click', '.mclose, [data-close]', function (e) {
      e.stopPropagation();
      const target = $(this).data('close');
      if (target) $(`#${target}`).hide();
    });

    $(document).on('click', '#confirm-ok', (e) => {
      e.stopPropagation();
      $('#confirm-modal').hide();
      const cb = this.#confirmCb;
      this.#confirmCb = null;
      if (cb) cb();
    });

    $('#save-student').on('click', () => this.#saveStudent());
    $('#save-grade').on('click',   () => this.#saveGrade());
    $('#save-att').on('click',     () => this.#saveAttendance());
    $('#save-section').on('click', () => this.#saveSection());
  }

  // ===== STUDENTS =====

  // Loads the Students page — sets up filters, search, and the Add Student button
  #renderStudents() {
    this.#populateSectionFilter('#filter-section-students');
    this.#drawStudents();
    $('#btn-add-student').off('click').on('click', () => this.#openStudentModal());
    $('#search-students, #filter-section-students')
      .off('input change').on('input change', () => this.#drawStudents());
  }

  // Filters and displays the list of students in the table
  #drawStudents() {
    const q   = $('#search-students').val().toLowerCase();
    const sec = $('#filter-section-students').val();

    let rows = Store.get('students')
      .filter(s => { const n = (s.fname+' '+s.lname).toLowerCase(); return n.includes(q) || String(s.id).includes(q); })
      .filter(s => !sec || String(s.section) === sec);

    const $tb = $('#students-tbody').empty();
    if (!rows.length) {
      $tb.html(`<tr><td colspan="6"><div class="empty"><div class="empty-val">—</div><p>No students found.</p></div></td></tr>`);
      return;
    }
    rows.forEach(s => {
      $tb.append(`<tr>
        <td><span class="badge b-blue">${s.id}</span></td>
        <td><b>${this.#esc(s.fname+' '+s.lname)}</b></td>
        <td>${this.#esc(this.#secName(s.section))}</td>
        <td>${this.#esc(s.contact)}</td>
        <td class="tda">
          <button class="btn-sm btn-sm-edit"  data-action="edit-student" data-id="${s.id}">Edit</button>
          <button class="btn-sm btn-sm-delete" data-action="del-student"  data-id="${s.id}">Delete</button>
        </td>
      </tr>`);
    });
  }

  // Opens the Add or Edit Student form modal
  #openStudentModal(id = null) {
    const s    = id ? Store.get('students').find(x => x.id == id) : null;
    const secs = Store.get('sections');
    const opts = secs.map(sec => `<option value="${sec.id}" ${s && s.section==sec.id?'selected':''}>${this.#esc(sec.name)}</option>`).join('');
    $('#s-section').html('<option value="">— select —</option>' + opts);

    if (s) {
      $('#s-id').val(s.id); $('#s-fname').val(s.fname); $('#s-lname').val(s.lname);
      $('#s-bdate').val(s.birthday);
      $('#s-contact').val(s.contact); $('#s-address').val(s.address);
      $('#s-section').val(s.section); $('#s-grade').val(s.grade);
    } else {
      $('#s-id,#s-fname,#s-lname,#s-bdate,#s-contact,#s-address').val('');
      $('#s-grade').val('7'); $('#s-section').val('');
    }
    $('.field-error').text('');
    $('#smo-title').text(id ? 'Edit Student' : 'Add Student');
    $('#student-modal').fadeIn(200);
  }

  // Validates and saves the student form — adds new or updates existing record
  #saveStudent() {
    const id      = $('#s-id').val();
    const fname   = $('#s-fname').val().trim();
    const lname   = $('#s-lname').val().trim();
    const section = $('#s-section').val();
    const contact = $('#s-contact').val().trim();
    let ok = true;
    $('#fe-fname,#fe-lname,#fe-section,#fe-contact').text('');

    try {
      if (!fname)   { $('#fe-fname').text('First name required.');   ok = false; }
      if (!lname)   { $('#fe-lname').text('Last name required.');    ok = false; }
      if (!section) { $('#fe-section').text('Section required.');    ok = false; }
      if (!contact) { $('#fe-contact').text('Contact required.');    ok = false; }
      if (!ok) return;

      let list = Store.get('students');
      const obj = {
        fname, lname,
        section: parseInt(section), contact,
        address: $('#s-address').val().trim(),
        birthday: $('#s-bdate').val(),
        grade: $('#s-grade').val(), status: 'active'
      };

      if (id) {
        list = list.map(s => s.id == id ? { ...s, ...obj } : s);

        // Updates the matching user account if the student's name was changed
        const oldStudent  = Store.get('students').find(s => s.id == id);
        const oldFullName = oldStudent ? (oldStudent.fname + ' ' + oldStudent.lname).trim() : '';
        const newFullName = (fname + ' ' + lname).trim();

        if (oldFullName !== newFullName) {
          let users = Store.get('users');
          users = users.map(u => {
            if (u.role === 'student' && u.name === oldFullName) {
              return { ...u, name: newFullName };
            }
            return u;
          });
          Store.set('users', users);

          // Also updates the sidebar name if this student is currently logged in
          if (this.#currentUser.role === 'student' &&
              this.#currentUser.name === oldFullName) {
            this.#currentUser = { ...this.#currentUser, name: newFullName };
            Store.setObj('session', this.#currentUser);
            $('#sb-name').text(newFullName);
            $('#sb-av').text(newFullName.charAt(0));
          }
        }

        this.#toast('Student updated.');
      } else {
        list.push({ id: genId(list), ...obj });
        this.#toast('Student added.');
      }

      Store.set('students', list);
      $('#student-modal').hide();
      this.#drawStudents();

    } catch (err) {
      console.error('saveStudent error:', err);
    }
  }

  // Deletes a student along with all their grades and attendance records
  #deleteStudent(id) {
    this.#showConfirm('Delete this student and all their records?', () => {
      Store.set('students',   Store.get('students').filter(s => s.id != id));
      Store.set('grades',     Store.get('grades').filter(g => g.studentId != id));
      Store.set('attendance', Store.get('attendance').filter(a => a.studentId != id));
      this.#toast('Student deleted.', 'bad');
      this.#drawStudents();
    });
  }

  // ===== GRADES =====

  // Loads the Grades page — sets up subject/section filters and the Add Grade button
  #renderGrades() {
    this.#populateSubjects();
    this.#populateSectionFilter('#filter-section-grades');
    this.#drawGrades();
    $('#btn-add-grade').off('click').on('click', () => this.#openGradeModal());
    $('#search-grades, #filter-section-grades, #filter-subject-grades, #filter-period-grades')
      .off('input change').on('input change', () => this.#drawGrades());
  }

  // Filters and displays grades in the table — students only see their own
  #drawGrades() {
    const q      = $('#search-grades').val().toLowerCase();
    const sec    = $('#filter-section-grades').val();
    const sub    = $('#filter-subject-grades').val();
    const period = $('#filter-period-grades').val();
    const isT    = this.#currentUser.role === 'teacher';
    const studs  = Store.get('students');
    let grades   = Store.get('grades');

    if (!isT) {
      const me = studs.find(s => (s.fname+' '+s.lname).toLowerCase() === this.#currentUser.name.toLowerCase());
      grades = me ? grades.filter(g => g.studentId == me.id) : [];
    }
    grades = grades.filter(g => {
      const s = studs.find(x => x.id == g.studentId);
      const name = s ? (s.fname+' '+s.lname).toLowerCase() : '';
      const inSection = !sec || (s && String(s.section) === sec);
      return name.includes(q) && inSection && (!sub || g.subject === sub) && (!period || g.period === period);
    });

    const $tb = $('#grades-tbody').empty();
    if (!grades.length) {
      $tb.html(`<tr><td colspan="6"><div class="empty"><div class="empty-val">—</div><p>No grades found.</p></div></td></tr>`);
      return;
    }
    grades.forEach(g => {
      const s  = studs.find(x => x.id == g.studentId);
      const go = Object.assign(Object.create(Grade.prototype), g);
      const rem = go.getRemarks();
      const ok  = parseFloat(g.grade) >= 75;
      $tb.append(`<tr>
        <td>${s ? this.#esc(s.fname+' '+s.lname) : '—'}</td>
        <td>${this.#esc(g.subject)}</td>
        <td><span class="badge b-blue">${g.period}</span></td>
        <td><b>${g.grade}</b></td>
        <td><span class="badge ${ok?'b-ok':'b-err'}">${rem}</span></td>
        ${isT ? `<td class="tda">
          <button class="btn-sm btn-sm-edit"  data-action="edit-grade" data-id="${g.id}">Edit</button>
          <button class="btn-sm btn-sm-delete" data-action="del-grade"  data-id="${g.id}">Delete</button>
        </td>` : '<td></td>'}
      </tr>`);
    });
  }

  // Opens the Add or Edit Grade form modal
  #openGradeModal(id = null) {
    const g     = id ? Store.get('grades').find(x => x.id == id) : null;
    const studs = Store.get('students');
    const opts  = studs.map(s => `<option value="${s.id}" ${g&&g.studentId==s.id?'selected':''}>${this.#esc(s.fname+' '+s.lname)}</option>`).join('');
    $('#g-student').html('<option value="">— select —</option>' + opts);
    if (g) {
      $('#g-id').val(g.id); $('#g-student').val(g.studentId);
      $('#g-subject').val(g.subject); $('#g-quarter').val(g.period); $('#g-grade').val(g.grade);
    } else {
      $('#g-id,#g-grade').val(''); $('#g-student,#g-subject').val(''); $('#g-quarter').val('Q1');
    }
    $('.field-error').text('');
    $('#gmo-title').text(id ? 'Edit Grade' : 'Record Grade');
    $('#grade-modal').fadeIn(200);
  }

  // Validates and saves the grade form — adds new or updates existing record
  #saveGrade() {
    const id = $('#g-id').val(), student = $('#g-student').val(), subject = $('#g-subject').val();
    const grade = parseFloat($('#g-grade').val());
    let ok = true;
    $('#fe-g-student,#fe-g-subject,#fe-g-grade').text('');
    if (!student)                            { $('#fe-g-student').text('Student required.'); ok = false; }
    if (!subject)                            { $('#fe-g-subject').text('Subject required.'); ok = false; }
    if (isNaN(grade)||grade<0||grade>100)    { $('#fe-g-grade').text('Enter 0–100.');        ok = false; }
    if (!ok) return;
    let list = Store.get('grades');
    const obj = { studentId: parseInt(student), subject, period: $('#g-quarter').val(), grade };
    if (id) { list = list.map(g => g.id==id ? {...g,...obj} : g); this.#toast('Grade updated.'); }
    else    { list.push({ id: genId(list), ...obj }); this.#toast('Grade recorded.'); }
    Store.set('grades', list);
    $('#grade-modal').hide();
    this.#drawGrades();
  }

  // Deletes a single grade record
  #deleteGrade(id) {
    this.#showConfirm('Delete this grade record?', () => {
      Store.set('grades', Store.get('grades').filter(g => g.id != id));
      this.#toast('Grade deleted.', 'bad');
      this.#drawGrades();
    });
  }

  // ===== ATTENDANCE =====

  // Loads the Attendance page — sets up filters and the Log Attendance button
  #renderAttendance() {
    this.#drawAttendance();
    this.#populateSectionFilter('#filter-section-attendance');
    $('#btn-add-attendance').off('click').on('click', () => this.#openAttModal());
    $('#search-attendance, #filter-section-attendance, #filter-status-attendance')
      .off('input change').on('input change', () => this.#drawAttendance());
  }

  // Filters and displays attendance records — sorted by most recent date
  #drawAttendance() {
    const q      = $('#search-attendance').val().toLowerCase();
    const sec    = $('#filter-section-attendance').val();
    const status = $('#filter-status-attendance').val();
    const isT    = this.#currentUser.role === 'teacher';
    const studs  = Store.get('students');
    let recs     = Store.get('attendance');

    // Students only see their own attendance records
    if (!isT) {
      const me = studs.find(s => (s.fname+' '+s.lname).toLowerCase() === this.#currentUser.name.toLowerCase());
      recs = me ? recs.filter(a => a.studentId == me.id) : [];
    }
    recs = recs.filter(a => {
      const s = studs.find(x => x.id == a.studentId);
      const name      = s ? (s.fname+' '+s.lname).toLowerCase() : '';
      const inSection = !sec || (s && String(s.section) === sec);
      return name.includes(q) && inSection && (!status || a.status === status);
    }).sort((a,b) => b.date.localeCompare(a.date));

    const map = { Present:'b-ok', Absent:'b-err', Late:'b-warn' };
    const $tb = $('#attendance-tbody').empty();
    if (!recs.length) {
      $tb.html(`<tr><td colspan="6"><div class="empty"><div class="empty-val">—</div><p>No attendance records found.</p></div></td></tr>`);
      return;
    }
    recs.forEach(a => {
      const s = studs.find(x => x.id == a.studentId);
      $tb.append(`<tr>
        <td>${s ? this.#esc(s.fname+' '+s.lname) : '—'}</td>
        <td>${a.date}</td>
        <td><span class="badge ${map[a.status]||'b-gray'}">${a.status}</span></td>
        <td>${s ? this.#esc(this.#secName(s.section)) : '—'}</td>
        <td>${this.#esc(a.remarks||'')}</td>
        ${isT ? `<td class="tda">
          <button class="btn-sm btn-sm-edit"  data-action="edit-att" data-id="${a.id}">Edit</button>
          <button class="btn-sm btn-sm-delete" data-action="del-att"  data-id="${a.id}">Delete</button>
        </td>` : '<td></td>'}
      </tr>`);
    });
  }

  // Opens the Log or Edit Attendance form modal — defaults date to today
  #openAttModal(id = null) {
    const a     = id ? Store.get('attendance').find(x => x.id == id) : null;
    const studs = Store.get('students');
    const opts  = studs.map(s => `<option value="${s.id}" ${a&&a.studentId==s.id?'selected':''}>${this.#esc(s.fname+' '+s.lname)}</option>`).join('');
    $('#at-student').html('<option value="">— select —</option>' + opts);
    const today = new Date().toISOString().split('T')[0];
    if (a) {
      $('#at-id').val(a.id); $('#at-student').val(a.studentId);
      $('#at-date').val(a.date); $('#at-status').val(a.status); $('#at-remarks').val(a.remarks||'');
    } else {
      $('#at-id,#at-remarks').val(''); $('#at-student').val('');
      $('#at-date').val(today); $('#at-status').val('Present');
    }
    $('.field-error').text('');
    $('#atmo-title').text(id ? 'Edit Attendance' : 'Log Attendance');
    $('#att-modal').fadeIn(200);
  }

  // Validates and saves the attendance form — adds new or updates existing record
  #saveAttendance() {
    const id = $('#at-id').val(), student = $('#at-student').val(), date = $('#at-date').val();
    let ok = true;
    $('#fe-at-student,#fe-at-date').text('');
    if (!student) { $('#fe-at-student').text('Student required.'); ok = false; }
    if (!date)    { $('#fe-at-date').text('Date required.');       ok = false; }
    if (!ok) return;
    let list = Store.get('attendance');
    const obj = { studentId: parseInt(student), date, status: $('#at-status').val(), remarks: $('#at-remarks').val().trim() };
    if (id) { list = list.map(a => a.id==id ? {...a,...obj} : a); this.#toast('Attendance updated.'); }
    else    { list.push({ id: genId(list), ...obj }); this.#toast('Attendance recorded.'); }
    Store.set('attendance', list);
    $('#att-modal').hide();
    this.#drawAttendance();
  }

  // Deletes a single attendance record
  #deleteAttendance(id) {
    this.#showConfirm('Delete this attendance record?', () => {
      Store.set('attendance', Store.get('attendance').filter(a => a.id != id));
      this.#toast('Record deleted.', 'bad');
      this.#drawAttendance();
    });
  }

  // ===== SECTIONS =====

  // Loads the Sections page — sets up search and the Add Section button
  #renderSections() {
    this.#drawSections();
    $('#btn-add-section').off('click').on('click', () => this.#openSectionModal());
    $('#search-sections').off('input').on('input', () => this.#drawSections());
  }

  // Displays section cards with student count and assigned teacher
  #drawSections() {
    const q     = $('#search-sections').val().toLowerCase();
    const secs  = Store.get('sections').filter(s => s.name.toLowerCase().includes(q));
    const studs = Store.get('students');
    const users = Store.get('users');
    const $grid = $('#sections-grid').empty();

    if (!secs.length) {
      $grid.html(`<div class="empty" style="grid-column:1/-1"><div class="empty-val">—</div><p>No sections found.</p></div>`);
      return;
    }
    secs.forEach(sec => {
      const count   = studs.filter(s => s.section == sec.id).length;
      const teacher = users.find(u => u.id == sec.teacherId);
      $grid.append(`
        <div class="sec-card">
          <div class="sec-card-name">${this.#esc(sec.name)}</div>
          <div class="sec-card-meta">Grade ${this.#esc(sec.gradeLevel)} &middot; ${this.#esc(sec.room||'—')}</div>
          <div class="sec-stat-num">${count}</div>
          <div class="sec-stat-lbl">Students enrolled</div>
          <div class="sec-teacher">Adviser: ${teacher ? this.#esc(teacher.name) : 'Unassigned'}</div>
          <div class="sec-card-actions">
            <button class="btn-sm btn-sm-edit"  data-action="edit-section" data-id="${sec.id}">Edit</button>
            <button class="btn-sm btn-sm-delete" data-action="del-section"  data-id="${sec.id}">Delete</button>
          </div>
        </div>`);
    });
  }

  // Opens the Add or Edit Section form modal — loads teacher options from stored users
  #openSectionModal(id = null) {
    const sec      = id ? Store.get('sections').find(s => s.id == id) : null;
    const teachers = Store.get('users').filter(u => u.role === 'teacher');
    const tOpts    = teachers.map(t => `<option value="${t.id}" ${sec&&sec.teacherId==t.id?'selected':''}>${this.#esc(t.name)}</option>`).join('');
    $('#sec-teacher').html('<option value="">— select —</option>' + tOpts);
    if (sec) {
      $('#sec-id').val(sec.id); $('#sec-name').val(sec.name);
      $('#sec-grade').val(sec.gradeLevel.replace('Grade ','')); $('#sec-room').val(sec.room||'');
      $('#sec-teacher').val(sec.teacherId);
    } else {
      $('#sec-id,#sec-name,#sec-room').val(''); $('#sec-grade').val('7'); $('#sec-teacher').val('');
    }
    $('.field-error').text('');
    $('#secmo-title').text(id ? 'Edit Section' : 'Add Section');
    $('#section-modal').fadeIn(200);
  }

  // Validates and saves the section form — adds new or updates existing record
  #saveSection() {
    const id = $('#sec-id').val(), name = $('#sec-name').val().trim();
    $('#fe-sec-name').text('');
    if (!name) { $('#fe-sec-name').text('Section name required.'); return; }
    let list = Store.get('sections');
    const obj = { name, gradeLevel: 'Grade ' + $('#sec-grade').val(), teacherId: parseInt($('#sec-teacher').val()) || null, room: $('#sec-room').val().trim() };
    if (id) { list = list.map(s => s.id==id ? {...s,...obj} : s); this.#toast('Section updated.'); }
    else    { list.push({ id: genId(list), ...obj }); this.#toast('Section added.'); }
    Store.set('sections', list);
    $('#section-modal').hide();
    this.#drawSections();
  }

  // Deletes a section — students inside it remain but become unassigned
  #deleteSection(id) {
    this.#showConfirm('Delete this section? Students will remain but become unassigned.', () => {
      Store.set('sections', Store.get('sections').filter(s => s.id != id));
      this.#toast('Section deleted.', 'bad');
      this.#drawSections();
    });
  }

  // ===== REPORTS =====

  // Loads the Reports page — sets up the section filter and Generate button
  #setupReports() {
    this.#populateSectionFilter('#report-section-filter');
    $('#btn-generate-report').off('click').on('click', () => this.#generateReport());
  }

  // Builds and displays a grade or attendance report based on the selected filters
  #generateReport() {
    const secId   = $('#report-section-filter').val();
    const type    = $('#report-type').val();
    const studs   = Store.get('students').filter(s => !secId || String(s.section) === secId);
    const secName = secId ? this.#secName(parseInt(secId)) : 'All Sections';

    const $out = $('#report-output').empty();
    $out.append(`<div class="rcard">
      <div class="rcard-head">
        <div class="rcard-school">School Portal Report<small>${type==='grades'?'Grade Report':'Attendance Report'} &mdash; ${this.#esc(secName)}</small></div>
        <div style="font-size:.7rem;color:var(--muted)">Generated: ${new Date().toLocaleString()}</div>
      </div>
      <div id="rpt-inner"></div>
    </div>`);

    if (type === 'grades') {
      const grades   = Store.get('grades');
      const subjects = ['Mathematics','Science','English','Filipino','Araling Panlipunan'];
      let html = `<div class="tw"><table><thead><tr style="background:var(--green-dark)">
        <th style="color:#fff;background:var(--green-dark)">Student</th>
        <th style="color:#fff;background:var(--green-dark)">Subject</th>
        <th style="color:#fff;background:var(--green-dark)">Q1</th>
        <th style="color:#fff;background:var(--green-dark)">Q2</th>
        <th style="color:#fff;background:var(--green-dark)">Q3</th>
        <th style="color:#fff;background:var(--green-dark)">Q4</th>
        <th style="color:#fff;background:var(--green-dark)">Average</th>
        <th style="color:#fff;background:var(--green-dark)">Status</th>
      </tr></thead><tbody>`;
      studs.forEach(s => {
        subjects.forEach(sub => {
          const vals = ['Q1','Q2','Q3','Q4'].map(p => {
            const g = grades.find(g => g.studentId==s.id && g.subject===sub && g.period===p);
            return g ? parseFloat(g.grade) : null;
          });
          const filled = vals.filter(v => v !== null);
          const avg    = filled.length ? (filled.reduce((a,b) => a+b,0)/filled.length).toFixed(1) : '—';
          const pass   = parseFloat(avg) >= 75;
          html += `<tr><td>${this.#esc(s.fname+' '+s.lname)}</td><td>${sub}</td>
            ${vals.map(v => `<td>${v!==null?v:'—'}</td>`).join('')}
            <td><b>${avg}</b></td>
            <td><span class="badge ${pass?'b-ok':'b-err'}">${pass?'Passed':'Failed'}</span></td></tr>`;
        });
      });
      html += '</tbody></table></div>';
      $('#rpt-inner').html(html);
    } else {
      const atts = Store.get('attendance');
      let html = `<div class="tw"><table><thead><tr style="background:var(--green-dark)">
        <th style="color:#fff;background:var(--green-dark)">Student</th>
        <th style="color:#fff;background:var(--green-dark)">Present</th>
        <th style="color:#fff;background:var(--green-dark)">Absent</th>
        <th style="color:#fff;background:var(--green-dark)">Late</th>
        <th style="color:#fff;background:var(--green-dark)">Total</th>
        <th style="color:#fff;background:var(--green-dark)">Rate</th>
      </tr></thead><tbody>`;
      studs.forEach(s => {
        const recs    = atts.filter(a => a.studentId == s.id);
        const present = recs.filter(a => a.status === 'Present').length;
        const absent  = recs.filter(a => a.status === 'Absent').length;
        const late    = recs.filter(a => a.status === 'Late').length;
        const total   = recs.length;
        const rate    = total ? ((present/total)*100).toFixed(1)+'%' : '—';
        html += `<tr>
          <td>${this.#esc(s.fname+' '+s.lname)}</td>
          <td><span class="badge b-ok">${present}</span></td>
          <td><span class="badge b-err">${absent}</span></td>
          <td><span class="badge b-warn">${late}</span></td>
          <td>${total}</td><td><b>${rate}</b></td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      $('#rpt-inner').html(html);
    }
    $out.hide().fadeIn(400, () => { this.#toast('Report generated.', 'inf'); });
  }

  // ===== SETTINGS =====

  // Loads the Settings page — sets up the Clear All Data button
  #renderSettings() {
    $('#btn-clear-data').off('click').on('click', () => {
      this.#showConfirm('This will permanently delete all students, grades, attendance, and sections. Continue?', () => {
        localStorage.removeItem('students');
        localStorage.removeItem('grades');
        localStorage.removeItem('attendance');
        localStorage.removeItem('sections');
        localStorage.removeItem('seedVersion');
        this.#toast('All data has been cleared.', 'inf');
        this.#renderSettings();
      });
    });
  }

  // ===== HELPERS =====

  // Returns the section name for a given section ID, or 'Unassigned' if not found
  #secName(id) {
    const s = Store.get('sections').find(x => x.id == id);
    return s ? s.name : 'Unassigned';
  }

  // Fills a section dropdown with all available sections
  #populateSectionFilter(sel) {
    const $f = $(sel).empty().append('<option value="">All Sections</option>');
    Store.get('sections').forEach(s => $f.append(`<option value="${s.id}">${this.#esc(s.name)}</option>`));
  }

  // Fills the subject dropdown with the list of available subjects
  #populateSubjects() {
    const subjects = ['Mathematics','Science','English','Filipino','Araling Panlipunan','MAPEH','TLE','Values Education'];
    const $f = $('#filter-subject-grades').empty().append('<option value="">All Subjects</option>');
    subjects.forEach(s => $f.append(`<option value="${s}">${s}</option>`));
  }

  // Prevents XSS by escaping special HTML characters before inserting text into the page
  #esc(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Listens for all Edit and Delete button clicks across the app and routes them to the right method
  #bindActions() {
    $(document).on('click', '[data-action]', (e) => {
      const action = $(e.currentTarget).data('action');
      const id     = $(e.currentTarget).data('id');

      switch (action) {
        case 'edit-student':  
          this.#openStudentModal(id); 
          break;
        case 'del-student':   
          this.#deleteStudent(id);    
          break;
        case 'edit-grade':    
          this.#openGradeModal(id);   
          break;
        case 'del-grade':     
          this.#deleteGrade(id);     
          break;
        case 'edit-att':      
          this.#openAttModal(id);     
          break;
        case 'del-att':       
          this.#deleteAttendance(id); 
          break;
        case 'edit-section':  
          this.#openSectionModal(id); 
          break;
        case 'del-section':   
          this.#deleteSection(id);    
          break;
      }
    });
  }
}

const app = new App();