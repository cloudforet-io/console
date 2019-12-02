<template>
    <div class="animated fadeIn">
        <data-center-context-action ref="contextPopUp"
                                    :selected-node="getSelectedNodeAndTree"
                                    :action-flag="getContextActionFlag"
                                    @create="createProjectAndGroup"
                                    @update="updateProjectAndGroup"
                                    @delete="deleteProjectAndGroup"
        />
        <area-tree
            ref="DataCenterTree"
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
            <template slot="icon" slot-scope="node">
                <span v-if="!node.data.init" class="item-icon">
                    <p-i v-if="node.data.item_type === 'REGION'"
                         :color="'transparent inherit'"
                         :width="'1rem'"
                         :height="'1rem'"
                         :name="'ic_tree_globe'"
                    />
                    <p-i v-else-if="node.data.item_type == 'ZONE'"
                         :color="'transparent inherit'"
                         :width="'1rem'"
                         :height="'1rem'"
                         :name="'ic_tree_zone'"
                    />
                    <p-i v-else
                         :color="'transparent inherit'"
                         :width="'1rem'"
                         :height="'1rem'"
                         :name="'ic_tree_pool'"
                    />
                </span>
            </template>
            <template #context>
                <data-center-context
                    :context-data="getSelectedData"
                    @executeContext="contextMenuOnAction"
                />
            </template>
            <template #treeSubPanel>
                <horizontal-layout>
                    <template #container="{ height }">
                        <PTab :tabs="tabsData.tabs" :active-tab.sync="tabsData.activeTab">
                            <template #details="{tabName}">
                                <data-center-summary-top ref="detailsTop"
                                                         :selected-node="getSelectedNodeAndTree"
                                                         :responsive-style="{'height': height-100+'px', 'overflow-y':'auto'}"
                                />
                            </template>
                            <template #member="{tabName}">
                                <data-center-admin :tab-basic-height="height"
                                                   :selected-node="getSelectedNodeAndTree"
                                />
                            </template>
                        </PTab>
                    </template>
                </horizontal-layout>
                <div>
                    <template v-if="tabsData.activeTab === 'details'">
                        <data-center-summary-bottom v-if="getSelectedNodeType" ref="detailsBottom"
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
import PI from '@/components/atoms/icons/PI';
import AreaTree from '@/components/organisms/trees/area-tree/AreaTree';
import PTab from '@/components/organisms/tabs/tab/Tab';
import HorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout';

const DataCenterSummaryTop = () => import('@/views/inventory/data-center/modules/DataCenterSummaryTop');
const DataCenterSummaryBottom = () => import('@/views/inventory/data-center/modules/DataCenterSummaryBottom');
const DataCenterAdmin = () => import('@/views/inventory/data-center/modules/DataCenterAdmin');
const DataCenterContextAction = () => import('@/views/inventory/data-center/modules/DataCenterContextAction');
const DataCenterContext = () => import('@/views/inventory/data-center/modules/DataCenterContext');

export default {
    name: 'Project',
    components: {
        PI,
        AreaTree,
        HorizontalLayout,
        PTab,
        DataCenterSummaryTop,
        DataCenterSummaryBottom,
        DataCenterAdmin,
        DataCenterContextAction,
        DataCenterContext,


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
            noSelectMessage: ['INVENTORY.NO_DT_CEN_SEL', 'INVENTORY.NO_DT_CEN_DT'],
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
        getSelectedNodeType() {
            return (this.isEmpty(this.selectedNodeData)) ? false : this.selectedNodeData.node.data.item_type === 'PROJECT';
        },
    },
    created() {
        this.listDataCenter();
    },
    methods: {
        pNodeClicked(node, tree) {
            this.selectedNodeData = { node, tree };
        },
        async pNodeToggled(node, tree) {
            let childrenNode = [];
            const url = '/inventory/data-center/tree';
            const selected = this.isEmpty(tree.getSelected()[0]) ? node : tree.getSelected()[0];
            const { path } = selected;
            const dataParam = node.data;
            dataParam.is_cached = true;
            const param = {
                item_type: _.get(node, 'data.item_type'),
                // eslint-disable-next-line camelcase
                item_id: _.get(node, 'data.id'),
                domain_id: sessionStorage.domainId,
            };
            await this.$http.post(url, param).then((response) => {
                childrenNode = this.getSelectedNodeArr(response.data.items, 'DATA_CENTER');
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
        async listDataCenter() {
            await this.$http.post('/inventory/data-center/tree', {
                item_type: 'ROOT',
                sort: {
                    key: 'name',
                },
            }).then((response) => {
                const responseData = this.treeDataHandler(response.data, 'DATA_CENTER');
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
  #scrollspy-example {
    position: relative;
    height: 200px;
    overflow-y: auto;
    border: 1px solid blue;
  }
</style>
