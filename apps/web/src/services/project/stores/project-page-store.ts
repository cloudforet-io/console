import type { TreeNode } from '@spaceone/design-system/types/data-display/tree/type';
import { reverse } from 'lodash';
import type { _GettersTree } from 'pinia';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ProjectGroupCreateRequestParams } from '@/schema/identity/project-group/api-verbs/create';
import type { ProjectGroupDeleteRequestParams } from '@/schema/identity/project-group/api-verbs/delete';
import type { ProjectGroupListRequestParams } from '@/schema/identity/project-group/api-verbs/list';
import type { ProjectGroupUpdateRequestParams } from '@/schema/identity/project-group/api-verbs/update';
import type { ProjectCreateRequestParams } from '@/schema/identity/project/api-verbs/create';
import type { ProjectModel } from '@/schema/identity/project/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useProjectTree } from '@/services/project/composables/use-project-tree';
import type {
    ProjectGroupTreeNodeData, ProjectTreeNodeData, ProjectGroupTreeItem, ProjectTreeRoot,
} from '@/services/project/types/project-tree-type';


export interface ProjectPageState {
    isInitiated: boolean;

    searchText?: string;

    rootNode?: ProjectTreeRoot|null;
    selectedItem: ProjectGroupTreeItem;
    treeEditMode: boolean;
    permissionInfo: Record<string, boolean>;

    hasProjectGroup?: boolean;
    projectCount?: number;

    actionTargetItem: ProjectGroupTreeItem;
    projectGroupFormVisible: boolean;
    projectGroupFormUpdateMode: boolean;
    projectGroupDeleteCheckModalVisible: boolean;
    projectFormVisible: boolean;

    shouldUpdateProjectList: boolean;
}
type ProjectStoreGetters = _GettersTree<{
    selectedNodeData: ProjectTreeNodeData|undefined;
    selectedNodePath: number[]|undefined;
    groupId: string|undefined;
    groupName: string|undefined;
    actionTargetNodeData: ProjectTreeNodeData|undefined;
    actionTargetNodePath: number[]|undefined;
    parentGroups: ProjectGroupTreeNodeData[];
}> & _GettersTree<ProjectPageState>;

interface ProjectPageAction {
    initRoot: (root: ProjectTreeRoot) => void;
    selectNode: (groupId?: string) => Promise<TreeNode<ProjectTreeNodeData>|null>;
    openProjectGroupCreateForm: (target?: ProjectGroupTreeItem) => void;
    openProjectGroupUpdateForm: (target?: ProjectGroupTreeItem) => void;
    openProjectGroupDeleteCheckModal: (target?: ProjectGroupTreeItem) => void;
    createProjectGroup: (params: ProjectGroupCreateRequestParams) => Promise<void>;
    updateProjectGroup: (params: Partial<ProjectGroupUpdateRequestParams>) => Promise<void>;
    deleteProjectGroup: () => Promise<void>;
    createProject: (params: ProjectCreateRequestParams) => Promise<ProjectModel|undefined>;
    refreshPermissionInfo: () => Promise<void>;
    addPermissionInfo: (permissionInfo: any) => void;
    openProjectCreateForm: (target?: ProjectGroupTreeItem) => void;
    pushPermissionInfo: (permissionInfo: Record<string, boolean>) => void;
    getPermissionInfo: (ids:string[]) => Promise<Record<string, boolean>>;
}

const projectTreeHelper = useProjectTree();
export const useProjectPageStore = defineStore<string, ProjectPageState, ProjectStoreGetters, ProjectPageAction>('project-page', {
    state: () => ({
        isInitiated: false,
        searchText: undefined,
        rootNode: null,
        selectedItem: {} as ProjectGroupTreeItem,
        treeEditMode: false,
        permissionInfo: {},
        hasProjectGroup: undefined,
        projectCount: undefined,
        actionTargetItem: {} as ProjectGroupTreeItem,
        projectGroupFormVisible: false,
        projectGroupFormUpdateMode: false,
        projectGroupDeleteCheckModalVisible: false,
        projectFormVisible: false,
        shouldUpdateProjectList: false,
    }),
    getters: {
        selectedNodeData: (state) => (state.selectedItem.node ? { ...state.selectedItem.node.data } : undefined),
        selectedNodePath: (state) => (state.selectedItem.path ? state.selectedItem.path : undefined),
        groupId() { return this.selectedNodeData?.id; },
        groupName() { return this.selectedNodeData ? this.selectedNodeData.name : undefined; },
        actionTargetNodeData: (state) => (state.actionTargetItem.node ? state.actionTargetItem.node.data : undefined),
        actionTargetNodePath: (state) => (state.actionTargetItem.path ? state.actionTargetItem.path : undefined),
        parentGroups(state) {
            const tree = state.rootNode;
            const path = this.selectedNodePath;
            if (tree && path) {
                const parentItems = path.reduce((parents, d, i) => {
                    if (i + 1 === path.length) return parents;

                    const parentPath = path.slice(0, i + 1);
                    try {
                        const parent = tree.getNodeByPath(parentPath);

                        if (parent) parents.push(parent.data);
                    } catch (e) {}

                    return parents;
                }, []);
                return reverse(parentItems);
            }
            return [];
        },
    },
    actions: {
        initRoot(root) {
            this.rootNode = root;
        },
        async selectNode(groupId?: string) {
            if (!groupId) {
                if (this.rootNode) {
                    this.rootNode.resetSelect();
                }
                return null;
            }

            try {
                const res = await projectTreeHelper.getProjectTreeSearchPath({
                    item_id: groupId,
                    item_type: 'PROJECT_GROUP',
                });
                const paths = res.open_path || [];

                if (this.rootNode && paths.length) {
                    const { node } = await this.rootNode.fetchAndFindNode(paths.map((d) => ((data) => data.id === d)));
                    return node;
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }

            return null;
        },
        openProjectGroupCreateForm(target: ProjectGroupTreeItem = {}) {
            this.actionTargetItem = target;
            this.projectGroupFormUpdateMode = false;
            this.projectGroupFormVisible = true;
        },
        openProjectGroupUpdateForm(target: ProjectGroupTreeItem = {}) {
            this.actionTargetItem = target;
            this.projectGroupFormUpdateMode = true;
            this.projectGroupFormVisible = true;
        },
        openProjectGroupDeleteCheckModal(target: ProjectGroupTreeItem = {}) {
            this.actionTargetItem = target;
            this.projectGroupDeleteCheckModalVisible = true;
        },
        pushPermissionInfo(permissionInfo) {
            this.permissionInfo = { ...this.permissionInfo, ...permissionInfo };
        },
        async createProjectGroup(
            params: ProjectGroupCreateRequestParams,
        ) {
            try {
                const _params: ProjectGroupCreateRequestParams = { ...params };
                if (this.actionTargetNodeData) {
                    _params.parent_group_id = this.actionTargetNodeData.id;
                }
                const res = await SpaceConnector.clientV2.identity.projectGroup.create(_params);

                const newData: ProjectTreeNodeData = {
                    ...params,
                    id: res.project_group_id,
                    item_type: 'PROJECT_GROUP',
                    has_child: false,
                };
                if (this.rootNode) {
                    if (this.actionTargetNodeData) {
                        const targetNode = this.rootNode.getNodeByPath(this.actionTargetNodePath);
                        // fetch child data to show children nodes
                        await this.rootNode.fetchData(targetNode);
                        this.rootNode.unfold(targetNode);
                        // update target node's has_children to show toggle even after toggle is folded
                        this.rootNode.updateNodeByPath(this.actionTargetNodePath, { ...targetNode.data, has_child: true });
                        // update selected item to prevent the case that selected node is updated by fetchData
                        const selectedNode = this.rootNode.getNodeByPath(this.selectedNodePath);
                        this.rootNode.changeSelectState(selectedNode, this.selectedNodePath);
                    } else {
                        this.rootNode.addNode(newData);
                    }
                }
                this.permissionInfo = { ...this.permissionInfo, [res.project_group_id]: true };
                this.pushPermissionInfo({ [res.project_group_id]: true });
                this.hasProjectGroup = true;
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw new Error(e);
            } finally {
                this.actionTargetItem = {};
            }
        },
        async updateProjectGroup(
            params: Partial<ProjectGroupUpdateRequestParams>,
        ) {
            if (!this.rootNode || !this.actionTargetNodeData) return;

            try {
                const _params: ProjectGroupUpdateRequestParams = {
                    project_group_id: this.actionTargetNodeData.id,
                    ...params,
                };

                await SpaceConnector.clientV2.identity.projectGroup.update(_params);

                this.rootNode.updateNodeByPath(
                    this.actionTargetNodePath,
                    { ...this.actionTargetNodeData, ...params },
                );
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.actionTargetItem = {};
            }
        },
        async deleteProjectGroup() {
            if (!this.rootNode || !this.actionTargetNodeData) {
                throw new Error('No Target for deletion');
            }

            const params: ProjectGroupDeleteRequestParams = {
                project_group_id: this.actionTargetNodeData.id,
            };
            await SpaceConnector.clientV2.identity.projectGroup.delete(params);

            this.rootNode.deleteNodeByPath(this.actionTargetNodePath);
            // fetch data to update has child info
            const targetNode = this.rootNode.getNodeByPath(this.actionTargetNodePath);
            await this.rootNode.fetchData(targetNode);

            this.actionTargetItem = {};
        },
        async getPermissionInfo(ids: string[]): Promise<Record<string, boolean>> {
            const permissionApiQueryHelper = new ApiQueryHelper();

            const permissionInfo = {};

            try {
                permissionApiQueryHelper.setOnly('project_group_id')
                    .setFilters([{ k: 'project_group_id', v: ids }]);

                const params: ProjectGroupListRequestParams = {
                    query: permissionApiQueryHelper.data,
                };
                const { results } = await SpaceConnector.clientV2.identity.projectGroup.list(params);

                results.forEach((d) => {
                    permissionInfo[d.project_group_id] = true;
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
            return permissionInfo;
        },
        async createProject(
            params: ProjectCreateRequestParams,
        ):Promise<ProjectModel|undefined> {
            try {
                const res = await SpaceConnector.clientV2.identity.project.create(params);
                showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '');
                this.shouldUpdateProjectList = true;

                if (this.treeEditMode) {
                    const newData: ProjectTreeNodeData = {
                        name: params.name,
                        id: res.project_id,
                        item_type: 'PROJECT',
                        has_child: false,
                    };
                    if (this.rootNode) {
                        if (this.selectedNodeData) {
                            this.rootNode.addChildNodeByPath(this.selectedNodePath, newData);
                        }
                    }

                    this.pushPermissionInfo({ [res.project_id]: true });
                }
                return res;
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'));
                throw new Error(e);
            }
        },
        async refreshPermissionInfo(ids?: string[]): Promise<void> {
            let refreshPermissionInfoLoading;
            if (refreshPermissionInfoLoading) return;

            const projectGroupIds = ids || Object.keys(this.permissionInfo);
            if (!projectGroupIds.length) return;

            refreshPermissionInfoLoading = true;

            try {
                const permissionInfo = await this.getPermissionInfo(projectGroupIds);

                if (ids) this.pushPermissionInfo(permissionInfo);
                else this.permissionInfo = permissionInfo;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                refreshPermissionInfoLoading = false;
            }
        },
        async addPermissionInfo(ids: string[]): Promise<void> {
            let addPermissionInfoLoading;
            if (addPermissionInfoLoading) return;

            const projectGroupIds = ids.filter((id) => this.permissionInfo[id] === undefined);
            if (!projectGroupIds.length) return;

            addPermissionInfoLoading = true;

            try {
                const permissionInfo = await this.getPermissionInfo(projectGroupIds);
                this.pushPermissionInfo(permissionInfo);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                addPermissionInfoLoading = false;
            }
        },
        openProjectCreateForm(projectGroup: ProjectGroupTreeItem = {}) {
            this.actionTargetItem = projectGroup;
            this.projectFormVisible = true;
        },
    },
});
