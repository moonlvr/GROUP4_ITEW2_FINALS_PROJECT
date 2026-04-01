// Fills localStorage with sample data the first time the app loads
class DataSeeder {
  static seed() {
    // Version bump forces re-seed when data structure changes
    const SEED_VERSION = 2;
    if (Store.getObj('seedVersion', 0) >= SEED_VERSION) 
      return;
    const users = [
      new User(1,'teacher1','pass123','Maria Santos','teacher','maria@school.edu'),
      new User(2,'teacher2','pass123','Jose Reyes','teacher','jose@school.edu'),
      new User(3,'student1','pass123','Ana Reyes','student','ana@school.edu'),
      new User(4,'student2','pass123','Juan dela Cruz','student','juan@school.edu'),
      new User(5,'student3','pass123','Petra Santos','student','petra@school.edu'),
      new User(6,'student4','pass123','Miguel Lopez','student','miguel@school.edu'),
    ];
    Store.set('users', users);

    const sections = [
      new Section(1,'Grade 7 - Rizal','Grade 7',1,'Room 101'),
      new Section(2,'Grade 8 - Bonifacio','Grade 8',2,'Room 203'),
      new Section(3,'Grade 9 - Luna','Grade 9',1,'Room 105'),
    ];
    Store.set('sections', sections);

    const students = [
      new StudentRecord(1,'Ana','Reyes','Female',1,'09171234567','Manila','2010-03-15','7'),
      new StudentRecord(2,'Juan','dela Cruz','Male',1,'09181234567','Quezon City','2010-06-22','7'),
      new StudentRecord(3,'Petra','Santos','Female',1,'09191234567','Makati','2010-09-10','7'),
      new StudentRecord(4,'Miguel','Lopez','Male',2,'09201234567','Pasig','2009-04-05','8'),
      new StudentRecord(5,'Liza','Garcia','Female',2,'09211234567','Mandaluyong','2009-07-18','8'),
      new StudentRecord(6,'Carlo','Mendoza','Male',3,'09221234567','Taguig','2008-11-30','9'),
      new StudentRecord(7,'Rosa','Flores','Female',3,'09231234567','Paranaque','2008-02-14','9'),
      new StudentRecord(8,'Ben','Torres','Male',2,'09241234567','Caloocan','2009-08-20','8'),
    ];
    Store.set('students', students);

    const subjects = ['Mathematics','Science','English','Filipino','Araling Panlipunan'];
    let grades = [], gid = 1;
    students.forEach(s => {
      subjects.forEach(sub => {
        ['Q1','Q2'].forEach(p => {
          grades.push(new Grade(gid++, s.id, sub, p, Math.floor(Math.random()*26)+72));
        });
      });
    });
    Store.set('grades', grades);

    const today = new Date();
    let attendance = [], aid = 1;
    const pool = ['Present','Present','Present','Present','Absent','Late'];
    students.forEach(s => {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        attendance.push(new Attendance(aid++, s.id, d.toISOString().split('T')[0], pool[Math.floor(Math.random()*pool.length)], ''));
      }
    });
    Store.set('attendance', attendance);
    Store.setObj('seedVersion', SEED_VERSION);
  }
}

function genId(arr) { 
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; 
}
