/* eslint-disable camelcase,@typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import { DynamicAPI } from '@/lib/api/toolset';
// @ts-ignore
import { ResourceActions, TreeAction } from '@/lib/fluent-api/toolset';
import {
    TreeNodeToolSet,
    getDefaultNode,
    BaseNodeStateType, TreeNodeProps, TreeNode, InitTreeNodeProps,
} from '@/components/molecules/tree/PTreeNode.toolset';
import { TreeResp, TreeSearchAction } from '@/lib/fluent-api';
import {
    ProjectItemResp, ProjectTree, ProjectTreeParameter, TreeSearchResp,
} from '@/lib/fluent-api/identity/project';
import { find } from 'lodash';


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

    protected requestTreeSearchData = async (id?: string, type?: string): Promise<TreeNodeProps<resp, state>[]|boolean> => {
        try {
            let res;
            if (id && type) res = await this.treeAction.setItemId(id).setItemType(type).execute();
            else res = await this.treeAction.setRoot().execute();
            return this.toNodes(res);
        } catch (e) {
            console.error(e);
            return false;
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

    getRecursiveData = async (ids: string[], idx = ids.length - 1, parent?: TreeNodeProps<ProjectItemResp, state>): Promise<TreeNodeProps<ProjectItemResp, state>[]|boolean> => {
        // if (ids.length === idx) {
        //     this.ts.metaState.nodes = parents || [];
        //     return;
        // }

        // const isLeaf = idx === ids.length - 1;
        // const id = ids[idx];
        //
        // if (parents) {
        //     const children = isLeaf ? false
        //         : await this.requestTreeSearchData(id, id.startsWith('pg') ? 'PROJECT_GROUP' : 'PROJECT');
        //
        //     const itemIdx = findIndex(parents, d => d.data.id === id);
        //     if (itemIdx !== -1) {
        //         parents[itemIdx].children = children;
        //         parents[itemIdx].state = { ...parents[itemIdx].state, expanded: !isLeaf, selected: isLeaf };
        //     }
        //     await this.getRecursiveData(ids, idx + 1, Array.isArray(children) ? children : []);
        // } else { // Root case
        //     const children = await this.requestTreeSearchData(undefined, 'ROOT');
        //     await this.getRecursiveData(ids, idx + 1, Array.isArray(children) ? children : []);
        // }


        if (parent) {
            // Leaf case - end
            if (idx === ids.length - 1) {
                parent.state.selected = true;
                return parent.children;
            }
            const items = await this.requestTreeSearchData(ids[idx], 'PROJECT_GROUP');
            parent.state.expanded = !!items;
            if (Array.isArray(items)) {
                const item = find(items, d => d.data.id === ids[idx]);
                parent.children = await this.getRecursiveData(ids, idx + 1, item);
            }
            return items;
        }

        // Root case - start
        const items = await this.requestTreeSearchData(undefined, 'ROOT') as TreeNodeProps<ProjectItemResp, state>[];
        const item = find(items, d => d.data.id === ids[idx]);
        if (item) {
            item.children = await this.getRecursiveData(ids, idx + 1, item);
        }
        return items;
    }

    getSearchData = async (id: string, type: 'PROJECT_GROUP'|'PROJECT' = 'PROJECT'): Promise<void> => {
        const res = await this.getSearchPath(id, type);
        this.ts.metaState.nodes = await this.getRecursiveData(res.open_path) as TreeNodeProps<ProjectItemResp, state>[];
    }
}
