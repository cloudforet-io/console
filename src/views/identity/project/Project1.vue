<template>
    <div class="animated fadeIn">
        <project-context-action ref="contextPopUp"
                                :selected-node="getSelectedNodeAndTree"
                                :action-flag="getContextActionFlag"
                                @create="createProjectAndGroup"
                                @update="updateProjectAndGroup"
                                @delete="deleteProjectAndGroup"
        />
        <default-tree
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
                <BaseDragHorizontal>
                    <template #container="{ height }">
                        <PTab :tabs="tabsData.tabs" :active-tab.sync="tabsData.activeTab">
                            <template #details="{tabName}">
                                <keep-alive>
                                    <project-summary-top ref="detailsTop"
                                                         :selected-node="getSelectedNodeAndTree"
                                                         :responsive-style="{'min-height': height/2+'px', 'overflow-y':'auto'}"
                                    />
                                </keep-alive>
                            </template>
                            <template #member="{tabName}">
                                <project-member :selected-node="getSelectedNodeAndTree"
                                                :responsive-style="{'height': height+'px', 'overflow-y':'auto', 'box-shadow': 'none', 'border': 'none'}"
                                />
                            </template>
                        </PTab>
                    </template>
                </BaseDragHorizontal>
                <div>
                    <template v-if="tabsData.activeTab === 'details'">
                        <project-summary-bottom ref="detailsBottom"
                                                :selected-node="getSelectedNodeAndTree"
                        />
                    </template>
                    <template v-else />
                </div>
            </template>
        </default-tree>
    </div>
</template>

<script>
import _ from 'lodash';
import ProjectContext from '@/views/identity/project/modules/ProjectContext';
import DefaultTree from '@/components/organisms/trees/area-tree/AreaTree';
import PTab from '@/components/organisms/tabs/tab/Tab';
import BaseDragHorizontal from '@/components/base/drag/BaseDragHorizontal';

const projectSummaryTop = () => import('@/views/identity/project/modules/ProjectSummaryTop');
const projectSummaryBottom = () => import('@/views/identity/project/modules/ProjectSummaryBottom');
const projectMember = () => import('@/views/identity/project/modules/ProjectMember');
const ProjectContextAction = () => import('@/views/identity/project/modules/ProjectContextAction');

const proEnum = {
    PROJECT: {
        type: 'PROJECT',
        root_able: false,
        accept: [],
        isLeaf: true,
    },
    PROJECT_GROUP: {
        type: 'PROJECT_GROUP',
        root_able: true,
        accept: ['PROJECT_GROUP', 'PROJECT'],
        isLeaf: false,
    },
};

export default {
    name: 'Project',
    components: {
        DefaultTree,
        ProjectContext,
        ProjectContextAction,
        BaseDragHorizontal,
        PTab,
        projectSummaryTop,
        projectSummaryBottom,
        projectMember,
    },
    data() {
        return {
            tabsData: {
                tabs: [
                    { name: 'details', label: 'Details' },
                    { name: 'member', label: 'Member' },
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
                domain_id: sessionStorage.domainId,
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
        pBeforeDropped(node, position, cancel, tree) {
            const srcNode = node[0];
            const srcNodeDT = srcNode.data;
            const targetNodeDT = position.node.data;
            const acceptable = proEnum[targetNodeDT.item_type].accept;
            if (position.node.path.length == 1 && position.placement !== 'inside' && srcNodeDT.item_type === 'PROJECT'
                || !acceptable.includes(srcNodeDT.item_type)) {
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

            const shareParam = this.doTheyShareSameParent(node, position);
            const isCanceled = !!shareParam;

            if (!position.node.data.is_cached) {
                tree.remove(tree.getSelected().map(node => node.path));
                cancel(true);
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
            const url = `/identity/${this.replaceAll(fromItem.item_type, '_', '-').toLowerCase()}/update`;
            const keySrouce = `${fromItem.item_type.toLowerCase()}_id`;
            const keyTo = `${toItem.item_type.toLowerCase()}_id`;
            const param = {};
            param[keySrouce] = fromItem.id;
            param[keyTo] = toItem.id;
            debugger;
            if (node[0].isLeaf) {
                param.project_id = fromItem.id;
                param.project_group_id = toItem.id;
            } else {
                param.project_group_id = fromItem.id;
                param.parent_project_group_id = position.node.path.length == 1 ? 'root' : toItem.id;
                if (position.placement !== 'inside' && toItem.is_root) {
                    param.release_parent_project_group = true;
                }
            }
            await this.$http.post(url, param).then((response) => {
                const responseData = response.data;
                if (!this.isEmpty(responseData)) {
                    console.log('Item successfully moved. ');
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
                // Note: Initialize Project trees and then display only a context, This must be included as well.
                if (this.treeData.length === 1 && !this.isEmpty(this._.get(this.treeData[0], 'data.init'))) {
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

            const param = flag[1] === 'RT' ? { is_root: true, ...paramBasic } : flag[1] === 'PR' ? { parent_project_group_id: nodeData.id, ...paramBasic } : { project_group_id: nodeData.id, ...paramBasic };
            const url = flag[1] === 'PJ' ? 'project' : 'project-group';

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
                }
            }).catch((error) => {
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

            await this.$http.post(url, param).then((response) => {
                if (response.data[key] === nodeData.id) {
                    if (!this.isEmpty(this.$refs.detailsTop)) {
                        this.$refs.detailsTop.setInitData();
                    }
                }
                tree.updateNode(tree.getSelected()[0].path, { title: param.name });
            }).catch((error) => {
                console.error(error);
            });
            this.$refs.contextPopUp.hideModal();
        },
        async deleteProjectAndGroup(flag, tree, nodeData) {
            const path = tree.getSelected().map(node => node.path);
            const url = `/identity/${this.replaceAll(nodeData.item_type, '_', '-').toLowerCase()}/delete`;
            const param = (nodeData.item_type === 'PROJECT_GROUP') ? { project_group_id: nodeData.id } : { project_id: nodeData.id };
            const arg = (nodeData.item_type === 'PROJECT_GROUP') ? this.tr('COMMON.PG_GR') : this.tr('COMMON.PG');

            await this.$http.post(url, param).then((response) => {
                const responseData = response.data;
                if (this.isEmpty(responseData)) {
                    tree.remove(path);
                    this.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: this.tr('IDENTITY.DEL_SUCC_ARG', [arg]),
                        duration: 2000,
                        speed: 1000,
                    });

                    if (this.treeData.length === 1) {
                        this.isInitializing = true;
                        this.treeData = [{
                            title: '! Please, Right Click me',
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
                        text: this.tr('IDENTITY.DEL_FAIL_CHI_ARG', [arg]),
                        duration: 2000,
                        speed: 1000,
                    });
                } else {
                    this.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Fail',
                        text: this.tr('IDENTITY.DEL_FAIL_ARG', [arg]),
                        duration: 2000,
                        speed: 1000,
                    });
                }
            });
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
    },
};
</script>

<style lang="scss" scoped>

</style>
