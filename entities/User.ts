class User {
    Id : number;
    FirstName: string;
    LastName: string;

    constructor(id: number, firstname: string, lastname: string) {
        this.Id = id;
        this.FirstName = firstname;
        this.LastName = lastname;
    }

    // Setters
    public setUserId(id: number) {
        if(id>=0) {
            this.Id = id;
        }
    }

    public setUserFirstName(fname: string) {
        this.FirstName = fname;
    }

    public setUserLastName(lname: string) {
        this.LastName = lname;
    }


    // Getters
    public getUserId() : number {
        return this.Id;
    }

    public getUserFirstName() : string {
        return this.FirstName;
    }

    public getUserLastName() : string {
        return this.LastName;
    }

    public getUserAllInfos() : string {
        let userInfos = {
            "id" : this.Id.toString(),
            "first_name" : this.FirstName,
            "last_name" : this.LastName
        };

        return JSON.stringify(userInfos);
    }
}