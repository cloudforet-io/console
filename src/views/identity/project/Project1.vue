<template>
    <div div class="animated fadeIn">
        <default-tree
            ref="IDPJ001_ProjectTree"
            :tree-data="treeData"
            :show-tree="displayTree"
            :context-init="isInitializing"
            :no-select-m-s-g="noSelectMessage"
            @DTIsRootClicked="pRootClicked"
            @DTNodeClicked="pNodeClicked"
            @DTNodeToggled="pNodeToggled"
            @DTBeforeDropped="pBeforeDropped"
            @DTContextVisible="pContextVisible"
        >
            <!--<template slot="icon" slot-scope="node">
                <span class="item-icon">
                    <i v-if="node.isLeaf" class="fas fa-cube" />
                    <i v-else-if="node.isExpanded" class="far fa-globe-americas" />
                    <i v-else class="fal fa-folder-minus" />
                </span>
            </template>-->
            <template slot="context">
                <project-context :context-data="getSelectedData" />
            </template>
            <template #treeSubPanel>
                <BaseDragHorizontal>
                    <template #container="{ height }">
                        <PTab :tabs="tabsData.tabs" :active-tab.sync="tabsData.activeTab">
                            <template #details="{tabName}">
                                <keep-alive>
                                    <project-summary-top
                                        :selected-node="getSelectedNodeAndTree"
                                        :responsive-style="{'height': height+'px', 'overflow-y':'auto'}"
                                    />
                                </keep-alive>
                            </template>
                            <template #member="{tabName}">
                                <project-member :selected-node="getSelectedNodeAndTree" />
                            </template>
                        </PTab>
                    </template>
                </BaseDragHorizontal>
                <div>
                    <template v-if="tabsData.activeTab === 'details'">
                        <project-summary-bottom
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

export default {
    name: 'Project1',
    components: {
        DefaultTree,
        ProjectContext,
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
        };
    },
    computed: {
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
        pRootClicked(clickObj) {

        },

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

        },
        pContextVisible(node, event, hasClicked, tree) {
            const actionOBJ = {
                node, event, hasClicked, tree,
            };
            this.contextItem = actionOBJ;
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
                console.log(this.treeData);
            }).catch((error) => {
                console.error(error);
            });
            this.displayTree = true;
        },
    },
};
</script>

<style lang="scss" scoped>
    #scrollspy-example {
        position: relative;
        height: 200px;
        overflow-y: scroll;
        border: 1px solid blue;
    }
</style>
