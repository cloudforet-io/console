interface TreeItemInterface {
    id?: number;
    text: string;
    data?: object;
    children?: TreeItemInterface[];
    state?: object;
    isBatch?: boolean; // does it have child nodes
}

export declare type TreeOptionsType = {
    multiple?: boolean;
    checkbox?: boolean;
    checkOnSelect?: boolean;
    autoCheckChildren?: boolean;
    parentSelect?: boolean;
    keyboardNavigation?: boolean;
    propertyNames?: object;
    deletion?: [boolean, object];
    fetchData?: Function;
    dnd?: object;
    editing?: object;
    nodeIndent?: number;
};

export default class TreeItem implements TreeItemInterface {
    public id?: number;

    public text: string;

    public data?: object;

    public children?: TreeItemInterface[];

    public state?: object;

    constructor(text: string, data?: object, children?: TreeItemInterface[], state?: object, id?: number) {
        this.text = text;
        this.data = data;
        this.children = children;
        this.state = state;
        this.id = id;
    }
}

//
// export class TreeData {
//     public items: any[];
//
//     public options: object;
//
//     constructor(items?: any[], options?: object) {
//         this.items = items || [];
//         this.options = options || {};
//     }
//
//     add(item: any) {
//         this.items.push(item);
//     }
//
//     mergeOptions(options: object) {
//         this.options = {
//             ...this.options,
//             ...options,
//         };
//     }
// }
