import { computed, reactive, Ref } from '@vue/composition-api';
import { TableState, tableProps, TablePropsType } from '@/components/molecules/tables/PTable.toolset';
import {
    HelperToolSet, initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import { get } from 'lodash';
import { Computed } from '@/components/util/type';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';


export const dataTableProps = {
    ...tableProps,
    fields: Array,
    items: Array,
    sortable: {
        type: Boolean,
        default: false,
    },
    rowClickMultiSelectMode: {
        type: Boolean,
        default: false,
    },
    selectable: {
        type: Boolean,
        default: false,
    },
    selectIndex: {
        type: [Array, Number],
        default: () => [],
    },
    sortBy: {
        type: String,
        default: null,
    },
    sortDesc: {
        type: Boolean,
        default: true,
    },
    colCopy: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    useCursorLoading: {
        type: Boolean,
        default: false,
    },
    skeletonRows: {
        type: Number,
        default: 5,
    },
    multiSelect: {
        type: Boolean,
        default: true,
    },
};

export interface DataTablePropsType extends TablePropsType {
    fields?: any[] | Readonly<any[]>;
    items?: any[];
    sortable?: boolean;
    rowClickMultiSelectMode?: boolean;
    selectable?: boolean;
    colCopy?: boolean;
    useCursorLoading?: boolean;
    skeletonRows?: number;
    multiSelect?: boolean;
}
export interface DataTableSyncType {
    sortBy: string;
    sortDesc: boolean;
    selectIndex: any[]|number;
    loading?: boolean;
}
export interface DataTableFieldType {
    name: string;
    label?: string;
    sortable?: boolean;
    sortKey?: string;
    width?: string;
}

export type DataTableField = string|DataTableFieldType
export interface DataTableSetupProps extends DataTablePropsType, DataTableSyncType{
    fields: DataTableField[];
    items: any[];
    sortable: boolean;
    rowClickMultiSelectMode: boolean;
    selectable: boolean;
    selectIndex: any[]|number;
    colCopy: boolean;
    loading?: boolean;
    useCursorLoading: boolean;
    skeletonRows: number;
    multiSelect: boolean;
    sortBy: string;
    sortDesc: boolean;
    rowHeightFixed: boolean;
    width?: string;
}

export type DataTableProps = DataTableSetupProps;

@StateToolSet<DataTablePropsType>()
@SyncStateToolSet<DataTableSyncType>()
export class DataTableState<
        initData,
        initSyncData,
        initState extends DataTablePropsType = DataTablePropsType,
        initSync extends DataTableSyncType= DataTableSyncType
    > extends TableState< initData, initState> {
    syncState: UnwrapRef<optionalType<initSync, initSyncData>>;

    static initState(): any {
        return {
            ...TableState.initState(),
            fields: [],
            items: [],
            sortable: false,
            rowClickMultiSelectMode: false,
            selectable: false,

            colCopy: false,
            useCursorLoading: true,
            skeletonRows: 5,
            multiSelect: true,
        };
    }

    static initSyncState() {
        return {
            sortBy: '',
            sortDesc: true,
            selectIndex: [],
            loading: true,
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        super(initData, true);
        this.state = initReactive<UnwrapRef<optionalType<initState, initData>>>(lazy, DataTableState.initState(), initData);
        this.syncState = initReactive<UnwrapRef<optionalType<initSync, initSyncData>>>(lazy, DataTableState.initSyncState(), initSyncData);
    }
}

export interface DataTableSelectState {
    isNotSelected: boolean;
    isSelectOne: boolean;
    isSelectMulti: boolean;
    selectItems: readonly any[];
    firstSelectItem: any;
}


export const initSelectState = (state: DataTablePropsType, syncState: DataTableSyncType): DataTableSelectState => {
    const selectItems: Ref<readonly any[]> = computed<any[]>(() => {
        if (Array.isArray(syncState.selectIndex)) {
            return syncState.selectIndex.reduce((res, idx) => {
                if (state.items && state.items[idx] !== undefined && state.items[idx] !== null) res.push(state.items[idx]);
                return res;
            }, []);
        } return [];
    });
    const isSelectOne: Ref<boolean> = computed<boolean>(() => selectItems.value.length === 1);
    const isNotSelected: Ref<boolean> = computed<boolean>(() => selectItems.value.length === 0);
    const isSelectMulti: Ref<boolean> = computed<boolean>(() => selectItems.value.length > 1);
    const firstSelectItem: Ref<any> = computed(() => {
        const item = selectItems.value[0];
        if (item !== null && item !== undefined) return item;
        return {};
    });
    return reactive({
        isNotSelected,
        isSelectOne,
        isSelectMulti,
        selectItems,
        firstSelectItem,
    });
};

export interface LinkState {
    link: string|undefined;
    openLink: () => void;
}

export const initLinkState = (selectState: DataTableSelectState): LinkState => {
    const link: Ref<Readonly<string|undefined>> = computed((): string|undefined => {
        if (selectState.isSelectOne) {
            return get(selectState.firstSelectItem, 'data.reference.link')
                || get(selectState.firstSelectItem, 'reference.external_link');
        }
        return undefined;
    });
    const openLink = () => {
        if (link.value) {
            window.open(link.value as string);
        }
    };
    return reactive({
        link,
        openLink,
    });
};

@HelperToolSet()
export class DataTableToolSet<initData, initSyncData> extends DataTableState< initData, initSyncData> {
    selectState: DataTableSelectState= null as unknown as DataTableSelectState;

    linkState: LinkState= null as unknown as LinkState;

    noLink: Computed<boolean> = null as unknown as Computed<boolean>;


    static initToolSet(_this: any) {
        _this.selectState = initSelectState(_this.state, _this.syncState);
        _this.linkState = initLinkState(_this.selectState);
        _this.noLink = computed(() => !_this.linkState.link);
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData) {
        super(initData, initSyncData);
        DataTableToolSet.initToolSet(this);
    }
}
