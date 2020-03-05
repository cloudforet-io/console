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
});

// export type fetchApiType = (param?: object) => (dict: object) => Promise<any>;
export type fetchApiType = (dict: object) => Promise<any>;

export const mockApi: fetchApiType = (data: any) => new Promise((resolve) => {
    setTimeout(() => { resolve(data); }, 1000);
});

export interface DictPanelPropsType {
    dict?: object,
    showEmptyInput?: boolean;
    fetchApi?: fetchApiType;
}

export class DictPanelState {
    public state: DictPanelPropsType;

    static initState: DictPanelPropsType = {
        dict: {},
        showEmptyInput: false,
        fetchApi: undefined,
    }

    constructor(initData: object = {}) {
        this.state = reactive({
            ...DictPanelState.initState,
            ...initData,
        });
    }
}
