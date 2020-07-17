/* eslint-disable camelcase */
import { AxiosResponse } from 'axios';
import { ref } from '@vue/composition-api';
import { DynamicFluentAPIToolSet, getDataAPI } from '@/lib/api/toolset';
import { ClassTypeOf } from '@/lib/type';
import TreeItem, { TreeToolSet } from '@/components/molecules/tree-origin/ToolSet';
import { TreeAction } from '@/lib/fluent-api';

export interface TreeResp<T> {
    items: T[];
}

export abstract class BaseTreeFluentAPI<
    initData = any,
    node extends TreeItem = TreeItem,
    parameter = any,
    resp = any,
    action extends TreeAction<any, any> = TreeAction<parameter, resp>,
    T extends TreeToolSet<any> = TreeToolSet<initData >
    > extends DynamicFluentAPIToolSet<parameter, resp, action> {
    ts: T;

    protected setFetchData() {
        // @ts-ignore
        this.ts.state.options?.fetchData = this.getData;
    }

    constructor(action: action, initData?: initData, treeRef = ref(null)) {
        super(action);
        // @ts-ignore
        this.ts = new TreeToolSet(initData, treeRef);
        this.setFetchData();
    }

    abstract getAction: (node: node) => action

    protected abstract toNode: (data: AxiosResponse<any>) => node[];

    getData = async (node?: any): Promise<node[]> => {
        this.ts.state.loading = true;
        let result: node[] = [];
        try {
            const resp = await this.getAction(node).execute();
            result = this.toNode(resp);
        } catch (e) {
            console.error(e);
        }
        this.ts.state.loading = false;
        return result;
    };
}

export interface ProjectItemResp {
    id: string;
    name: string;
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

export interface ProjectNode extends TreeItem{
    data: ProjectItemResp;
}


export class ProjectTreeFluentAPI <
    initData = any,
    node extends ProjectNode = ProjectNode,
    parameter = any,
    resp = any,
    action extends TreeAction<any, any> = TreeAction<parameter, resp>,
    T extends TreeToolSet<any> = TreeToolSet<initData >
    > extends BaseTreeFluentAPI<initData, node, parameter, resp, action, T> {
    getAction = (node: node) => {
        if (node.id !== 'root') {
            return this.action.setItemId(node.data.id).setItemType(node.data.item_type);
        }
        return this.action.setRoot();
    };

    // eslint-disable-next-line max-len
    protected toNode = (resp: AxiosResponse<TreeResp<ProjectItemResp>>) => resp.data.items.map(item => new TreeItem(item.name, item, undefined, undefined, undefined, item.item_type === 'PROJECT_GROUP') as node)
}

export abstract class BaseTreeAPI<
        initData = any,
        node extends TreeItem = TreeItem,
        responses =any,
        T extends TreeToolSet<initData > = TreeToolSet<initData >
    > extends getDataAPI {
    public abstract ts: T;

    protected setFetchData() {
        // @ts-ignore
        this.ts.state.options?.fetchData = this.getData;
    }

    protected abstract requestData: (node?: any) => any;

    protected abstract toNode: (data: any) => node[];

    getData = async (node?: any): Promise<node[]> => {
        this.ts.state.loading = true;
        let result: node[] = [];
        try {
            const resp = await this.requestData(node);
            result = this.toNode(resp);
        } catch (e) {
            console.error(e);
        }
        this.ts.state.loading = false;
        return result;
    };
}

export interface ProjectGroupItem {
    project_group_id: string;
    name: string;
    text: string;
}


export class ProjectTreeAPI<
        initData = any,
        initSyncData = any,
        node extends ProjectNode = ProjectNode,
        responses =any,
        T extends TreeToolSet<initData > = TreeToolSet<initData >
        > extends BaseTreeAPI<initData, node, responses, T> {
        ts: T;


        constructor(ToolSet: ClassTypeOf<T> = null as unknown as ClassTypeOf<T>, initData?: initData, initSyncData?: initSyncData, treeRef = ref(null)) {
            super();
            // @ts-ignore
            this.ts = ToolSet ? new ToolSet(initData, initSyncData, treeRef) : TreeToolSet(initData, treeRef);
            this.setFetchData();
        }


        protected requestData = async (node: node) => {
            let url = '';
            let data: any = {};
            let cb: (resp: AxiosResponse<any>) => Promise<any[]> = null as unknown as (resp: AxiosResponse<any>) => Promise<any[]>;
            // console.debug('request node', node);
            if (node.id !== 'root') {
                url = '/identity/project/tree';
                data = {
                    item_id: node.data.id,
                    item_type: node.data.item_type,
                    sort: {
                        key: 'item_type',
                        desc: true,
                    },
                };
                cb = resp => Promise.resolve(resp.data.items);
            } else { // root tree
                url = '/identity/project-group/list';
                data = {
                    query: {
                        minimal: true,
                        filter: [{ k: 'parent_project_group', v: null, o: 'eq' }],
                    },
                };
                cb = resp => Promise.resolve(resp.data.results);
            }
            const resp = await this.$http.post(url, data).then(cb);
            // console.debug('tree result', resp);
            return resp;
        };

        protected toNode = (data: ProjectItemResp[]|ProjectGroupItem[]) =>
            // @ts-ignore
            data.map((item) => {
                if (item.item_type) {
                    return new TreeItem(item.name, item, undefined, undefined, undefined, item.item_type === 'PROJECT_GROUP');
                }
                return new TreeItem(item.name, {
                    id: item.project_group_id,
                    name: item.name,
                    has_child: true,
                    item_type: 'PROJECT_GROUP',

                }, undefined, undefined, undefined, true);
            })
        ;
}
