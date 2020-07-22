import { reactive } from '@vue/composition-api';
import { optionalType, StateToolSet } from '@/lib/toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';


const color = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'gray900', 'primary4'];

export const tableProps = {
    tableStyleType: {
        type: String,
        default: null,
        validator(value) {
            return [null, ...color].indexOf(value) !== -1;
        },
    },
    theadStyleType: {
        type: String,
        default: null,
        validator(value) {
            return [null, 'light', 'gray900'].indexOf(value) !== -1;
        },
    },
    responsiveStyle: {
        type: Object,
        default: null,
    },
    tableStyle: {
        type: Object,
        default: null,
    },
    theadStyle: {
        type: Object,
        default: null,
    },
    tbodyStyle: {
        type: Object,
        default: null,
    },
    tfootStyle: {
        type: Object,
        default: null,
    },
    tbodyClass: {
        type: Object,
        default: null,
    },
    tfootClass: {
        type: Object,
        default: null,
    },
    striped: {
        type: Boolean,
        default: true,
    },
    bordered: {
        type: Boolean,
        default: true,
    },
    hover: {
        type: Boolean,
        default: false,
    },
    small: {
        type: Boolean,
        default: false,
    },
    background: {
        type: Boolean,
        default: false,
    },
    topBorder: {
        type: Boolean,
        default: true,
    },
    responsive: {
        type: [String, Boolean],
        default: false,
        validator(value) {
            return [false, true, 'sm', 'md', 'lg', 'xl'].indexOf(value) !== -1;
        },
    },
    tbodyOnSelectStart: {
        type: Boolean,
        default: true,
    },
};


export interface TablePropsType {
    striped?: boolean;
    bordered?: boolean|null|unknown;
    hover?: boolean;
    small?: boolean;
    background?: boolean;
    topBorder?: boolean;
    responsive?: boolean|string;
    tableStyleType?: string;
    theadStyleType?: string;
    responsiveStyle?: object;
    tableStyle?: object;
    theadStyle?: object;
    tbodyStyle?: object;
    tfootStyle?: object;
    tbodyClass?: object;
    tfootClass?: object;
}
@StateToolSet<TablePropsType>()
export class TableState<initData, initState extends TablePropsType = TablePropsType> {
    state: UnwrapRef<optionalType<initState, initData>>;

    static initState() {
        return {
            striped: false,
            bordered: true,
            hover: true,
            small: false,
            background: false,
            topBorder: true,
            responsive: false,
        };
    }

    constructor(initData: initData = {} as initData, lazy = false) {
        if (lazy) {
            this.state = null as unknown as UnwrapRef<initState>;
        } else {
            this.state = reactive({
                ...TableState.initState(),
                ...initData,
            }) as UnwrapRef<optionalType<initState, initData>>;
        }
    }
}
