import { computed, reactive, Ref } from '@vue/composition-api';
import { TableState, tableProps, TablePropsType } from '@/components/molecules/tables/toolset';


export const dataTableProps = {
    ...tableProps,
    fields: Array,
    items: Array,
    sortable: {
        type: Boolean,
        default: false,
    },
    dragable: {
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
    useSpinnerLoading: {
        type: Boolean,
        default: false,
    },
    useCursorLoading: {
        type: Boolean,
        default: false,
    },
    /**
     * @name multiSelect
     * @description When it's 'false', should NOT give value 'true' to 'dragable' prop.
     */
    multiSelect: {
        type: Boolean,
        default: true,
    },
};

export interface DataTablePropsType extends TablePropsType {
    fields?:any[];
    items?: any[];
    sortable?:boolean;
    dragable?: boolean;
    rowClickMultiSelectMode?: boolean;
    selectable?: boolean;
    colCopy?:boolean;
    useSpinnerLoading?:boolean;
    useCursorLoading?:boolean;
    multiSelect?:boolean;
}
export interface DataTableSyncType {
    sortBy?: string;
    sortDesc?:boolean;
    selectIndex?: any[]|number;
    loading?:boolean;
}
export interface DataTableSetupProps extends DataTablePropsType, DataTableSyncType{
    fields:any[];
    items: any[];
    sortable:boolean;
    dragable: boolean;
    rowClickMultiSelectMode: boolean;
    selectable: boolean;
    selectIndex: any[]|number;
    colCopy:boolean;
    loading:boolean;
    useSpinnerLoading:boolean;
    useCursorLoading:boolean;
    multiSelect:boolean;
    sortBy: string;
    sortDesc:boolean;
}


export class DataTableState extends TableState {
    public state:DataTablePropsType;

    public syncState:DataTableSyncType;

    static initDataTableState:DataTablePropsType ={
        fields: [],
        items: [],
        sortable: false,
        dragable: false,
        rowClickMultiSelectMode: false,
        selectable: false,

        colCopy: false,
        useSpinnerLoading: true,
        useCursorLoading: true,
        multiSelect: true,
    };

    static initDataTableSyncState:DataTableSyncType = {
        sortBy: undefined,
        sortDesc: true,
        selectIndex: [],
        loading: false,
    };

    constructor(initData:object = {}, initSyncData:object = {}) {
        super();
        this.state = reactive({
            ...TableState.initTableState,
            ...DataTableState.initDataTableState,
            ...initData,
        });
        this.syncState = reactive({
            ...DataTableState.initDataTableSyncState,
            ...initSyncData,
        });
    }
}

export interface DataTableSelectState {
    isNotSelected:boolean;
    isSelectOne:boolean;
    isSelectMulti:boolean;
    selectItems:readonly any[];
    firstSelectItem:any;
}


export const initSelectState = (state:DataTablePropsType, syncState:DataTableSyncType):DataTableSelectState => {
    const isNotSelected:Ref<boolean> = computed(() => (syncState.selectIndex ? (syncState.selectIndex as Array<any>).length === 0 : true));
    const isSelectOne:Ref<boolean> = computed(() => (syncState.selectIndex ? (syncState.selectIndex as Array<any>).length === 1 : false));
    const isSelectMulti:Ref<boolean> = computed(() => (syncState.selectIndex ? (syncState.selectIndex as Array<any>).length > 1 : false));
    const selectItems:Ref<readonly any[]> = computed(() => (syncState.selectIndex ? (syncState.selectIndex as Array<any>).map(idx => (state.items as Array<any>)[idx]) : []));
    const firstSelectItem:Ref<any> = computed(() => (!isNotSelected.value ? (state.items as Array<any>)[(syncState.selectIndex as number[])[0]] : {}));
    return reactive({
        isNotSelected,
        isSelectOne,
        isSelectMulti,
        selectItems,
        firstSelectItem,
    });
};


export class DataTableToolSet extends DataTableState {
    public selectState:DataTableSelectState;

    constructor(initData:object = {}, initSyncData:object = {}) {
        super(initData, initSyncData);
        this.selectState = initSelectState(this.state, this.syncState);
    }
}
