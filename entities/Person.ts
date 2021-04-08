class Person {
    // properties
    firstName: string;
    lastName: string;

    // construtor
    constructor (fName: string, lName: string) {
        // fill the properties
        this.firstName = fName;
        this.lastName = lName;
    }

    // method
    public getFullName() : string {
        return this.firstName + " " + this.lastName;
    }
}