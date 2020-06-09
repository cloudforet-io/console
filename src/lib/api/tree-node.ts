/* eslint-disable camelcase */
import { AxiosResponse } from 'axios';
import { ref } from '@vue/composition-api';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
// @ts-ignore
import { TreeAction } from '@/lib/fluent-api';
import { TreeNodeToolSet, TreeNode, getDefaultNode } from '@/components/molecules/tree/PTreeNode.toolset';

export interface TreeResp<T> {
    items: T[];
}

export abstract class BaseTreeFluentAPI<
    initData = any, initSyncData = any,
    node extends TreeNode = TreeNode,
    parameter = any,
    resp = any,
    action extends TreeAction<any, any> = TreeAction<parameter, resp>,
    T extends TreeNodeToolSet<any, any> = TreeNodeToolSet<initData, initSyncData>
    > extends DynamicFluentAPIToolSet<parameter, resp, action> {
    ts: T;

    protected setFetchData() {
        // @ts-ignore
        this.ts.state.options?.fetchData = this.getData;
    }

    constructor(action: action, initData?: initData) {
        super(action);
        // @ts-ignore
        this.ts = new TreeNodeToolSet(initData, initSyncData);
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
    item_type: 'PROJECT_GROUP'|'PROJECT'|'ROOT';
}

export interface ProjectNode extends TreeNode {
    data: ProjectItemResp;
}

export class ProjectTreeFluentAPI <
    initData = any,
    initSyncData = any,
    node extends ProjectNode = ProjectNode,
    parameter = any,
    resp = any,
    action extends TreeAction<any, any> = TreeAction<parameter, resp>,
    T extends TreeNodeToolSet<any, any> = TreeNodeToolSet<initData, initSyncData>
    > extends BaseTreeFluentAPI<initData, initSyncData, node, parameter, resp, action, T> {
    getAction = (node: node) => {
        if (node.data.id !== 'root') {
            return this.action.setItemId(node.data.id).setItemType(node.data.item_type);
        }
        return this.action.setRoot();
    };

    protected toNode = (resp: AxiosResponse<TreeResp<ProjectItemResp>>) => resp.data.items.map(item => getDefaultNode(item) as node)
}
