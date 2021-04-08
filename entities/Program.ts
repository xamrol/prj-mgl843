class Program {
    Id : number;
    Description : string;

    constructor(id: number, description: string) {
        this.Id = id;
        this.Description = description;
    }

    
    // Setters
    public setDescription(desc: string) {
        this.Description = desc;
    }

    // Getters
    public getId() : number {
        return this.Id;
    }

    public getDescription() : string {
        return this.Description;
    }
    
}

interface Grade {
    a: number
    b: string
}