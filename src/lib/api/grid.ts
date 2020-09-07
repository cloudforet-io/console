import { Ref, ref } from '@vue/composition-api';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
import { ActionAPI, ListType, QueryAPI } from '@/lib/fluent-api';
import {
    SearchGridLayoutToolSet,
    ToolboxGridLayoutToolSet,
} from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.toolset';

export abstract class BaseGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends ToolboxGridLayoutToolSet<initData, initSyncData> = ToolboxGridLayoutToolSet<initData, initSyncData>,
    action extends ActionAPI<any, any> = ActionAPI<parameter, resp>,
    > extends DynamicFluentAPIToolSet<parameter, resp, action> {
    gridTS: T;

    totalCount: Ref<number>;

    protected constructor(action: action) {
        super(action);
        this.totalCount = ref(0);
        this.gridTS = new ToolboxGridLayoutToolSet<initData, initSyncData>() as T;
    }

    protected abstract getDefaultAction(): action


    getAction = () => this.getDefaultAction()

    defaultGetData = async (resetThisPage) => {
        if (resetThisPage) {
            this.gridTS.syncState.thisPage = 1;
        }
        this.gridTS.syncState.loading = true;
        // let res: PromiseLike<AxiosResponse<any>>|any = null;
        try {
            const res = await this.getAction().execute();
            this.gridTS.state.items = res.data.results;
            this.totalCount.value = res.data.total_count;
            this.gridTS.setAllPage(res.data.total_count);
        } catch (e) {
            this.gridTS.state.items = [];
            this.gridTS.state.allPage = 1;
        } finally {
            this.gridTS.syncState.loading = false;
        }

        // return res;
    };

    getData = async (resetThisPage = false) => {
        await this.defaultGetData(resetThisPage);
    };

    protected defaultReset = () => {
        this.gridTS.state.allPage = 1;
        this.gridTS.state.items = [];
        this.gridTS.syncState.thisPage = 1;
    };

    resetAll = () => {
        this.defaultReset();
    }
}
export class SearchGridFluentAPI<
    parameter = any,
    resp extends ListType<any> = ListType<any>,
    initData = any,
    initSyncData = any,
    T extends SearchGridLayoutToolSet<initData, initSyncData> = SearchGridLayoutToolSet<initData, initSyncData>,
    action extends QueryAPI<any, any> = QueryAPI<parameter, resp>,
    > extends BaseGridFluentAPI<parameter, resp, action> {
    gridTS: T;

    constructor(
        action: action,
        initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
    ) {
        super(action);
        this.gridTS = new SearchGridLayoutToolSet(initData, initSyncData) as T;
    }

    protected getDefaultAction(): action {
        return (this.action as QueryAPI<parameter, resp>)
            .setThisPage(this.gridTS.syncState.thisPage as number)
            .setPageSize(this.gridTS.syncState.pageSize as number) as action;
    }

    // @ts-ignore
    getSearchTableDefaultAction: () => action = () => this.getDefaultAction().setKeyword(this.gridTS.searchText.value);

    getAction = () => this.getSearchTableDefaultAction();

    resetAll = () => {
        this.defaultReset();
        this.gridTS.searchText.value = '';
    };
}

