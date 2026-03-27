// Represents a logged-in user (teacher or student)
class User {
  #password; // Hidden password — cannot be accessed directly from outside

  constructor(id, username, password, name, role, email) {
    this.id       = id;
    this.username = username;
    this.#password = password;
    this.name     = name;
    this.role     = role;
    this.email    = email;
  }

  // Checks if the given password matches the user's password
  checkPassword(pw) {
    return this.#password === pw;
  }

  // Returns the password for storage purposes only
  get storedPassword() {
    return this.#password;
  }

  // Converts the user object to a plain format for saving
  toJSON() {
    return { id: this.id, username: this.username, password: this.#password, name: this.name, role: this.role, email: this.email };
  }
}