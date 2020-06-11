/* eslint-disable camelcase,@typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
// @ts-ignore
import { TreeAction } from '@/lib/fluent-api';
import {
    TreeNodeToolSet,
    getDefaultNode,
    BaseNodeStateType, InitTreeNodeProps,
} from '@/components/molecules/tree/PTreeNode.toolset';

export interface TreeResp<T> {
    items: T[];
}

export abstract class BaseTreeFluentAPI<
    data=any, state extends BaseNodeStateType = BaseNodeStateType,
    initData = any, initSyncData = any,
    parameter = any,
    resp = any,
    action extends TreeAction<any, any> = TreeAction<parameter, resp>,
    T extends TreeNodeToolSet<data, state, initData, initSyncData> = TreeNodeToolSet<data, state, initData, initSyncData>
    > extends DynamicFluentAPIToolSet<parameter, resp, action> {
    ts: T;

    constructor(action: action, initData?: initData, initSyncData?: initSyncData, isMultiSelect = false) {
        super(action);
        this.ts = new TreeNodeToolSet(initData, initSyncData, isMultiSelect) as T;
    }

    abstract getAction: (node: InitTreeNodeProps<data, state>) => action

    protected abstract toNode: (data: AxiosResponse) => InitTreeNodeProps<data, state>[];

    getData = async (node?: any): Promise<InitTreeNodeProps<data, state>[]> => {
        // this.ts.state.loading = true;
        let result: InitTreeNodeProps<data, state>[] = [];
        try {
            const resp = await this.getAction(node).execute();
            result = this.toNode(resp);
        } catch (e) {
            console.error(e);
        }
        // this.ts.state.loading = false;
        return result;
    };
}

export interface ProjectItemResp {
    id: string;
    name: string;
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

export type ProjectNode<S extends BaseNodeStateType = BaseNodeStateType> = InitTreeNodeProps<ProjectItemResp, S>

export class ProjectTreeFluentAPI<
    state extends BaseNodeStateType = BaseNodeStateType,
    initData = any,
    initSyncData = any,
    parameter = any,
    resp = any,
    action extends TreeAction<any, any> = TreeAction<parameter, resp>,
    T extends TreeNodeToolSet<any, state> = TreeNodeToolSet<ProjectItemResp, state, initData, initSyncData>
    > extends BaseTreeFluentAPI<ProjectItemResp, state, initData, initSyncData, parameter, resp, action, T> {
    getAction = (node: ProjectNode<state>): action => {
        if (node.data.id !== 'root') {
            return this.action.setItemId(node.data.id).setItemType(node.data.item_type);
        }
        return this.action.setRoot();
    };

    protected toNode = (resp: AxiosResponse<TreeResp<ProjectItemResp>>): ProjectNode<state>[] => resp.data.items.map(item => getDefaultNode<ProjectItemResp, state>(item))
}
