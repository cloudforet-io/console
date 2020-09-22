import { Ref, ref } from '@vue/composition-api';
import {
    DataTableSelectState,
    DataTableState,
    DataTableSyncType,
    DataTableToolSet, LinkState,
} from '@/components/organisms/tables/data-table/PDataTable.toolset';
import {
    HelperToolSet,
    initReactive, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import { Computed } from '@/components/util/type';
import { getAllPage } from '@/components/organisms/pagination/PTextPagination.toolset';

export interface ToolBoxTablePropsType {
    paginationVisible?: boolean;
    pageSizeVisible?: boolean;
    shadow?: boolean;
    settingVisible?: boolean;
    refreshVisible?: boolean;
    allPage?: number;
    pageNationValues?: number[];
    //
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
export interface ToolBoxTableSyncType extends DataTableSyncType {
    pageSize?: number;
    thisPage?: number;
}

@StateToolSet<ToolBoxTablePropsType>()
@SyncStateToolSet<ToolBoxTableSyncType>()
export class ToolboxTableState<
        initData=any,
        initSyncData=any,
        initState extends ToolBoxTablePropsType=ToolBoxTablePropsType,
        initSyncState extends ToolBoxTableSyncType=ToolBoxTableSyncType,
    > extends DataTableState<initData, initSyncData, initState, initSyncState> {
    static initState() {
        return {
            ...DataTableState.initState(),
            paginationVisible: true,
            pageSizeVisible: true,
            shadow: true,
            allPage: 1,
            settingVisible: false,
            excelVisible: false,
            refreshVisible: true,
            pageNationValues: undefined,
            sortable: true,
            rowClickMultiSelectMode: true,
            selectable: true,
        };
    }

    static initSyncState() {
        return {
            ...DataTableState.initSyncState(),
            pageSize: 15,
            thisPage: 1,
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {}as initSyncData, lazy = false) {
        super(initData, initSyncData, true);
        this.state = initReactive(lazy, ToolboxTableState.initState(), initData);
        this.syncState = initReactive(lazy, ToolboxTableState.initSyncState(), initSyncData);
    }
}

@HelperToolSet()
export class ToolboxTableToolSet<initData=any, initSyncData=any> extends ToolboxTableState<initData, initSyncData> implements DataTableToolSet<initData, initSyncData> {
     selectState: DataTableSelectState= {} as DataTableSelectState;

     linkState: LinkState= null as unknown as LinkState;

     noLink: Computed<boolean> = null as unknown as Computed<boolean>;

     setAllPage: (totalCount: number) => void = null as unknown as (totalCount: number) => void;

    onSelect = (selectIndex: number[]) => {
        this.syncState.selectIndex = selectIndex;
    }

    onChangeSort = (sortBy: string, sortDesc: boolean) => {
        this.syncState.sortBy = sortBy;
        this.syncState.sortDesc = sortDesc;
    }

    onChangePageSize = (pageSize: number) => {
        this.syncState.pageSize = pageSize;
    }

    onChangePageNumber = (thisPage: number) => {
        this.syncState.thisPage = thisPage;
    }


    static initToolSet(_this: any, ...args: any[]) {
        DataTableToolSet.initToolSet(_this);
        _this.setAllPage = (totalCount: number) => {
            _this.state.allPage = getAllPage(totalCount, (_this.syncState.pageSize));
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        super(initData, initSyncData);
        if (!lazy) {
            ToolboxTableToolSet.initToolSet(this);
        }
    }
}


@HelperToolSet()
export class SearchTableToolSet<initData=any, initSyncData=any> extends ToolboxTableToolSet<initData, initSyncData> {
    searchText: Ref<string> = null as unknown as Ref<string>;

    static initToolSet(_this: any) {
        ToolboxTableToolSet.initToolSet(_this);
        _this.searchText = ref('');
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        super(initData, initSyncData, true);
        if (!lazy) {
            SearchTableToolSet.initToolSet(this);
        }
    }
}
