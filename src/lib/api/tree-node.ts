/* eslint-disable camelcase,@typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import { DynamicFluentAPIToolSet } from '@/lib/api/toolset';
// @ts-ignore
import { TreeAction } from '@/lib/fluent-api';
import {
    TreeNodeToolSet,
    getDefaultNode,
    BaseNodeStateType, TreeNodeProps, TreeNode,
} from '@/components/molecules/tree/PTreeNode.toolset';
import { reactive, UnwrapRef } from '@vue/composition-api/dist/reactivity';

export interface TreeResp<T> {
    items: T[];
}

export abstract class BaseTreeFluentAPI<
    state extends BaseNodeStateType = BaseNodeStateType,
    initData = any, initSyncData = any,
    parameter = any,
    resp = any,
    action extends TreeAction<any, any> = TreeAction<parameter, resp>,
    T extends TreeNodeToolSet<resp, state, initData, initSyncData> = TreeNodeToolSet<resp, state, initData, initSyncData>
    > extends DynamicFluentAPIToolSet<parameter, resp, action> {
    ts: T;

    constructor(action: action, initData?: initData, initSyncData?: initSyncData, isMultiSelect = false) {
        super(action);
        this.ts = new TreeNodeToolSet(initData, initSyncData, isMultiSelect) as T;
    }

    abstract getAction: (node?: TreeNode<resp, state>) => action

    protected abstract toNode: (data: AxiosResponse<TreeResp<resp>>, parentNode?: TreeNode<resp, state>) => TreeNodeProps<resp, state>[]|boolean;

    protected requestData = async (node?: TreeNode<resp, state>): Promise<void> => {
        try {
            const res: AxiosResponse<TreeResp<resp>> = await this.getAction(node).execute();
            if (node) {
                node.sync.children = this.toNode(res, node) as TreeNodeProps<resp, state>[];
            } else {
                this.ts.metaState.nodes = this.toNode(res) as TreeNodeProps<resp, state>[];
            }
        } catch (e) {
            console.error(e);
        }
    };

    abstract getData: (node: TreeNode<resp, state>, matched: TreeNode<resp, state>[], e: MouseEvent) => Promise<void>;

    getRootData = async (): Promise<void> => {
        await this.requestData();
    }
}

export interface ProjectItemResp {
    id: string;
    name: string;
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

export interface ProjectNodeState extends BaseNodeStateType {
    loading: boolean;
}

export type ProjectNode<S extends BaseNodeStateType = BaseNodeStateType> = TreeNodeProps<ProjectItemResp, S>

export class ProjectTreeFluentAPI<
    state extends ProjectNodeState = ProjectNodeState,
    initData = any,
    initSyncData = any,
    parameter = any,
    action extends TreeAction<any, any> = TreeAction<parameter, ProjectItemResp>,
    T extends TreeNodeToolSet<ProjectItemResp, state, initData, initSyncData> = TreeNodeToolSet<ProjectItemResp, state, initData, initSyncData>
    > extends BaseTreeFluentAPI<state, initData, initSyncData, parameter, ProjectItemResp, action, T> {
    getAction = (node?: TreeNode<ProjectItemResp, state>): action => {
        if (node) {
            return this.action.setItemId(node.data.id).setItemType(node.data.item_type);
        }
        return this.action.setRoot();
    };

    protected toNode = (resp: AxiosResponse<TreeResp<ProjectItemResp>>, parentNode?: TreeNode<ProjectItemResp, state>): TreeNodeProps<ProjectItemResp, state>[]|boolean => {
        if (resp.data.items.length === 0) {
            return false;
        }
        return resp.data.items.map(
            item => getDefaultNode<ProjectItemResp, state>(item, {
                children: item.has_child,
                state: {
                    selected: false,
                    expanded: false,
                    loading: false,
                } as state,
            }) as TreeNodeProps<ProjectItemResp, state>,
        );
    }

    getData = async (node: TreeNode<ProjectItemResp, state>, matched: TreeNode<ProjectItemResp, state>[], e: MouseEvent): Promise<void> => {
        e.stopPropagation();
        if (node.state.expanded) {
            this.ts.setNodeState(node, { expanded: false });
        } else {
            this.ts.setNodeState(node, { expanded: true, loading: true });
        }
        await this.requestData(node);
        this.ts.setNodeState(node, { loading: false });
    }
}
