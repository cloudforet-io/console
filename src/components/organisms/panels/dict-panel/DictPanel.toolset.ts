import { reactive } from '@vue/composition-api';


export const getDictPanelProps = () => ({
    dict: {
        type: Object,
        default: () => ({}),
    },
    /**
     * Show default empty input in edit mode.
     */
    showEmptyInput: {
        type: Boolean,
        default: false,
    },
    fetchApi: {
        type: Function,
        // eslint-disable-next-line no-empty-function
        default: () => {},
    },
    /**
     * edit mode controller. sync prop.
     */
    editMode: {
        type: Boolean,
        default: false,
    },
});

type paramsFormatterType = (data?: any, params?: any) => any;
type callbackType = (res?: any, data?: any, state?: any) => void;

export type fetchApiType = (data?: any) => Promise<any>;

export class ApiHandler {
    public caller: any;

    public url: string;

    public paramsFormatter: paramsFormatterType;

    public state: any;

    public callback: callbackType;

    private _api: fetchApiType;

    /**
     * TODO: change caller to static axios instance
     */

    constructor(
        caller: any,
        url: string,
        paramsFormatter: paramsFormatterType = ((data, state) => ({ ...state, ...data })),
        // eslint-disable-next-line no-empty-function
        callback: callbackType = (() => {}),
        state: any = {},
    ) {
        this.caller = caller;
        this.url = url;
        this.paramsFormatter = paramsFormatter;
        this.callback = callback;
        this.state = state;

        this._api = (data?: any) => new Promise(async (resolve, reject) => {
            try {
                const res = await this.caller(this.url, this.paramsFormatter(data, this.state));
                if (this.callback) this.callback(res, data, this.state);
                resolve(res);
            } catch (e) {
                reject(e);
                /**
                 * TODO: default error case, default success case (notification)
                 */
            }
        });
    }

    get api() {
        return this._api;
    }
}

export const mockApi: fetchApiType = (data: any) => new Promise((resolve) => {
    setTimeout(() => { resolve(data); }, 1000);
});


export interface DictPanelPropsType {
    dict?: object,
    showEmptyInput?: boolean;
    fetchApi?: fetchApiType;
    editMode?: boolean;
}


export class DictPanelState {
    public state: DictPanelPropsType;

    public syncState: DictPanelPropsType;

    static initState: DictPanelPropsType = {
        showEmptyInput: false,
        fetchApi: undefined,
    }

    static initSyncState: DictPanelPropsType = {
        dict: {},
        editMode: false,
    }

    constructor(initData: object = {}, initSyncData: object = {}) {
        this.state = reactive({
            ...DictPanelState.initState,
            ...initData,
        });
        this.syncState = reactive({
            ...DictPanelState.initSyncState,
            ...initSyncData,
        });
    }
}
