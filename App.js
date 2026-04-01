class App {
  constructor() {
    this.currentUser = null;
    this.confirmCb   = null;
    DataSeeder.seed();
    this.bindLogin();
    this.bindNav();
    this.bindModals();
    this.bindTopbar();

    const saved = Store.getObj('session', null);
    if (saved) { this.currentUser = saved; this.showApp(); }
  }

  // ---- LOGIN ----
  bindLogin() {
    // Role tabs
    $('.rtab').on('click', function() {
      $('.rtab').removeClass('active');
      $(this).addClass('active');
      const tab = $(this).data('tab');
      $('.lform').removeClass('active');
      $(`#form-${tab}`).addClass('active');
      $('#login-err').hide();
    });

    $('#btn-tlogin').on('click', () => this.doLogin('teacher'));
    $('#btn-slogin').on('click', () => this.doLogin('student'));
    $('#t-pw, #t-user').on('keypress', e => { if (e.key==='Enter') this.doLogin('teacher'); });
    $('#s-pw, #s-user').on('keypress', e => { if (e.key==='Enter') this.doLogin('student'); });
  }

  doLogin(role) {
    const isTeacher = role === 'teacher';
    const username  = isTeacher ? $('#t-user').val().trim() : $('#s-user').val().trim();
    const password  = isTeacher ? $('#t-pw').val().trim()   : $('#s-pw').val().trim();
    $('#login-err').hide();

    if (!username || !password) {
      $('#login-err').text('Please enter both username and password.').show();
      return;
    }
    const users = Store.get('users');
    const user  = users.find(u => u.username === username && u.password === password && u.role === role);
    if (!user) {
      $('#login-err').text('Incorrect username, password, or role.').show();
      return;
    }
    this.currentUser = user;
    Store.setObj('session', user);
    this.showApp();
  }

  showApp() {
    $('#login-screen').removeClass('active');
    $('#app-screen').show();
    const u = this.currentUser;
    $('#sb-av').text(u.name.charAt(0));
    $('#sb-name').text(u.name);
    $('#sb-role').text(u.role);

    if (u.role === 'teacher') {
      $('.teacher-only').show();
    } else {
      $('.teacher-only').hide();
    }

    const firstPage = u.role === 'teacher' ? 'students' : 'grades';
    this.navigateTo(firstPage);
  }

  // ---- NAV ----
  bindNav() {
    $(document).on('click', '.nav-link', e => {
      e.preventDefault();
      const page = $(e.currentTarget).data('page');
      if (!page) return;
      this.navigateTo(page);
      if (window.innerWidth <= 820) { $('#sidebar').removeClass('open'); $('#mob-cover').removeClass('show'); }
    });
  }

  navigateTo(page) {
    const teacherOnly = ['students','sections','users','reports'];
    if (teacherOnly.includes(page) && this.currentUser.role !== 'teacher') {
      page = 'grades';
    }
    this.currentPage = page;
    $('.nav-link').removeClass('active');
    $(`.nav-link[data-page="${page}"]`).addClass('active');
    $('.page').removeClass('active');
    $(`#page-${page}`).addClass('active');
    const titles = { students:'Students', grades:'Grades', attendance:'Attendance', sections:'Sections', users:'User Accounts', reports:'Reports' };
    $('#topbar-title').text(titles[page] || page);

    const map = {
      students:   () => this.renderStudents(),
      grades:     () => this.renderGrades(),
      attendance: () => this.renderAttendance(),
      sections:   () => this.renderSections(),
      users:      () => this.renderUsers(),
      reports:    () => this.setupReports(),
    };
    if (map[page]) map[page]();
  }

  // ---- TOPBAR ----
  bindTopbar() {
    $('#hbg').on('click', () => { $('#sidebar').toggleClass('open'); $('#mob-cover').toggleClass('show'); });
    $('#mob-cover').on('click', () => { $('#sidebar').removeClass('open'); $('#mob-cover').removeClass('show'); });

    // Sign out — sidebar button
    $('#btn-sidebar-logout').on('click', () => {
      Store.setObj('session', null);
      this.currentUser = null;
      $('#app-screen').hide();
      $('#login-screen').addClass('active');
      $('#t-pw, #t-user, #s-pw, #s-user').val('');
      $('#login-err').hide();
      this.toast('Signed out successfully.', 'inf');
    });

    // Clear data — sidebar button
    $('#btn-clear-sidebar').on('click', () => {
      if (window.confirm('This will permanently delete all students, grades, attendance, and sections. Continue?')) {
        Store.clear();
        this.toast('All data has been cleared.', 'inf');
        // Re-navigate to refresh current page
        this.navigateTo(this.currentPage || 'students');
      }
    });
  }

  // ---- TOAST ----
  toast(msg, type = 'ok') {
    const $t = $(`<div class="toast ${type}">${msg}</div>`);
    $('#toasts').append($t);
    setTimeout(() => $t.fadeOut(300, () => $t.remove()), 3000);
  }

  // ---- CONFIRM ----
  showConfirm(msg, cb) {
    this.confirmCb = cb;
    $('#confirm-msg').text(msg);
    $('#confirm-modal').show();
  }

  // ---- MODALS ----
  bindModals() {
    // Prevent clicks inside modal box from closing the overlay
    $(document).on('click', '.mbox', function(e) {
      e.stopPropagation();
    });

    // Click overlay backdrop to close
    $(document).on('click', '.overlay', function(e) {
      if ($(e.target).hasClass('overlay')) $(this).hide();
    });

    // Close buttons
    $(document).on('click', '.mclose, [data-close]', function(e) {
      e.stopPropagation();
      const target = $(this).data('close');
      if (target) $(`#${target}`).hide();
    });

    // Confirm ok
    $(document).on('click', '#confirm-ok', (e) => {
      e.stopPropagation();
      $('#confirm-modal').hide();
      const cb = this.confirmCb;
      this.confirmCb = null;
      if (cb) cb();
    });

    // Save buttons
    $('#save-student').on('click',  () => this.saveStudent());
    $('#save-grade').on('click',    () => this.saveGrade());
    $('#save-att').on('click',      () => this.saveAttendance());
    $('#save-section').on('click',  () => this.saveSection());
    $('#save-user').on('click',     () => this.saveUser());
  }

  // ===== STUDENTS =====
  renderStudents() {
    this.populateSectionFilter('#filter-section-students');
    this.drawStudents();

    $('#btn-add-student').off('click').on('click', () => this.openStudentModal());
    $('#search-students, #filter-section-students, #filter-gender-students')
      .off('input change').on('input change', () => this.drawStudents());
  }

  drawStudents() {
    const q   = $('#search-students').val().toLowerCase();
    const sec = $('#filter-section-students').val();
    const gen = $('#filter-gender-students').val();

    let rows = Store.get('students').filter(s => {
      const name = this.stuName(s).toLowerCase();
      return name.includes(q) || String(s.id).includes(q);
    }).filter(s => !sec || String(s.section) === sec)
      .filter(s => !gen || s.gender === gen);

    const $tb = $('#students-tbody').empty();
    if (!rows.length) {
      $tb.html(`<tr><td colspan="6"><div class="empty"><div class="empty-val">—</div><p>No students found.</p></div></td></tr>`);
      return;
    }
    rows.forEach(s => {
      const secName = this.secName(s.section);
      $tb.append(`<tr>
        <td><span class="badge b-blue">${s.id}</span></td>
        <td><b>${this.esc(this.stuName(s))}</b></td>
        <td>${this.esc(s.gender)}</td>
        <td>${this.esc(secName)}</td>
        <td>${this.esc(s.contact)}</td>
        <td class="tda">
          <button class="btn-sm btn-sm-edit"  data-action="edit-student" data-id="${s.id}">Edit</button>
          <button class="btn-sm btn-sm-delete" data-action="del-student"  data-id="${s.id}">Delete</button>
        </td>
      </tr>`);
    });
  }

  openStudentModal(id = null) {
    const s    = id ? Store.get('students').find(x => x.id == id) : null;
    const secs = Store.get('sections');
    const secOpts = secs.map(sec =>
      `<option value="${sec.id}" ${s && s.section == sec.id ? 'selected':''}>${this.esc(sec.name)}</option>`
    ).join('');
    $('#s-section').html('<option value="">— select —</option>' + secOpts);

    if (s) {
      $('#s-id').val(s.id); $('#s-fname').val(s.fname); $('#s-lname').val(s.lname);
      $('#s-gender').val(s.gender); $('#s-bdate').val(s.birthday);
      $('#s-contact').val(s.contact); $('#s-address').val(s.address);
      $('#s-section').val(s.section); $('#s-grade').val(s.grade);
    } else {
      $('#s-id,#s-fname,#s-lname,#s-bdate,#s-contact,#s-address').val('');
      $('#s-gender').val('Male'); $('#s-grade').val('7'); $('#s-section').val('');
    }
    $('.field-error').text('');
    $('#smo-title').text(id ? 'Edit Student' : 'Add Student');
    $('#student-modal').show();
  }

  saveStudent() {
    const id      = $('#s-id').val();
    const fname   = $('#s-fname').val().trim();
    const lname   = $('#s-lname').val().trim();
    const section = $('#s-section').val();
    const contact = $('#s-contact').val().trim();
    let ok = true;
    $('#fe-fname').text(''); $('#fe-lname').text(''); $('#fe-section').text(''); $('#fe-contact').text('');
    if (!fname)   { $('#fe-fname').text('First name required.');   ok = false; }
    if (!lname)   { $('#fe-lname').text('Last name required.');    ok = false; }
    if (!section) { $('#fe-section').text('Section required.');    ok = false; }
    if (!contact) { $('#fe-contact').text('Contact required.');    ok = false; }
    if (!ok) return;

    let list = Store.get('students');
    const obj = {
      fname, lname, gender: $('#s-gender').val(),
      section: parseInt(section), contact,
      address: $('#s-address').val().trim(),
      birthday: $('#s-bdate').val(),
      grade: $('#s-grade').val(), status: 'active'
    };
    if (id) {
      list = list.map(s => s.id == id ? { ...s, ...obj } : s);
      this.toast('Student updated.');
    } else {
      list.push({ id: genId(list), ...obj });
      this.toast('Student added.');
    }
    Store.set('students', list);
    $('#student-modal').hide();
    this.drawStudents();
  }

  deleteStudent(id) {
    this.showConfirm('Delete this student and all their grade and attendance records?', () => {
      Store.set('students',   Store.get('students').filter(s => s.id != id));
      Store.set('grades',     Store.get('grades').filter(g => g.studentId != id));
      Store.set('attendance', Store.get('attendance').filter(a => a.studentId != id));
      this.toast('Student deleted.', 'bad');
      this.drawStudents();
    });
  }

  // ===== GRADES =====
  renderGrades() {
    this.populateSubjects();
    this.populateStudentFilter('#filter-subject-grades', false);
    this.drawGrades();

    $('#btn-add-grade').off('click').on('click', () => this.openGradeModal());
    $('#search-grades, #filter-subject-grades, #filter-period-grades')
      .off('input change').on('input change', () => this.drawGrades());
  }

  drawGrades() {
    const q      = $('#search-grades').val().toLowerCase();
    const sub    = $('#filter-subject-grades').val();
    const period = $('#filter-period-grades').val();
    const isT    = this.currentUser.role === 'teacher';
    const studs  = Store.get('students');
    let grades   = Store.get('grades');

    if (!isT) {
      const me = studs.find(s => this.stuName(s).toLowerCase() === this.currentUser.name.toLowerCase());
      grades = me ? grades.filter(g => g.studentId == me.id) : [];
    }

    grades = grades.filter(g => {
      const s = studs.find(x => x.id == g.studentId);
      const name = s ? this.stuName(s).toLowerCase() : '';
      return name.includes(q) && (!sub || g.subject === sub) && (!period || g.period === period);
    });

    const $tb = $('#grades-tbody').empty();
    if (!grades.length) {
      $tb.html(`<tr><td colspan="6"><div class="empty"><div class="empty-val">—</div><p>No grades found.</p></div></td></tr>`);
      return;
    }
    grades.forEach(g => {
      const s   = studs.find(x => x.id == g.studentId);
      const go  = Object.assign(Object.create(Grade.prototype), g);
      const rem = go.getRemarks();
      const ok  = parseFloat(g.grade) >= 75;
      $tb.append(`<tr>
        <td>${s ? this.esc(this.stuName(s)) : '—'}</td>
        <td>${this.esc(g.subject)}</td>
        <td><span class="badge b-blue">${g.period}</span></td>
        <td><b>${g.grade}</b></td>
        <td><span class="badge ${ok ? 'b-ok' : 'b-err'}">${rem}</span></td>
        ${isT ? `<td class="tda">
          <button class="btn-sm btn-sm-edit"  data-action="edit-grade" data-id="${g.id}">Edit</button>
          <button class="btn-sm btn-sm-delete" data-action="del-grade"  data-id="${g.id}">Delete</button>
        </td>` : '<td></td>'}
      </tr>`);
    });
  }

  openGradeModal(id = null) {
    const g    = id ? Store.get('grades').find(x => x.id == id) : null;
    const studs = Store.get('students');
    const opts  = studs.map(s =>
      `<option value="${s.id}" ${g && g.studentId == s.id ? 'selected':''}>${this.esc(this.stuName(s))}</option>`
    ).join('');
    $('#g-student').html('<option value="">— select —</option>' + opts);

    if (g) {
      $('#g-id').val(g.id); $('#g-student').val(g.studentId);
      $('#g-subject').val(g.subject); $('#g-quarter').val(g.period);
      $('#g-grade').val(g.grade);
    } else {
      $('#g-id,#g-grade').val('');
      $('#g-student,#g-subject').val('');
      $('#g-quarter').val('Q1');
    }
    $('.field-error').text('');
    $('#gmo-title').text(id ? 'Edit Grade' : 'Record Grade');
    $('#grade-modal').show();
  }

  saveGrade() {
    const id      = $('#g-id').val();
    const student = $('#g-student').val();
    const subject = $('#g-subject').val();
    const grade   = parseFloat($('#g-grade').val());
    let ok = true;
    $('#fe-g-student').text(''); $('#fe-g-subject').text(''); $('#fe-g-grade').text('');
    if (!student)                        { $('#fe-g-student').text('Student required.'); ok = false; }
    if (!subject)                        { $('#fe-g-subject').text('Subject required.'); ok = false; }
    if (isNaN(grade) || grade<0 || grade>100) { $('#fe-g-grade').text('Enter 0–100.');   ok = false; }
    if (!ok) return;

    let list = Store.get('grades');
    const obj = { studentId: parseInt(student), subject, period: $('#g-quarter').val(), grade };
    if (id) {
      list = list.map(g => g.id == id ? { ...g, ...obj } : g);
      this.toast('Grade updated.');
    } else {
      list.push({ id: genId(list), ...obj });
      this.toast('Grade recorded.');
    }
    Store.set('grades', list);
    $('#grade-modal').hide();
    this.drawGrades();
  }

  deleteGrade(id) {
    this.showConfirm('Delete this grade record?', () => {
      Store.set('grades', Store.get('grades').filter(g => g.id != id));
      this.toast('Grade deleted.', 'bad');
      this.drawGrades();
    });
  }

  // ===== ATTENDANCE =====
  renderAttendance() {
    this.drawAttendance();
    $('#btn-add-attendance').off('click').on('click', () => this.openAttModal());
    $('#search-attendance, #filter-status-attendance, #filter-date-attendance')
      .off('input change').on('input change', () => this.drawAttendance());
  }

  drawAttendance() {
    const q      = $('#search-attendance').val().toLowerCase();
    const status = $('#filter-status-attendance').val();
    const date   = $('#filter-date-attendance').val();
    const isT    = this.currentUser.role === 'teacher';
    const studs  = Store.get('students');
    let recs     = Store.get('attendance');

    if (!isT) {
      const me = studs.find(s => this.stuName(s).toLowerCase() === this.currentUser.name.toLowerCase());
      recs = me ? recs.filter(a => a.studentId == me.id) : [];
    }

    recs = recs.filter(a => {
      const s = studs.find(x => x.id == a.studentId);
      const name = s ? this.stuName(s).toLowerCase() : '';
      return name.includes(q) && (!status || a.status === status) && (!date || a.date === date);
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
        <td>${s ? this.esc(this.stuName(s)) : '—'}</td>
        <td>${a.date}</td>
        <td><span class="badge ${map[a.status]||'b-gray'}">${a.status}</span></td>
        <td>${s ? this.esc(this.secName(s.section)) : '—'}</td>
        <td>${this.esc(a.remarks)}</td>
        ${isT ? `<td class="tda">
          <button class="btn-sm btn-sm-edit"  data-action="edit-att" data-id="${a.id}">Edit</button>
          <button class="btn-sm btn-sm-delete" data-action="del-att"  data-id="${a.id}">Delete</button>
        </td>` : '<td></td>'}
      </tr>`);
    });
  }

  openAttModal(id = null) {
    const a     = id ? Store.get('attendance').find(x => x.id == id) : null;
    const studs = Store.get('students');
    const opts  = studs.map(s =>
      `<option value="${s.id}" ${a && a.studentId == s.id ? 'selected':''}>${this.esc(this.stuName(s))}</option>`
    ).join('');
    $('#at-student').html('<option value="">— select —</option>' + opts);
    const today = new Date().toISOString().split('T')[0];

    if (a) {
      $('#at-id').val(a.id); $('#at-student').val(a.studentId);
      $('#at-date').val(a.date); $('#at-status').val(a.status);
      $('#at-remarks').val(a.remarks);
    } else {
      $('#at-id,#at-remarks').val(''); $('#at-student').val('');
      $('#at-date').val(today); $('#at-status').val('Present');
    }
    $('.field-error').text('');
    $('#atmo-title').text(id ? 'Edit Attendance' : 'Log Attendance');
    $('#att-modal').show();
  }

  saveAttendance() {
    const id      = $('#at-id').val();
    const student = $('#at-student').val();
    const date    = $('#at-date').val();
    let ok = true;
    $('#fe-at-student').text(''); $('#fe-at-date').text('');
    if (!student) { $('#fe-at-student').text('Student required.'); ok = false; }
    if (!date)    { $('#fe-at-date').text('Date required.');       ok = false; }
    if (!ok) return;

    let list = Store.get('attendance');
    const obj = { studentId: parseInt(student), date, status: $('#at-status').val(), remarks: $('#at-remarks').val().trim() };
    if (id) {
      list = list.map(a => a.id == id ? { ...a, ...obj } : a);
      this.toast('Attendance updated.');
    } else {
      list.push({ id: genId(list), ...obj });
      this.toast('Attendance recorded.');
    }
    Store.set('attendance', list);
    $('#att-modal').hide();
    this.drawAttendance();
  }

  deleteAttendance(id) {
    this.showConfirm('Delete this attendance record?', () => {
      Store.set('attendance', Store.get('attendance').filter(a => a.id != id));
      this.toast('Record deleted.', 'bad');
      this.drawAttendance();
    });
  }

  // ===== SECTIONS =====
  renderSections() {
    this.drawSections();
    $('#btn-add-section').off('click').on('click', () => this.openSectionModal());
    $('#search-sections').off('input').on('input', () => this.drawSections());
  }

  drawSections() {
    const q       = $('#search-sections').val().toLowerCase();
    const secs    = Store.get('sections').filter(s => s.name.toLowerCase().includes(q));
    const studs   = Store.get('students');
    const users   = Store.get('users');
    const $grid   = $('#sections-grid').empty();

    if (!secs.length) {
      $grid.html(`<div class="empty" style="grid-column:1/-1"><div class="empty-val">—</div><p>No sections found.</p></div>`);
      return;
    }
    secs.forEach(sec => {
      const count   = studs.filter(s => s.section == sec.id).length;
      const teacher = users.find(u => u.id == sec.teacherId);
      $grid.append(`
        <div class="sec-card">
          <div class="sec-card-name">${this.esc(sec.name)}</div>
          <div class="sec-card-meta">Grade ${this.esc(sec.gradeLevel)} &middot; ${this.esc(sec.room)}</div>
          <div class="sec-stat-num">${count}</div>
          <div class="sec-stat-lbl">Students enrolled</div>
          <div class="sec-teacher">Adviser: ${teacher ? this.esc(teacher.name) : 'Unassigned'}</div>
          <div class="sec-card-actions">
            <button class="btn-sm btn-sm-edit"  data-action="edit-section" data-id="${sec.id}">Edit</button>
            <button class="btn-sm btn-sm-delete" data-action="del-section"  data-id="${sec.id}">Delete</button>
          </div>
        </div>`);
    });
  }

  openSectionModal(id = null) {
    const sec = id ? Store.get('sections').find(s => s.id == id) : null;
    const teachers = Store.get('users').filter(u => u.role === 'teacher');
    const tOpts = teachers.map(t =>
      `<option value="${t.id}" ${sec && sec.teacherId == t.id ? 'selected':''}>${this.esc(t.name)}</option>`
    ).join('');
    $('#sec-teacher').html('<option value="">— select —</option>' + tOpts);

    if (sec) {
      $('#sec-id').val(sec.id); $('#sec-name').val(sec.name);
      $('#sec-grade').val(sec.gradeLevel.replace('Grade ','')); $('#sec-room').val(sec.room);
      $('#sec-teacher').val(sec.teacherId);
    } else {
      $('#sec-id,#sec-name,#sec-room').val(''); $('#sec-grade').val('7'); $('#sec-teacher').val('');
    }
    $('.field-error').text('');
    $('#secmo-title').text(id ? 'Edit Section' : 'Add Section');
    $('#section-modal').show();
  }

  saveSection() {
    const id   = $('#sec-id').val();
    const name = $('#sec-name').val().trim();
    $('#fe-sec-name').text('');
    if (!name) { $('#fe-sec-name').text('Section name required.'); return; }

    let list = Store.get('sections');
    const gradeVal = $('#sec-grade').val();
    const obj = {
      name, gradeLevel: 'Grade ' + gradeVal,
      teacherId: parseInt($('#sec-teacher').val()) || null,
      room: $('#sec-room').val().trim()
    };
    if (id) {
      list = list.map(s => s.id == id ? { ...s, ...obj } : s);
      this.toast('Section updated.');
    } else {
      list.push({ id: genId(list), ...obj });
      this.toast('Section added.');
    }
    Store.set('sections', list);
    $('#section-modal').hide();
    this.drawSections();
  }

  deleteSection(id) {
    this.showConfirm('Delete this section? Students will remain but become unassigned.', () => {
      Store.set('sections', Store.get('sections').filter(s => s.id != id));
      this.toast('Section deleted.', 'bad');
      this.drawSections();
    });
  }

  // ===== USERS =====
  renderUsers() {
    const u = this.currentUser;
    $('#ap-av').text(u.name.charAt(0));
    $('#ap-name').text(u.name);
    $('#ap-email').text(u.email || '—');
    $('#ap-role').text(u.role);

    this.drawUsers();
    $('#btn-add-user').off('click').on('click', () => this.openUserModal());
    $('#search-users, #filter-role-users').off('input change').on('input change', () => this.drawUsers());
  }

  drawUsers() {
    const q    = $('#search-users').val().toLowerCase();
    const role = $('#filter-role-users').val();
    const list = Store.get('users').filter(u =>
      (u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)) &&
      (!role || u.role === role)
    );

    const $tb = $('#users-tbody').empty();
    if (!list.length) {
      $tb.html(`<tr><td colspan="5"><div class="empty"><div class="empty-val">—</div><p>No users found.</p></div></td></tr>`);
      return;
    }
    list.forEach(u => {
      const isSelf = u.id === this.currentUser.id;
      $tb.append(`<tr>
        <td><code style="font-family:'DM Mono',monospace;font-size:.76rem;color:var(--green-dark)">${this.esc(u.username)}</code></td>
        <td><b>${this.esc(u.name)}</b></td>
        <td><span class="badge ${u.role==='teacher'?'b-green':'b-gold'}">${u.role}</span></td>
        <td>${this.esc(u.email||'—')}</td>
        <td class="tda">
          <button class="btn-sm btn-sm-edit" data-action="edit-user" data-id="${u.id}">Edit</button>
          ${!isSelf ? `<button class="btn-sm btn-sm-delete" data-action="del-user" data-id="${u.id}">Delete</button>` : ''}
        </td>
      </tr>`);
    });
  }

  openUserModal(id = null) {
    const u = id ? Store.get('users').find(x => x.id == id) : null;
    if (u) {
      $('#u-id').val(u.id); $('#u-name').val(u.name); $('#u-username').val(u.username);
      $('#u-password').val(''); $('#u-role').val(u.role); $('#u-email').val(u.email||'');
      $('#pw-label').text('New Password (leave blank to keep)');
    } else {
      $('#u-id,#u-name,#u-username,#u-password,#u-email').val('');
      $('#u-role').val('teacher'); $('#pw-label').text('Password *');
    }
    $('.field-error').text('');
    $('#umo-title').text(id ? 'Edit User' : 'Add User');
    $('#user-modal').show();
  }

  saveUser() {
    const id       = $('#u-id').val();
    const name     = $('#u-name').val().trim();
    const username = $('#u-username').val().trim();
    const password = $('#u-password').val().trim();
    let ok = true;
    $('#fe-u-name').text(''); $('#fe-u-username').text(''); $('#fe-u-password').text('');
    if (!name)             { $('#fe-u-name').text('Name required.');     ok = false; }
    if (!username)         { $('#fe-u-username').text('Username required.'); ok = false; }
    if (!id && !password)  { $('#fe-u-password').text('Password required.'); ok = false; }
    if (!ok) return;

    let list = Store.get('users');
    const dup = list.find(u => u.username === username && u.id != id);
    if (dup) { $('#fe-u-username').text('Username already taken.'); return; }

    const obj = { name, username, role: $('#u-role').val(), email: $('#u-email').val().trim() };
    if (id) {
      list = list.map(u => u.id != id ? u : { ...u, ...obj, password: password || u.password });
      if (id == this.currentUser.id) {
        this.currentUser = list.find(u => u.id == id);
        Store.setObj('session', this.currentUser);
        $('#sb-name').text(this.currentUser.name);
        $('#sb-av').text(this.currentUser.name.charAt(0));
      }
      this.toast('User updated.');
    } else {
      list.push({ id: genId(list), password, ...obj });
      this.toast('User added.');
    }
    Store.set('users', list);
    $('#user-modal').hide();
    this.drawUsers();
  }

  deleteUser(id) {
    this.showConfirm('Delete this user account?', () => {
      Store.set('users', Store.get('users').filter(u => u.id != id));
      this.toast('User deleted.', 'bad');
      this.drawUsers();
    });
  }

  // ===== REPORTS =====
  setupReports() {
    this.populateSectionFilter('#report-section-filter');
    $('#btn-generate-report').off('click').on('click', () => this.generateReport());
  }

  generateReport() {
    const secId   = $('#report-section-filter').val();
    const type    = $('#report-type').val();
    const studs   = Store.get('students').filter(s => !secId || String(s.section) === secId);
    const secName = secId ? this.secName(parseInt(secId)) : 'All Sections';
    const $out    = $('#report-output').empty();

    $out.append(`<div class="rcard">
      <div class="rcard-head">
        <div class="rcard-school">ScholarTrack Report<small>${type === 'grades' ? 'Grade Report' : 'Attendance Report'} &mdash; ${this.esc(secName)}</small></div>
        <div style="font-size:.7rem;color:var(--muted)">Generated: ${new Date().toLocaleString()}</div>
      </div>
      <div id="rpt-inner"></div>
    </div>`);

    if (type === 'grades') {
      const grades   = Store.get('grades');
      const subjects = ['Mathematics','Science','English','Filipino','Araling Panlipunan'];
      let html = `<div class="tw"><table>
        <thead style=""><tr style="background:var(--green-dark)">
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
            const g = grades.find(g => g.studentId == s.id && g.subject === sub && g.period === p);
            return g ? parseFloat(g.grade) : null;
          });
          const filled = vals.filter(v => v !== null);
          const avg = filled.length ? (filled.reduce((a,b)=>a+b,0)/filled.length).toFixed(1) : '—';
          const pass = parseFloat(avg) >= 75;
          html += `<tr>
            <td>${this.esc(this.stuName(s))}</td><td>${sub}</td>
            ${vals.map(v=>`<td>${v!==null?v:'—'}</td>`).join('')}
            <td><b>${avg}</b></td>
            <td><span class="badge ${pass?'b-ok':'b-err'}">${pass?'Passed':'Failed'}</span></td>
          </tr>`;
        });
      });
      html += '</tbody></table></div>';
      $('#rpt-inner').html(html);
    } else {
      const atts = Store.get('attendance');
      let html = `<div class="tw"><table>
        <thead><tr style="background:var(--green-dark)">
          <th style="color:#fff;background:var(--green-dark)">Student</th>
          <th style="color:#fff;background:var(--green-dark)">Present</th>
          <th style="color:#fff;background:var(--green-dark)">Absent</th>
          <th style="color:#fff;background:var(--green-dark)">Late</th>
          <th style="color:#fff;background:var(--green-dark)">Total Days</th>
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
          <td>${this.esc(this.stuName(s))}</td>
          <td><span class="badge b-ok">${present}</span></td>
          <td><span class="badge b-err">${absent}</span></td>
          <td><span class="badge b-warn">${late}</span></td>
          <td>${total}</td><td><b>${rate}</b></td>
        </tr>`;
      });
      html += '</tbody></table></div>';
      $('#rpt-inner').html(html);
    }
    $out.hide().fadeIn(350);
    this.toast('Report generated.', 'inf');
  }

  // ===== SETTINGS =====
  renderSettings() {
    const keys = ['users','students','sections','grades','attendance'];
    let info = '';
    keys.forEach(k => {
      const arr = Store.get(k);
      info += `${k.padEnd(12)}: ${arr.length} record${arr.length!==1?'s':''}\n`;
    });
    const used = 0;
    info += `\nStorage used: ~${(used/1024).toFixed(1)} KB`;
    $('#storage-panel').text(info);

    $('#btn-clear-data').off('click').on('click', () => {
      this.showConfirm('This will permanently delete ALL data and reload the application. Are you sure?', () => {
        Store.clear(); location.reload();
      });
    });
  }

  // ===== HELPERS =====
  // Safe student name — handles both {fname,lname} and legacy {name}
  stuName(s) {
    if (!s) return '—';
    if (s.fname || s.lname) return ((s.fname || '') + ' ' + (s.lname || '')).trim();
    return s.name || '—';
  }

  secName(id) {
    const s = Store.get('sections').find(x => x.id == id);
    return s ? s.name : 'Unassigned';
  }

  populateSectionFilter(sel) {
    const $f = $(sel).empty().append('<option value="">All Sections</option>');
    Store.get('sections').forEach(s => $f.append(`<option value="${s.id}">${this.esc(s.name)}</option>`));
  }

  populateSubjects() {
    const subjects = ['Mathematics','Science','English','Filipino','Araling Panlipunan','MAPEH','TLE','Values Education'];
    const $f = $('#filter-subject-grades').empty().append('<option value="">All Subjects</option>');
    subjects.forEach(s => $f.append(`<option value="${s}">${s}</option>`));
  }

  populateStudentFilter(sel) {
    const $f = $(sel).empty().append('<option value="">All Students</option>');
    Store.get('students').forEach(s => $f.append(`<option value="${s.id}">${this.esc(this.stuName(s))}</option>`));
  }

  esc(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
}

// ===== EVENT DELEGATION =====
$(document).on('click', '[data-action]', function() {
  const action = $(this).data('action');
  const id     = $(this).data('id');
  switch(action) {
    case 'edit-student':  
      app.openStudentModal(id); 
      break;
    case 'del-student':   
      app.deleteStudent(id);    
      break;
    case 'edit-grade':    
      app.openGradeModal(id);   
      break;
    case 'del-grade':     
      app.deleteGrade(id);      
      break;
    case 'edit-att':      
      app.openAttModal(id);     
      break;
    case 'del-att':       
      app.deleteAttendance(id); 
      break;
    case 'edit-section':  
      app.openSectionModal(id); 
      break;
    case 'del-section':   
      app.deleteSection(id);    
      break;
    case 'edit-user':     
      app.openUserModal(id);    
      break;
    case 'del-user':      
      app.deleteUser(id);       
      reak;
  }
});

const app = new App();
