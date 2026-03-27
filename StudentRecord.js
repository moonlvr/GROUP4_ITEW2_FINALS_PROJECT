// Extends Person — stores complete student profile including section and grade
class StudentRecord extends Person {
  constructor(id, fname, lname, section, contact, address, birthday, grade) {
    super(`${fname} ${lname}`.trim(), contact, address);
    this.id       = id;
    this.fname    = fname;
    this.lname    = lname;
    this.section  = section;
    this.birthday = birthday;
    this.grade    = grade;
    this.status   = 'active';
  }

  // Returns a more detailed summary that includes section and grade
  getInfo() {
    return `${super.getInfo()} | Section: ${this.section} | Grade: ${this.grade}`;
  }

  // Returns the student's full name
  get fullName() {
    return `${this.fname} ${this.lname}`.trim();
  }
}
