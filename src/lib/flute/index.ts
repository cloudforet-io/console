import { AxiosInstance, AxiosResponse } from 'axios';

export type ApiMethods = 'post' | 'get' | 'delete' | 'put';

abstract class Path {
    abstract path: string;

    protected constructor(public parentPath: string) { }

    getPath() {
        return `${this.parentPath}/${this.path}`;
    }
}

export abstract class Resource extends Path {
    constructor(parentPath: string) {
        super(parentPath);
    }
}

export abstract class ActionAPI<parameter=any, resp=any> extends Path {
    protected method: ApiMethods = 'post';

    protected cloneProperties: string[] = ['apiInstance', 'parentPath', 'apiState', 'transformer']

    public abstract getParameter: () => parameter;


    protected constructor(
        protected apiInstance: AxiosInstance,
        parentPath: string,
        protected apiState: any = {},
        protected transformer: ((any) => any|Promise<any>)|null = null,
    ) {
        super(parentPath);
    }

    debug(...states: string[]) {
        console.debug('*********************');
        console.debug('url : ', this.getPath());
        console.debug('method : ', this.method);
        console.debug('state : ', this.apiState);
        if (states) {
            states.forEach(((key) => {
                console.debug(`state.${key} : ${JSON.stringify(this.apiState[key])}`);
            }));
        }
        console.debug('*********************');
    }

    async execute(instance?: AxiosInstance): Promise<AxiosResponse<resp>> {
        let resp: any;
        const apiInstance = instance || this.apiInstance;
        if (this.method === 'get') {
            resp = await apiInstance[this.method](this.getPath());
        } else {
            // @ts-ignore
            resp = await apiInstance[this.method](this.getPath(), this.getParameter());
        }
        if (this.transformer) {
            resp = await this.transformer(resp);
        }
        return resp;
    }

    setTransformer(func: (any) => any|Promise<any>) {
        this.transformer = func;
        return this.clone();
    }

    clone(): this {
        const args = this.cloneProperties.map(k => this[k]);
        // @ts-ignore
        return new this.constructor(...args);
    }
}

export interface RawParameterActionState<T> {
    parameter: T ;
}
export abstract class RawParameterAction<parameter, resp> extends ActionAPI<parameter, resp> {
    getParameter = () => this.apiState.parameter;

    protected apiState: RawParameterActionState<parameter>;

    constructor(
        apiInstance: AxiosInstance,
        parentPath: string,
        apiState: RawParameterActionState<parameter> = {} as unknown as RawParameterActionState<parameter>,
        transformer: ((any) => any|Promise<any>)|null = null,
    ) {
        super(apiInstance, parentPath, apiState, transformer);
        this.apiState = {
            parameter: {},
            ...apiState,
        };
    }
}

export abstract class SetParameterAction<parameter, resp> extends RawParameterAction<parameter, resp> {
    setParameter(parameter: parameter) {
        this.apiState.parameter = parameter;
        return this.clone();
    }
}
