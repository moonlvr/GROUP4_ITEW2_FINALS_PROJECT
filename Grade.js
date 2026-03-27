// Stores a student's grade for a specific subject and quarter
class Grade {
  constructor(id, studentId, subject, period, grade) {
    this.id        = id;
    this.studentId = studentId;
    this.subject   = subject;
    this.period    = period;
    this.grade     = grade;
  }

  // Converts a numeric grade into a descriptive rating (e.g., Outstanding, Passed)
  getRemarks() {
    const g = parseFloat(this.grade);
    if (g >= 90) return 'Outstanding';
    if (g >= 85) return 'Very Good';
    if (g >= 80) return 'Good';
    if (g >= 75) return 'Passed';
    return 'Failed';
  }
}