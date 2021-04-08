class Employee extends Person {
    // properties
    empID: string;
    designation: string;

    // construtor
    constructor (fName: string, lName: string, eID: string, desig: string) {
        // call the base class constructor
        super(fName, lName);

        // fill the other properties
        this.empID = eID;
        this.designation = desig;
    }

    // method
    getEmployeeFullInfos() : string {
        return this.empID + " - " + this.firstName + " " + this.lastName + " => " + this.designation;
        //return `${this.empID} - ${this.firstName} ${this.lastName} => ${this.designation}`;
    }
}