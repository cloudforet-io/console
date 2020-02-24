import { reactive } from '@vue/composition-api';
import {
    // eslint-disable-next-line import/named
    DataTablePropsType,
    DataTableSelectState,
    DataTableState,
    DataTableToolSet, initSelectState,
} from '@/components/organisms/tables/data-table/toolset';
import { TableState } from '@/components/molecules/tables/toolset';

export interface ToolBoxTablePropsType extends DataTablePropsType{
    pagenationVisible?: boolean;
    pageSizeVisible?: boolean;
    shadow?: boolean;
    border?: boolean;
    settingVisible?: boolean;
    refreshVisible?: boolean;
    pageSize?: Number;
    allPage?: Number;
    thisPage?: Number;
    pageNationValues?: Number[];
    padding?: boolean;
    toolboxBackground?: boolean;
}


export class ToolboxTableState extends DataTableState {
    public state:ToolBoxTablePropsType;

    static initToolBoxState:ToolBoxTablePropsType = {
        pagenationVisible: true,
        pageSizeVisible: true,
        shadow: true,
        border: true,
        settingVisible: false,
        refreshVisible: true,
        pageSize: 15,
        allPage: 1,
        thisPage: 1,
        pageNationValues: undefined,
        padding: true,
        toolboxBackground: true,
    };

    constructor(public initData:object = {}) {
        super();
        this.state = reactive({
            ...TableState.initTableState,
            ...DataTableState.initDataTableState,
            ...ToolboxTableState.initToolBoxState,
            ...this.initData,
        });
    }
}


export class ToolboxTableToolSet extends ToolboxTableState implements DataTableToolSet {
    public selectState:DataTableSelectState;

    constructor(public initData:object = {}) {
        super(initData);
        this.selectState = initSelectState(this.state);
    }
}
