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
        <data-center-context-action ref="contextPopUp"
                                    :selected-node="getSelectedNodeAndTree"
                                    :action-flag="getContextActionFlag"
                                    @create="createOnDataCenter"
                                    @update="updateOnDataCenter"
                                    @delete="deleteOnDataCenter"
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
                                                         :responsive-style="{'height': height+'px', 'overflow-y':'auto'}"
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
import { makeTrItems } from '@/lib/view-helper';

const DataCenterSummaryTop = () => import('@/views/inventory/data-center/modules/DataCenterSummaryTop');
const DataCenterSummaryBottom = () => import('@/views/inventory/data-center/modules/DataCenterSummaryBottom');
const DataCenterAdmin = () => import('@/views/inventory/data-center/modules/DataCenterAdmin');
const DataCenterContextAction = () => import('@/views/inventory/data-center/modules/DataCenterContextAction');
const DataCenterContext = () => import('@/views/inventory/data-center/modules/DataCenterContext');
const PTableCheckModal = () => import('@/components/organisms/modals/action-modal/ActionConfirmModal');
export default {
    name: 'DataCenter',
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
        PTableCheckModal,
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
            checkTableModalState: {
                deleteParam: {
                    flag: null,
                    tree: null,
                    nodeData: null,
                },
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
                item_id: _.get(node, 'data.id'),
                domain_id: this.$ls.domain.state.domainId,
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

                if (response.data.items.length > 0) {
                    this.$refs.DataCenterTree._data.isDataExists = true;
                }
                // Note: Initialize Project trees and then display only a context, This must be included as well.
                if (this.treeData.length === 1 && !this.isEmpty(this._.get(this.treeData[0], 'data.init'))) {
                    this.isInitializing = true;
                }
            }).catch((error) => {
                console.error(error);
            });
            this.displayTree = true;
        },
        getLastNodeInFirstLayer(tree) {
            let lastNode = null;
            tree.traverse((node) => {
                if (node.path.length === 1) lastNode = node;
            });
            return lastNode;
        },
        async createOnDataCenter(flag, tree, nodeData) {
            const param = {
                name: this.$refs.contextPopUp._data.textInput.name,
                tags: this.$refs.contextPopUp._data.tagInput.tags,
            };
            if (flag[1] != 'RE') {
                const key = flag[1] === 'ZN' ? 'region_id' : 'zone_id';
                param[key] = nodeData.id;
            }

            const url = flag[1] === 'RE' ? 'region' : flag[1] === 'ZN' ? 'zone' : 'pool';
            const arg = flag[1] === 'RE' ? 'Region' : flag[1] === 'ZN' ? 'Zone' : 'Pool';

            await this.$http.post(`/inventory/${url}/create`, param).then((response) => {
                const responseData = !this.isEmpty(response.data) ? response.data : {};
                if (!this.isEmpty(responseData)) {
                    const placement = flag[1] === 'RE' ? 'after' : 'inside';
                    const InitializingData = {
                        id: flag[1] === 'RE' ? responseData.region_id : flag[1] === 'ZN' ? responseData.zone_id : responseData.pool_id,
                        item_type: flag[1] === 'RE' ? 'REGION' : flag[1] === 'ZN' ? 'ZONE' : 'POOL',
                        name: param.name,
                    };

                    const newNode = this.getSelectedNode(InitializingData, 'DATA_CENTER');
                    if (flag[1] !== 'RE') {
                        this.applyActionOnScreen(tree, { node: newNode, placement });
                    } else {
                        const lastNodeInFirstLayer = this.getLastNodeInFirstLayer(tree);
                        tree.insert({ node: lastNodeInFirstLayer, placement }, newNode);
                    }

                    if (this.isInitializing) {
                        tree.remove([tree.getFirstNode()].map(node => node.path));
                        this.isInitializing = false;
                    }
                    this.$refs.DataCenterTree._data.isDataExists = true;
                }

                this.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'Success',
                    text: this.$t('INVENTORY.CRT_SUCC_ARG', [arg]),
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                this.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: this.$t('INVENTORY.CRT_FAIL_ARG', [arg]),
                    duration: 2000,
                    speed: 1000,
                });
                console.error(error);
            });

            this.$refs.contextPopUp.hideModal();
        },
        async updateOnDataCenter(flag, tree, nodeData) {
            const param = {
                name: this.$refs.contextPopUp._data.textInput.name,
                tags: this.$refs.contextPopUp._data.tagInput.tags,
            };
            const itemType = nodeData.item_type;
            const key = `${itemType.toLowerCase()}_id`;
            const url = `/inventory/${itemType.toLowerCase()}/update`;
            param[key] = nodeData.id;

            const arg = flag[1] === 'RE' ? 'Region' : flag[1] === 'ZN' ? 'Zone' : 'Pool';

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
                    text: this.$t('INVENTORY.UPT_SUCC_ARG', [arg]),
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                this.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: this.$t('INVENTORY.UPT_FAIL_ARG', [arg]),
                    duration: 2000,
                    speed: 1000,
                });
                console.error(error);
            });
            this.$refs.contextPopUp.hideModal();
        },
        deleteOnDataCenter(flag, tree, nodeData) {
            nodeData.name = tree.getSelected()[0].title;
            this.checkTableModalState.deleteParam = {
                flag,
                tree,
                nodeData,
            };
            const targetIdentity = flag[1] === 'RE' ? 'Region' : flag[1] === 'ZN' ? 'Zone' : 'Pool';
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
            const itemType = nodeData.item_type;
            // eslint-disable-next-line no-nested-ternary
            const param = itemType === 'REGION' ? { region_id: nodeData.id } : itemType === 'ZONE' ? { zone_id: nodeData.id } : { pool_id: nodeData.id };
            const arg = itemType === 'REGION' ? this.$t('COMMON.REGION') : itemType === 'ZONE' ? this.$t('COMMON.ZONE') : this.$t('COMMON.POOL');
            const url = `/inventory/${itemType.toLowerCase()}/delete`;

            await this.$http.post(url, param).then((response) => {
                const responseData = response.data;
                if (this.isEmpty(responseData)) {
                    tree.remove(path);
                    this.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: this.$t('INVENTORY.DEL_SUCC_ARG', [arg]),
                        duration: 2000,
                        speed: 1000,
                    });

                    this.$refs.DataCenterTree._data.hasSelected = false;
                    if (_.isEmpty(tree.getNode([0]))) {
                        this.isInitializing = true;
                        this.treeData = [{
                            title: 'Right-click on your mouse to create a new region.',
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

<style lang="scss" scoped>
  #scrollspy-example {
    position: relative;
    height: 200px;
    overflow-y: auto;
    border: 1px solid blue;
  }
</style>
