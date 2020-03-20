import { reactive, Ref, ref } from '@vue/composition-api';
import {
    DataTablePropsType,
    DataTableSelectState,
    DataTableState,
    DataTableSyncType,
    DataTableToolSet,
} from '@/components/organisms/tables/data-table/toolset';
// eslint-disable-next-line import/no-cycle
import { QuerySearchToolSet } from '@/components/organisms/search/query-search-bar/toolset';
// eslint-disable-next-line import/no-cycle
import { baseAutocompleteHandler } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import { getAllPage } from '../../pagenations/toolset';

export interface ToolBoxTablePropsType extends DataTablePropsType{
    pagenationVisible?: boolean;
    pageSizeVisible?: boolean;
    shadow?: boolean;
    border?: boolean;
    settingVisible?: boolean;
    refreshVisible?: boolean;
    allPage?: number;
    pageNationValues?: number[];
    padding?: boolean;
    toolboxBackground?: boolean;
}
export interface ToolBoxTableSyncType extends DataTableSyncType {
    pageSize?: number;
    thisPage?: number;
}

export interface ToolBoxTableSetupProps extends ToolBoxTablePropsType, ToolBoxTableSyncType{
    pagenationVisible: boolean;
    pageSizeVisible: boolean;
    shadow: boolean;
    border: boolean;
    settingVisible: boolean;
    refreshVisible: boolean;
    allPage: number;
    pageNationValues: number[];
    padding: boolean;
    toolboxBackground: boolean;
    pageSize: number;
    thisPage: number;
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
            pagenationVisible: true,
            pageSizeVisible: true,
            shadow: true,
            border: true,
            allPage: 1,
            settingVisible: false,
            refreshVisible: true,
            pageNationValues: undefined,
            padding: true,
            toolboxBackground: true,
            sortable: true,
            dragable: true,
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

     setAllPage: (totalCount: number) => void = null as unknown as (totalCount: number) => void;

     static initToolSet(_this: any, ...args: any[]) {
         DataTableToolSet.initToolSet(_this);
         _this.setAllPage = (totalCount: number) => {
             _this.state.allPage = getAllPage(totalCount, (_this.syncState.pageSize));
         };
     }

     constructor(initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{}, lazy = false) {
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

    constructor(initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{}, lazy = false) {
        super(initData, initSyncData, true);
        if (!lazy) {
            SearchTableToolSet.initToolSet(this);
        }
    }
}

@HelperToolSet()
export class QuerySearchTableToolSet<initData, initSyncData> extends ToolboxTableToolSet<initData, initSyncData> {
    querySearch: QuerySearchToolSet=null as unknown as QuerySearchToolSet;

    static initToolSet(_this: any, ACHandlerClass: typeof baseAutocompleteHandler, acHandlerArgs: any, changeTagCallBack?: any) {
        ToolboxTableToolSet.initToolSet(_this);
        _this.querySearch = new QuerySearchToolSet(ACHandlerClass, acHandlerArgs, undefined, undefined, undefined, undefined, changeTagCallBack);
    }

    constructor(
        ACHandlerClass: typeof baseAutocompleteHandler = baseAutocompleteHandler,
        acHandlerArgs: any = {},
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
        lazy = false,
        changeTagCallBack?: any,
    ) {
        super(initData, initSyncData, true);
        if (!lazy) {
            QuerySearchTableToolSet.initToolSet(this, ACHandlerClass, acHandlerArgs, changeTagCallBack);
        }
    }
}
