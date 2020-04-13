<template>
    <div class="animated fadeIn">
        <p-table-check-modal
            v-if="!!checkTableModalState.mode"
            :visible.sync="checkTableModalState.visible"
            :header-title="checkTableModalState.title"
            :sub-title="checkTableModalState.subTitle"
            :theme-color="checkTableModalState.themeColor"
            :fields="checkTableModalState.fields"
            :centered="true"
            :selectable="false"
            :items="checkTableModalState.item"
            @confirm="deleteActionProcess"
        />
        <project-context-action ref="contextPopUp"
                                :selected-node="getSelectedNodeAndTree"
                                :action-flag="getContextActionFlag"
                                @create="createProjectAndGroup"
                                @update="updateProjectAndGroup"
                                @delete="deleteProjectAndGroup"
        />
        <area-tree
            ref="ProjectTree"
            :tree-data="treeData"
            :show-tree="displayTree"
            :context-init="isInitializing"
            :no-select-m-s-g="noSelectMessage"
            :context-menu-visible.sync="isContextMenuVisible"
            @DTNodeClicked="pNodeClicked"
            @DTNodeToggled="pNodeToggled"
            @DTBeforeDropped="pBeforeDropped"
            @DTContextVisible="pContextVisible"
        >
            <template #context>
                <project-context
                    :context-data="getSelectedData"
                    @executeContext="contextMenuOnAction"
                />
            </template>
            <template #treeSubPanel>
                <horizontal-layout>
                    <template #container="{ height }">
                        <PTab :tabs="tabsData.tabs" :active-tab.sync="tabsData.activeTab">
                            <template #details="{tabName}">
                                <project-summary-top ref="detailsTop"
                                                     :selected-node="getSelectedNodeAndTree"
                                                     :responsive-style="{'height': height+'px', 'overflow-y':'auto'}"
                                />
                            </template>
                            <template #member="{tabName}">
                                <project-member :tab-basic-height="height"
                                                :selected-node="getSelectedNodeAndTree"
                                />
                            </template>
                        </PTab>
                    </template>
                </horizontal-layout>
                <div>
                    <template v-if="tabsData.activeTab === 'details'">
                        <project-summary-bottom v-if="getSelectedNodeType" ref="detailsBottom"
                                                :selected-node="getSelectedNodeAndTree"
                        />
                    </template>
                    <template v-else />
                </div>
            </template>
        </area-tree>
    </div>
</template>

<script>
import _ from 'lodash';
import ProjectContext from '@/views/identity/project/origin/ProjectContext';
import AreaTree from '@/components/organisms/trees/area-tree/AreaTree';
import PTab from '@/components/organisms/tabs/tab/Tab';
import HorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout';
import { makeTrItems } from '@/lib/view-helper';

const projectSummaryTop = () => import('@/views/identity/project/origin/ProjectSummaryTop');
const projectSummaryBottom = () => import('@/views/identity/project/origin/ProjectSummaryBottom');
const projectMember = () => import('@/views/identity/project/origin/ProjectMember');
const ProjectContextAction = () => import('@/views/identity/project/origin/ProjectContextAction');
const PTableCheckModal = () => import('@/components/organisms/modals/action-modal/ActionConfirmModal');

export default {
    name: 'Project',
    components: {
        AreaTree,
        ProjectContext,
        PTableCheckModal,
        ProjectContextAction,
        HorizontalLayout,
        PTab,
        projectSummaryTop,
        projectSummaryBottom,
        projectMember,
    },
    data() {
        return {
            tabsData: {
                tabs: [
                    { name: 'details', label: 'Details', keepAlive: true },
                    { name: 'member', label: 'Member', keepAlive: true },
                ],
                activeTab: 'details',
            },
            noSelectMessage: ['IDENTITY.NO_PROJECT_SEL', 'IDENTITY.NO_PROJECT_SEL_DT'],
            displayTree: false,
            treeData: [],
            selectedData: {},
            selectedNodeData: null,
            isInitializing: false,
            contextItem: null,
            contextActionFlag: null,
            isContextMenuVisible: false,
            multiSelectFields: null,
            checkTableModalState: {
                deleteParam: {
                    flag: null,
                    tree: null,
                    nodeData: null,
                },
                fields: null,
                visible: false,
                mode: '',
                item: null,
                confirmEventName: '',
                title: '',
                subTitle: '',
                themeColor: '',
            },
        };
    },
    computed: {
        getContext() {
            return this.contextItem;
        },
        getContextActionFlag() {
            return this.contextActionFlag;
        },
        getSelectedData() {
            return this.contextItem;
        },
        getSelectedNodeAndTree() {
            return this.selectedNodeData;
        },
        getSelectedNodeType() {
            return (this.isEmpty(this.selectedNodeData)) ? false : this.selectedNodeData.node.data.item_type === 'PROJECT';
        },
    },
    created() {
        this.listProject();
    },
    methods: {
        pNodeClicked(node, tree) {
            this.selectedNodeData = { node, tree };
        },
        async pNodeToggled(node, tree) {
            let childrenNode = [];
            const url = '/identity/project/tree';
            const selected = this.isEmpty(tree.getSelected()[0]) ? node : tree.getSelected()[0];
            const { path } = selected;
            const dataParam = node.data;
            dataParam.is_cached = true;
            const param = {
                item_type: 'PROJECT_GROUP',
                item_id: _.get(node, 'data.id'),
                domain_id: this.$ls.domain.state.domainId,
            };
            await this.$http.post(url, param).then((response) => {
                childrenNode = this.getSelectedNodeArr(response.data.items, 'PROJECT');
                tree.updateNode(path, { data: dataParam });
                if (!this.isEmpty(childrenNode)) {
                    childrenNode.forEach((curItem) => {
                        tree.insert({ node: selected, placement: 'inside' }, curItem);
                    });
                }
            }).catch((error) => {
                console.error(error);
            });
        },
        isValidMove(node, position) {
            const placementTo = _.get(position, 'placement');
            const targetNodeType = _.get(position, 'node.data.item_type');
            const sourceNodeItemType = _.get(node[0], 'data.item_type');
            if (position.node.path.length === 1 && placementTo !== 'inside' && sourceNodeItemType === 'PROJECT') {
                return false;
            } if (sourceNodeItemType === 'PROJECT_GROUP' && placementTo === 'inside' && targetNodeType === 'PROJECT') {
                return false;
            } if (sourceNodeItemType === 'PROJECT' && placementTo === 'inside' && targetNodeType === 'PROJECT') {
                return false;
            }
            return true;
        },
        isSkipAble(node, position) {
            if (position.node.path.length === 1 && position.placement !== 'inside') {
                return true;
            } if (position.node.data.item_type && position.placement !== 'inside') {
                return true;
            }
            return true;
        },
        pBeforeDropped(node, position, cancel, tree) {
            if (!this.isValidMove(node, position)) {
                this.$notify({
                    group: 'noticeBottomLeft',
                    type: 'alert',
                    title: 'Fail',
                    text: 'Not allowed action ',
                    duration: 2000,
                    speed: 1000,
                });
                cancel(true);
                return;
            }

            const isCanceled = this.doTheyShareSameParent(node, position);
            if (!position.node.data.is_cached) {
                if (!this.isSkipAble(node, position)) {
                    tree.remove(tree.getSelected().map(node => node.path));
                    cancel(true);
                }
            }
            this.moveProject(
                node,
                position,
                tree,
                cancel,
                isCanceled,
            );
        },
        async moveProject(node, position, tree, cancel, isCanceled) {
            const fromItem = node[0].data;
            const toItem = position.node.data;
            const param = {};
            const url = `/identity/${this.replaceAll(fromItem.item_type, '_', '-').toLowerCase()}/update`;

            const keySource = `${fromItem.item_type.toLowerCase()}_id`;
            const keyTo = fromItem.item_type === 'PROJECT_GROUP' ? 'parent_project_group_id' : `${toItem.item_type.toLowerCase()}_id`;
            param[keySource] = fromItem.id;
            param[keyTo] = toItem.item_type === 'PROJECT' ? tree.getNode(_.take(position.node.path, position.node.path.length - 1)).data.id : toItem.id;

            if (fromItem.item_type === 'PROJECT_GROUP' && position.placement !== 'inside' && position.node.level === 1) {
                param.release_parent_project_group = true;
            }

            await this.$http.post(url, param).then((response) => {
                const responseData = response.data;
                if (!this.isEmpty(responseData)) {
                    console.debug('Item successfully moved. ');
                }
            }).catch((error) => {
                console.error(error);
            });

            if (!position.node.data.is_cached) {
                if (isCanceled) {
                    position.node.path[position.node.path.length - 1] = position.node.path[position.node.path.length - 1] - 1;
                    tree.select(position.node.path, { addToSelection: false });
                }
                tree.updateNode(position.node.path, { isExpanded: true });
                this.pNodeToggled(position.node, tree);
            }
        },
        doTheyShareSameParent(fromNode, toNode) {
            let isNeedToProcessOnSC = false;
            if (!toNode.node.data.is_cached) {
                const sourceNode_path = JSON.parse(JSON.stringify(fromNode[0].path));
                const toNode_path = JSON.parse(JSON.stringify(toNode.node.path));
                if (sourceNode_path.length === toNode_path.length) {
                    sourceNode_path.pop();
                    toNode_path.pop();
                    if (JSON.stringify(sourceNode_path) === JSON.stringify(toNode_path)) {
                        isNeedToProcessOnSC = true;
                    }
                }
            }
            return isNeedToProcessOnSC;
        },
        pContextVisible(node, event, hasClicked, tree) {
            const actionOBJ = {
                node, event, hasClicked, tree,
            };
            this.selectedNodeData = { node, tree };
            this.contextItem = actionOBJ;
        },
        async contextMenuOnAction(actionFlag) {
            this.contextActionFlag = actionFlag;
            this.$refs.contextPopUp.showModal(actionFlag);
        },
        async listProject() {
            await this.$http.post('/identity/project/tree', {
                item_type: 'ROOT',
                sort: {
                    key: 'name',
                },
            }).then((response) => {
                const responseData = this.treeDataHandler(response.data, 'PROJECT');
                this.treeData = responseData;

                if (response.data.items.length > 0) {
                    this.$refs.ProjectTree._data.isDataExists = true;
                }

                // Note: Initialize Project trees and then display only a context, This must be included as well.
                if (this.treeData.length === 1 && !this.isEmpty(_.get(this.treeData[0], 'data.init'))) {
                    this.isInitializing = true;
                }
            }).catch((error) => {
                console.error(error);
            });
            this.displayTree = true;
        },
        async createProjectAndGroup(flag, tree, nodeData) {
            const paramBasic = {
                name: this.$refs.contextPopUp._data.textInput.name,
                tags: this.$refs.contextPopUp._data.tagInput.tags,
            };

            // eslint-disable-next-line no-nested-ternary
            const param = flag[1] === 'RT' ? { is_root: true, ...paramBasic } : flag[1] === 'PR' ? { parent_project_group_id: nodeData.id, ...paramBasic } : { project_group_id: nodeData.id, ...paramBasic };
            const url = flag[1] === 'PJ' ? 'project' : 'project-group';
            const arg = flag[1] === 'PJ' ? this.$t('COMMON.PROJECT') : this.$t('COMMON.PROJECT_GRP');

            await this.$http.post(`/identity/${url}/create`, param).then((response) => {
                const responseData = !this.isEmpty(response.data) ? response.data : {};
                if (!this.isEmpty(responseData)) {
                    const placement = flag[1] === 'RT' ? 'after' : 'inside';
                    const InitializingData = {
                        id: !this.isEmpty(responseData.project_group_id) ? responseData.project_group_id : responseData.project_id,
                        item_type: !this.isEmpty(responseData.project_group_id) ? 'PROJECT_GROUP' : 'PROJECT',
                        is_root: !this.isEmpty(responseData.is_root) ? responseData.is_root : false,
                        name: param.name,
                    };

                    const newNode = this.getSelectedNode(InitializingData, 'PROJECT');

                    if (flag[1] !== 'RT') {
                        this.applyActionOnScreen(tree, { node: newNode, placement });
                    } else {
                        tree.insert({ node: tree.getSelected()[0], placement }, newNode);
                    }
                    if (this.isInitializing) {
                        tree.remove([tree.getFirstNode()].map(node => node.path));
                        this.isInitializing = false;
                    }
                    this.$refs.ProjectTree._data.isDataExists = true;

                    this.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: this.$t('IDENTITY.CRT_SUCC_ARG', [arg]),
                        duration: 2000,
                        speed: 1000,
                    });
                }
            }).catch((error) => {
                this.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: this.$t('IDENTITY.CRT_FAIL_ARG', [arg]),
                    duration: 2000,
                    speed: 1000,
                });
                console.error(error);
            });
            this.$refs.contextPopUp.hideModal();
        },
        async updateProjectAndGroup(flag, tree, nodeData) {
            const basicParam = {
                name: this.$refs.contextPopUp._data.textInput.name,
                tags: this.$refs.contextPopUp._data.tagInput.tags,
            };

            const key = `${nodeData.item_type.toLowerCase()}_id`;
            const url = `/identity/${this.replaceAll(nodeData.item_type, '_', '-').toLowerCase()}/update`;
            const param = (nodeData.item_type === 'PROJECT_GROUP') ? { project_group_id: nodeData.id, ...basicParam } : { project_id: nodeData.id, ...basicParam };
            const arg = flag[1] === 'PJ' ? this.$t('COMMON.PROJECT') : this.$t('COMMON.PROJECT_GRP');

            await this.$http.post(url, param).then((response) => {
                if (response.data[key] === nodeData.id) {
                    if (!this.isEmpty(this.$refs.detailsTop)) {
                        this.$refs.detailsTop.setInitData();
                    }
                }
                tree.updateNode(tree.getSelected()[0].path, { title: param.name });
                this.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'Success',
                    text: this.$t('IDENTITY.UPT_SUCC_ARG', [arg]),
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                this.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: this.$t('IDENTITY.UPT_FAIL_ARG', [arg]),
                    duration: 2000,
                    speed: 1000,
                });
                console.error(error);
            });
            this.$refs.contextPopUp.hideModal();
        },
        deleteProjectAndGroup(flag, tree, nodeData) {
            nodeData.name = tree.getSelected()[0].title;
            this.checkTableModalState.deleteParam = {
                flag,
                tree,
                nodeData,
            };
            const targetIdentity = flag[1] === 'PR' ? 'Project group' : 'Project';
            this.checkTableModalState.mode = 'delete';
            this.checkTableModalState.title = `Delete ${targetIdentity}`;
            this.checkTableModalState.subTitle = `Are you sure you want to delete selected ${targetIdentity} below?`;
            this.checkTableModalState.themeColor = 'alert';
            this.checkTableModalState.item = [nodeData];
            this.checkTableModalState.visible = true;
            this.checkTableModalState.fields = makeTrItems([
                ['id', 'COMMON.ID', { style: { width: '400px' } }],
                ['name', 'COMMON.NAME', { style: { width: '600px' } }],
            ],
            this.$parent);
        },
        async deleteActionProcess() {
            const tree = this.checkTableModalState.deleteParam.tree;
            const nodeData = this.checkTableModalState.deleteParam.nodeData;

            const path = tree.getSelected().map(node => node.path);
            const url = `/identity/${this.replaceAll(nodeData.item_type, '_', '-').toLowerCase()}/delete`;
            const param = (nodeData.item_type === 'PROJECT_GROUP') ? { project_group_id: nodeData.id } : { project_id: nodeData.id };
            const arg = (nodeData.item_type === 'PROJECT_GROUP') ? this.$t('COMMON.PROJECT_GRP') : this.$t('COMMON.PROJECT');

            await this.$http.post(url, param).then((response) => {
                const responseData = response.data;
                if (this.isEmpty(responseData)) {
                    tree.remove(path);
                    this.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: this.$t('IDENTITY.DEL_SUCC_ARG', [arg]),
                        duration: 2000,
                        speed: 1000,
                    });

                    this.$refs.ProjectTree._data.hasSelected = false;

                    if (_.isEmpty(tree.getNode([0]))) {
                        this.isInitializing = true;
                        this.$refs.ProjectTree._data.isDataExists = false;
                        this.treeData = [{
                            title: 'Right-click on your mouse to create a new project group.',
                            isLeaf: true,
                            data: {
                                init: true,
                            },
                        }];
                    }
                }
            }).catch((error) => {
                if (error.code.includes('ERROR_EXIST_CHILD')) {
                    this.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Fail',
                        text: this.$t('IDENTITY.DEL_FAIL_CHI_ARG', [arg]),
                        duration: 2000,
                        speed: 1000,
                    });
                } else {
                    this.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Fail',
                        text: this.$t('IDENTITY.DEL_FAIL_ARG', [arg]),
                        duration: 2000,
                        speed: 1000,
                    });
                }
            });
            this.clearModalData();
        },
        async applyActionOnScreen(tree, data) {
            const selected = tree.getSelected()[0];
            const { path } = selected;
            if (!selected.isExpanded) {
                if (selected.data.is_cached) {
                    tree.insert({ node: tree.getSelected()[0], placement: data.placement }, data.node);
                    tree.updateNode(path, { isExpanded: true });
                } else {
                    this.pNodeToggled(selected, tree);
                    tree.updateNode(path, { isExpanded: true });
                }
            } else {
                tree.insert({ node: tree.getSelected()[0], placement: data.placement }, data.node);
            }
        },
        clearModalData() {
            this.checkTableModalState = {
                deleteParam: {
                    flag: null,
                    tree: null,
                    nodeData: null,
                },
                fields: null,
                visible: false,
                mode: '',
                item: null,
                confirmEventName: '',
                title: '',
                subTitle: '',
                themeColor: '',
            };
        },
    },
};
</script>

<style lang="postcss" scoped>

</style>
