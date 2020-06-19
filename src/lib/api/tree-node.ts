/* eslint-disable camelcase,@typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios';
import { DynamicAPI } from '@/lib/api/toolset';
// @ts-ignore
import { ResourceActions, TreeAction } from '@/lib/fluent-api/toolset';
import {
    TreeNodeToolSet,
    getDefaultNode,
    BaseNodeStateType, TreeNodeProps, TreeItem, InitTreeNode, TreeNode, getTreeItem,
} from '@/components/molecules/tree/PTreeNode.toolset';
import { TreeResp, TreeSearchAction } from '@/lib/fluent-api';
import {
    ProjectItemResp, ProjectTree, ProjectTreeParameter, TreeSearchResp,
} from '@/lib/fluent-api/identity/project';
import { find, findIndex, isEqual } from 'lodash';
import { computed, reactive, watch } from '@vue/composition-api';
import Vue from 'vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { tree } from '@/lib/api/index';
import { isNotEmpty } from '@/lib/util';
import { pushRouterQuery, RouterAPIToolsetInterface } from '@/lib/router-query-string';
import { DefaultQSGridQSPropsName, makeQSGridQSProps } from '@/lib/api/grid';
import Tree from '@/components/molecules/tree-origin/Tree.vue';


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

    protected abstract toNodes: (data: AxiosResponse<TreeResp<resp>>) => TreeNode<resp, state>[]|boolean;

    protected requestTreeData = async (node?: TreeNode<resp, state>): Promise<TreeNode<resp, state>[]|boolean> => {
        try {
            const res: AxiosResponse<TreeResp<resp>> = await this.getTreeAction(node).execute();
            return this.toNodes(res);
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    protected requestTreeSearchData = async (id?: string, type?: string): Promise<TreeNode<resp, state>[]|boolean> => {
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

    abstract defaultGetData: (node: TreeItem<resp, state>, matched: TreeItem<resp, state>[], e: MouseEvent) => Promise<void>;

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

    protected toNodes = (resp: AxiosResponse<TreeResp<ProjectItemResp>>): TreeNode<ProjectItemResp, state>[]|boolean => {
        if (resp.data.items.length === 0) {
            return false;
        }
        return resp.data.items.map((item) => {
            const res = getDefaultNode<ProjectItemResp, state>(item, {
                children: item.has_child,
                state: {
                    expanded: false,
                    selected: false,
                    loading: false,
                } as state,
            });
            return res;
        });
    }

    protected resetSelectedNode = (item: TreeItem<ProjectItemResp, state>, compare?: TreeItem<ProjectItemResp, state>) => {
        if (compare) {
            if (compare.node.data.id === item.node.data.id) {
                this.ts.metaState.selectedNodes = [item];
                item.node.state.selected = true;
            } else if (compare.parent) this.resetSelectedNode(item, compare.parent);
        } else {
            if (!this.ts.metaState.firstSelectedNode) return;
            if (!this.ts.metaState.firstSelectedNode.parent) return;
            if (this.ts.metaState.firstSelectedNode.level <= item.level) return;
            this.resetSelectedNode(item, this.ts.metaState.firstSelectedNode.parent);
        }
    }

    toggle = async (item: TreeItem<ProjectItemResp, state>, matched: TreeItem<ProjectItemResp, state>[], e: MouseEvent): Promise<void> => {
        e.stopPropagation();
        if (item.node.state.expanded) {
            this.resetSelectedNode(item);
            item.node.state.expanded = false;
            this.ts.applyState(item);
            item.node.children = !!item.node.children;
            return;
        }

        await this.getData(item);
    }

    defaultGetData = async (item?: TreeItem<ProjectItemResp, state>): Promise<void> => {
        if (item) {
            item.node.state.expanded = true;
            item.node.state.loading = true;
            this.ts.applyState(item);

            item.node.children = await this.requestTreeData(item.node);

            item.node.state.loading = false;
            this.ts.applyState(item);
        } else {
            const res = await this.requestTreeData();
            this.ts.metaState.nodes = Array.isArray(res) ? res : [];
        }
    }

    getData = async (item?: TreeItem<ProjectItemResp, state>): Promise<void> => {
        await this.defaultGetData(item);
    }

    getSearchPath = async (id: string, type: string): Promise<TreeSearchResp> => {
        const res = await this.treeSearchAction.setItemId(id).setItemType(type).execute();
        return res.data;
    }

    getRecursiveData = async (ids: string[], idx = 0, parent?: TreeItem<ProjectItemResp, state>): Promise<TreeNode<ProjectItemResp, state>[]|boolean> => {
        if (parent) {
            // Leaf case - end
            if (idx === ids.length - 1) {
                parent.node.state.selected = true;
                this.ts.metaState.selectedNodes = [parent];
                return parent.node.children;
            }

            const children = await this.requestTreeSearchData(ids[idx], parent.node.data.item_type);
            if (Array.isArray(children)) {
                const key = findIndex(children, d => d.data.id === ids[idx + 1]);
                if (key !== -1) {
                    const nextParent = getTreeItem(key, idx + 1, children[key]);
                    nextParent.node.children = await this.getRecursiveData(ids, idx + 1, nextParent);
                    nextParent.node.state.expanded = !!nextParent.node.children;
                }
            }
            return children;
        }

        // Root case - start
        const rootItems = await this.requestTreeSearchData(undefined, 'ROOT') as TreeNodeProps<ProjectItemResp, state>[];
        const itemIdx = findIndex(rootItems, d => d.data.id === ids[idx]);
        if (itemIdx !== -1) {
            const item = getTreeItem(itemIdx, 0, rootItems[itemIdx]);
            item.node.children = await this.getRecursiveData(ids, idx, item);
            item.node.state.expanded = !!item.node.children;
        }
        return rootItems;
    }

    getSearchData = async (id: string, type: 'PROJECT_GROUP'|'PROJECT' = 'PROJECT'): Promise<void> => {
        const res = await this.getSearchPath(id, type);
        this.ts.metaState.nodes = await this.getRecursiveData(res.open_path) as TreeNodeProps<ProjectItemResp, state>[];
    }
}

interface TreeQSNameType {
    select: string;
    search: string;
}

export enum DefaultTreeQSPropsName {
    select = 't_se',
    search = 't_sc',
}

export const makeTreeQSProps = (names: TreeQSNameType) => ({
    [names.select]: {
        type: String,
        default: null,
    },
    [names.search]: {
        type: String,
        default: null,
    },
});

export const DefaultQSTreeProps = makeTreeQSProps(DefaultTreeQSPropsName);

export class RouteProjectTreeFluentAPI<
    state extends ProjectNodeState = ProjectNodeState,
    initData = any, initSyncData = any,
    treeAction extends ProjectTree = ProjectTree,
    T extends TreeNodeToolSet<ProjectItemResp, state, initData, initSyncData> = TreeNodeToolSet<ProjectItemResp, state, initData, initSyncData>
    > extends ProjectTreeFluentAPI<state, initData, initSyncData, treeAction, T> implements RouterAPIToolsetInterface {
    constructor(
        treeActions: TreeApiActions<treeAction, TreeSearchAction<ProjectTreeParameter, TreeSearchResp>>,
        initData: initData = {} as initData,
        public vm: Vue|ComponentInstance,
        public qsName: TreeQSNameType = DefaultTreeQSPropsName,
        public isReady = false,
    ) {
        super(treeActions, initData);
        watch(() => this.ts.metaState.firstSelectedNode, async (aft, bef) => {
            if (aft && !isEqual(aft.node.data.id, bef?.node.data.id)) {
                await this.routerPush();
            }
        });
    }

    applyAPIRouter = (props: TreeQSNameType) => {
        const select = props[this.qsName.select];
        const search = props[this.qsName.search];
        // if (isNotEmpty(select)) {
        //     this.ts.metaState.selectedNodes = select;
        // }
        this.isReady = true;
    };

    applyDisplayRouter = async (props: TreeQSNameType) => {
        const pgId = props[this.qsName.select];
        if (pgId) {
            await this.getSearchData(pgId, 'PROJECT_GROUP');
            if (this.ts.metaState.firstSelectedNode) this.ts.setNodeState(this.ts.metaState.firstSelectedNode, { expanded: false });
        } else {
            await this.defaultGetData();
            if (this.ts.metaState.nodes[0]) {
                const item = getTreeItem(0, 0, this.ts.metaState.nodes[0]);
                this.ts.metaState.selectedNodes = [item];
                this.ts.setNodeState(item, { selected: true });
            }
        }
    }

    routerPush = async () => {
        const query = {
            ...this.vm.$route.query,
            [this.qsName.select]: this.ts.metaState.firstSelectedNode?.node.data.id,
        };
        await pushRouterQuery(this.vm, query);
    }

    getData = async (item?: TreeItem<ProjectItemResp, state>): Promise<void> => {
        if (this.isReady) {
            await this.defaultGetData(item);
            await this.routerPush();
        }
    }
}
