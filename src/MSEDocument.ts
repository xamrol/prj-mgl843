// MSE types
// These will change if the JSON from the PEG.js grammar changes, but not automatically
// It helps with code completion in VSCode

export class MSEDocument {
    elementNamePrefix: string;
    nodes: Element[];

    // take raw JSON and transform it
    constructor(jsonNodes?: any, elementNamePrefix?: string) {
        this.elementNamePrefix = elementNamePrefix || '';
        this.nodes = new Array<Element>();
        if (jsonNodes) {
            jsonNodes.nodes.forEach(jsonElement => this.nodes.push(new Element(jsonElement, elementNamePrefix)));
        }
    }

    addElement(el:Element) {
        this.nodes.push(el);
    }

    public static readonly OPEN_TOKEN = "(";
    public static readonly CLOSE_TOKEN = ")";
    public toMSE(): string {
        let result: string = MSEDocument.OPEN_TOKEN;
        this.nodes.forEach(node => result += '\n' + node.toMSE());
        result += MSEDocument.CLOSE_TOKEN;
        return result;
    }
}

export class Element {
    elementNamePrefix: string
    name: string
    id?: string
    attrs: Attr[]

    constructor(jsonElement?: any, elementNamePrefix?: string) {
        this.elementNamePrefix = elementNamePrefix;
        this.attrs = new Array<Attr>();
        if (jsonElement) {
            this.name = jsonElement.name;
            this.id = jsonElement.id;    
            jsonElement.attrs.forEach(attr => this.attrs.push(new Attr(attr)));
        }
    }

    addAttr(attr:Attr) {
        this.attrs.push(attr);
    }

    getFirstValueForAttr(attrToFind: string): string {
        let result: Array<Attr> = this.attrs.filter(attr => attr.name == attrToFind);
        const numberFound = result.length;

        if (numberFound == 1) return result[0].vals[0];
        return '';
    }

    public toMSE(): string {
        let result: string = '\t';
        result += MSEDocument.OPEN_TOKEN + this.elementNamePrefix + '.' + this.name + ' ';
        if (this.id) {
            result += MSEDocument.OPEN_TOKEN + 'id: ' + this.id + MSEDocument.CLOSE_TOKEN
        };
        this.attrs.forEach(attr => result += '\n' + attr.toMSE());
        result += MSEDocument.CLOSE_TOKEN;
        return result;
    };
}

export class Attr {
    name: string;
    vals: any[];

    constructor(jsonAttr?: any, name?: string) {
        this.vals = new Array<any>();
        if (jsonAttr) {
            this.name = jsonAttr.name;
            jsonAttr.vals.forEach(val => this.vals.push(val));    
        } else if (name) {
            this.name = name;
        }
    }

    addVal(val:any) {
        this.vals.push(val);
    }

    public toMSE(): string {
        let result: string = '\t\t' + MSEDocument.OPEN_TOKEN;
        result += this.name;
        result += this.valsToMSE();
        result += MSEDocument.CLOSE_TOKEN;
        return result;
    }

    public valsToMSE(): string {
        let result: string = '';
        // parse the vals
        // here it's raw JSON
        let vals = this.vals;
        if (vals.length == 1) {
            if (typeof vals[0] === 'string') result+= ' ' + vals[0]; 
            else {
                const o = this.vals[0]; // object
                result += ' ' + MSEDocument.OPEN_TOKEN;
                for (let [key, value] of Object.entries(o)) {
                    result += key + ': ' + value;
                }
                result += MSEDocument.CLOSE_TOKEN;
            }
        } else if (vals.length > 1) {
            vals.forEach(val => result += ' ' + val);
        } else throw new Error("Unknown value type at Attr name: " + this.name + " with: " + this.vals.length + " values. " + JSON.stringify(this.vals));
            
        return result;
    }
}
