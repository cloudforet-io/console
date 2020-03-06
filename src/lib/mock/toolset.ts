type methods = 'POST'|'GET'|'PUT'|'DELETE';
export class MockData {
    constructor(public path: string|RegExp, public data:any = {}, public status: number = 200, public method:methods = 'POST') { }

    get isRefExp() {
        return typeof this.path === typeof RegExp;
    }

    get response() {
        return [this.status, this.data];
    }
}
