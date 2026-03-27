// Base class that holds basic personal information
class Person {
  constructor(name, contact, address) {
    this.name    = name;
    this.contact = contact;
    this.address = address;
  }

  // Returns a basic summary of the person's info
  getInfo() {
    return `Name: ${this.name} | Contact: ${this.contact}`;
  }
}