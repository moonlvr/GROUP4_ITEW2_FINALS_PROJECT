// Represents a class section with an assigned teacher and room
class Section {
  constructor(id, name, gradeLevel, teacherId, room) {
    this.id = id; this.name = name;
    this.gradeLevel = gradeLevel;
    this.teacherId  = teacherId;
    this.room       = room;
  }
}