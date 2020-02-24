import { reactive } from '@vue/composition-api';
import { number } from '@storybook/addon-knobs';
import {
    // eslint-disable-next-line import/named
    DataTablePropsType,
    DataTableSelectState,
    DataTableState, DataTableSyncType,
    DataTableToolSet, initSelectState,
} from '@/components/organisms/tables/data-table/toolset';
import { TableState } from '@/components/molecules/tables/toolset';
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

    constructor(public initData:object = {}, public initSyncData:object = {}) {
        super();
        this.state = reactive({
            ...TableState.initTableState,
            ...DataTableState.initDataTableState,
            ...ToolboxTableState.initToolBoxState,
            ...this.initData,
        });
        this.syncState = reactive({
            ...DataTableState.initDataTableSyncState,
            ...ToolboxTableState.initToolBoxSyncState,
            ...this.initSyncData,
        });
    }
}


export class ToolboxTableToolSet extends ToolboxTableState implements DataTableToolSet {
    public selectState:DataTableSelectState;

    constructor(public initData:object = {}, public initSyncData:object = {}) {
        super(initData, initSyncData);
        this.selectState = initSelectState(this.state);
    }

    setAllPage(totalCount:number) {
        this.state.allPage = getAllPage(totalCount, (this.syncState.pageSize as number));
    }
}
