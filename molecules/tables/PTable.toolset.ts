import { reactive } from '@vue/composition-api';
import { optionalType, StateToolSet } from '@/lib/toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';


const color = ['default', 'light', 'primary4'];

export const tableProps = {
    tableStyleType: {
        type: String,
        default: 'default',
        validator(value) {
            return [null, ...color].indexOf(value) !== -1;
        },
    },
    striped: {
        type: Boolean,
        default: false,
    },
    bordered: {
        type: Boolean,
        default: true,
    },
    hover: {
        type: Boolean,
        default: false,
    },
    width: {
        type: String,
        default: undefined,
    },
    rowHeightFixed: {
        type: Boolean,
        default: true,
    },
};


export interface TablePropsType {
    striped?: boolean;
    bordered?: boolean|null|unknown;
    hover?: boolean;
    tableStyleType?: string;
}
@StateToolSet<TablePropsType>()
export class TableState<initData, initState extends TablePropsType = TablePropsType> {
    state: UnwrapRef<optionalType<initState, initData>>;

    static initState() {
        return {
            striped: false,
            bordered: true,
            hover: true,
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
