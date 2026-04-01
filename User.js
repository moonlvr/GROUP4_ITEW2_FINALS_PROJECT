// Represents a logged-in user (teacher or student)
class User {
  constructor(id, username, password, name, role, email) {
    this.id = id; 
    this.username = username; 
    this.password = password;
    this.name = name; 
    this.role = role; 
    this.email = email;
  }
}
