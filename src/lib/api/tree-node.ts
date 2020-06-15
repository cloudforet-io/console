/* eslint-disable camelcase,@typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import { DynamicAPI } from '@/lib/api/toolset';
// @ts-ignore
import { ResourceActions, TreeAction } from '@/lib/fluent-api/toolset';
import {
    TreeNodeToolSet,
    getDefaultNode,
    BaseNodeStateType, TreeNodeProps, TreeNode,
} from '@/components/molecules/tree/PTreeNode.toolset';
import { TreeResp, TreeSearchAction } from '@/lib/fluent-api';
import {
    ProjectItemResp, ProjectTree, ProjectTreeParameter, TreeSearchResp,
} from '@/lib/fluent-api/identity/project';
import { findIndex } from 'lodash';


export interface TreeApiActions<treeAction, searchAction> {
    treeAction: treeAction;
    treeSearchAction: searchAction;
}

export abstract class BaseTreeFluentAPI<
    state extends BaseNodeStateType = BaseNodeStateType,
    initData = any, initSyncData = any,
    parameter = any, resp = any,
    treeAction extends TreeAction<parameter, TreeResp<resp>> = TreeAction<parameter, TreeResp<resp>>,
    treeSearch extends TreeSearchAction<parameter, TreeSearchResp> = TreeSearchAction<parameter, TreeSearchResp>,
    T extends TreeNodeToolSet<resp, state, initData, initSyncData> = TreeNodeToolSet<resp, state, initData, initSyncData>
    > extends DynamicAPI {
    ts: T;

    treeAction: treeAction;

    treeSearchAction: treeSearch;

    constructor(actions: TreeApiActions<treeAction, treeSearch>, initData?: initData, initSyncData?: initSyncData, isMultiSelect = false) {
        super();
        this.treeAction = actions.treeAction;
        this.treeSearchAction = actions.treeSearchAction;
        this.ts = new TreeNodeToolSet(initData, initSyncData, isMultiSelect) as T;
    }

    abstract getTreeAction: (node?: TreeNode<resp, state>) => treeAction

    protected abstract toNodes: (data: AxiosResponse<TreeResp<resp>>, parentNode?: TreeNode<resp, state>) => TreeNodeProps<resp, state>[]|boolean;

    protected requestTreeData = async (node?: TreeNode<resp, state>): Promise<void> => {
        try {
            const res: AxiosResponse<TreeResp<resp>> = await this.getTreeAction(node).execute();
            if (node) {
                node.sync.children = this.toNodes(res, node) as TreeNodeProps<resp, state>[];
            } else {
                this.ts.metaState.nodes = this.toNodes(res) as TreeNodeProps<resp, state>[];
            }
        } catch (e) {
            console.error(e);
        }
    };

    protected requestTreeSearchData = async (id?: string, type?: string): Promise<TreeNodeProps<resp, state>[]> => {
        try {
            let res;
            if (id && type) res = await this.treeAction.setItemId(id).setItemType(type).execute();
            else res = await this.treeAction.setRoot().execute();
            const children = this.toNodes(res);
            return typeof children === 'boolean' ? [] : children;
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    abstract getData: (node: TreeNode<resp, state>, matched: TreeNode<resp, state>[], e: MouseEvent) => Promise<void>;

    abstract getSearchData: (...args) => Promise<any>;
}


export interface ProjectNodeState extends BaseNodeStateType {
    loading: boolean;
}

export type ProjectNode<S extends BaseNodeStateType = BaseNodeStateType> = TreeNodeProps<ProjectItemResp, S>

export class ProjectTreeFluentAPI<
    state extends ProjectNodeState = ProjectNodeState,
    initData = any, initSyncData = any,
    treeAction extends ProjectTree = ProjectTree,
    T extends TreeNodeToolSet<ProjectItemResp, state, initData, initSyncData> = TreeNodeToolSet<ProjectItemResp, state, initData, initSyncData>
    > extends BaseTreeFluentAPI<state, initData, initSyncData, ProjectTreeParameter, ProjectItemResp, treeAction, TreeSearchAction<ProjectTreeParameter, TreeSearchResp>, T> {
    getTreeAction = (node?: TreeNode<ProjectItemResp, state>): treeAction => {
        if (node) {
            return this.treeAction.setItemId(node.data.id).setItemType(node.data.item_type);
        }
        return this.treeAction.setRoot();
    };

    protected toNodes = (resp: AxiosResponse<TreeResp<ProjectItemResp>>, parentNode?: TreeNode<ProjectItemResp, state>): TreeNodeProps<ProjectItemResp, state>[]|boolean => {
        if (resp.data.items.length === 0) {
            return false;
        }
        return resp.data.items.map(
            item => getDefaultNode<ProjectItemResp, state>(item, {
                children: item.has_child,
                state: {
                    expanded: false,
                    selected: false,
                    loading: false,
                } as state,
            }) as TreeNodeProps<ProjectItemResp, state>,
        );
    }

    getData = async (node?: TreeNode<ProjectItemResp, state>, matched?: TreeNode<ProjectItemResp, state>[], e?: MouseEvent): Promise<void> => {
        if (node && e) {
            e.stopPropagation();
            if (node.state.expanded) {
                this.ts.setNodeState(node, { expanded: false });
            } else {
                this.ts.setNodeState(node, { expanded: true, loading: true });
            }
            await this.requestTreeData(node);
            this.ts.setNodeState(node, { loading: false });
        } else await this.requestTreeData();
    }

    getSearchPath = async (id: string, type: string): Promise<TreeSearchResp> => {
        const res = await this.treeSearchAction.setItemId(id).setItemType(type).execute();
        return res.data;
    }

    getRecursiveData = async (ids: string[], idx: number, children?: TreeNodeProps<ProjectItemResp, state>[], isFirst = true) => {
        console.debug('recursive data', ids[idx], children, isFirst);
        if (idx < -1) {
            this.ts.metaState.nodes = children || [];
            return;
        }

        const id = ids[idx];
        let itemType;
        if (id) {
            if (id.startsWith('pg')) itemType = 'PROJECT_GROUP';
            else itemType = 'PROJECT';
        }

        const parents = await this.requestTreeSearchData(id, itemType);
        if (children) {
            const attachIdx = findIndex(parents, d => d.data.id === id);
            if (attachIdx !== -1) {
                parents[attachIdx].children = children;
                parents[attachIdx].state = { ...parents[attachIdx].state, expanded: !isFirst, selected: isFirst };
                console.debug('parents[attachIdx]', parents[attachIdx]);
            }
        }

        await this.getRecursiveData(ids, idx - 1, parents, false);
    }

    getSearchData = async (id: string, type: 'PROJECT_GROUP'|'PROJECT' = 'PROJECT'): Promise<void> => {
        const res = await this.getSearchPath(id, type);
        await this.getRecursiveData(res.open_path, res.open_path.length - 1);
    }
}
