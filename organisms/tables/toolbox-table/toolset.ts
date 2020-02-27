import { reactive, Ref, ref } from '@vue/composition-api';
import {
    DataTablePropsType,
    DataTableSelectState,
    DataTableState,
    DataTableSyncType,
    DataTableToolSet,
    initSelectState,
} from '@/components/organisms/tables/data-table/toolset';
import { TableState } from '@/components/molecules/tables/toolset';
import { getAllPage } from '../../pagenations/toolset';
import { QuerySearchToolSet } from '@/components/organisms/search/query-search-bar/toolset';
import { baseAutocompleteHandler } from '@/components/organisms/search/query-search-bar/autocompleteHandler';

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

export class ToolboxTableState extends DataTableState {
    public state:ToolBoxTablePropsType;

    public syncState:ToolBoxTableSyncType;

    static initToolBoxState:ToolBoxTablePropsType = {
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
    };

    static initToolBoxSyncState:ToolBoxTableSyncType = {
        pageSize: 15,
        thisPage: 1,
    };

    constructor(initData:object = {}, initSyncData:object = {}) {
        super();
        this.state = reactive({
            ...TableState.initTableState,
            ...DataTableState.initDataTableState,
            ...ToolboxTableState.initToolBoxState,
            ...initData,
        });
        this.syncState = reactive({
            ...DataTableState.initDataTableSyncState,
            ...ToolboxTableState.initToolBoxSyncState,
            ...initSyncData,
        });
    }
}


export class ToolboxTableToolSet extends ToolboxTableState implements DataTableToolSet {
    public selectState:DataTableSelectState;

    constructor(initData:object = {}, initSyncData:object = {}) {
        super(initData, initSyncData);
        this.selectState = initSelectState(this.state, this.syncState);
    }

    setAllPage(totalCount:number) {
        this.state.allPage = getAllPage(totalCount, (this.syncState.pageSize as number));
    }
}

export class SearchTableToolSet extends ToolboxTableToolSet {
    public searchText:Ref<string> = ref('')
}

export class QuerySearchTableToolSet extends ToolboxTableToolSet {
    public querySearch: QuerySearchToolSet;

    public acState: any;

    constructor(
        ACHandlerClass: typeof baseAutocompleteHandler = baseAutocompleteHandler,
        acHandlerArgs: object = {},
        public initData: object = {},
        public initSyncData: object = {},
    ) {
        super(initData, initSyncData);
        this.querySearch = new QuerySearchToolSet(ACHandlerClass, acHandlerArgs);
    }
}
