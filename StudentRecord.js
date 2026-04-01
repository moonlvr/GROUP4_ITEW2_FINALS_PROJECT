// Extends Person — stores complete student profile including section and grade
class StudentRecord {
  constructor(id, fname, lname, gender, section, contact, address, birthday, grade) {
    this.id = id; 
    this.fname = fname; 
    this.lname = lname;
    this.gender = gender; 
    this.section = section;
    this.contact = contact; 
    this.address = address;
    this.birthday = birthday; 
    this.grade = grade;
    this.status = 'active';
  }
  get fullName() { 
    return this.fname + ' ' + this.lname; 
  }
}
