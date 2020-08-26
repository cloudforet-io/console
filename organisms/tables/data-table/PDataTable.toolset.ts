import {
    computed, reactive, Ref, UnwrapRef,
} from '@vue/composition-api';
import {
    HelperToolSet, initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import { get } from 'lodash';
import { Computed } from '@/components/util/type';

export interface DataTablePropsType {
    fields?: any[] | Readonly<any[]>;
    items?: any[];
    sortable?: boolean;
    rowClickMultiSelectMode?: boolean;
    selectable?: boolean;
    colCopy?: boolean;
    useCursorLoading?: boolean;
    skeletonRows?: number;
    multiSelect?: boolean;
    // TablePropsType
    striped?: boolean;
    bordered?: boolean|null|unknown;
    hover?: boolean;
    tableStyleType?: string;
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
