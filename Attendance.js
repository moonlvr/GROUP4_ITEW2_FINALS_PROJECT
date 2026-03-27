// Stores one attendance entry for a student on a specific date
class Attendance {
  constructor(id, studentId, date, status, remarks) {
    this.id = id; 
    this.studentId = studentId;
    this.date = date; 
    this.status = status; 
    this.remarks = remarks;
  }
}
