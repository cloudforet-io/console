<template>
    <p-empty class="project">
        <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
            <template #sidebar="{height}">
                <div class="treeSidebar" @click.right.stop.prevent="treeClickedRight">
                    <p-tree
                            ref="treeRef"
                            v-bind="treeApiHandler.ts.state"
                            :select-mode="true"
                            @node:selected="selected"
                            @node:clicked:right="nodeClickedRight"
                    >
                        <template #icon="{node,isExpanded}">
                            <p-i :name="node.data.item_type === 'PROJECT' ? 'ic_tree_project' :
                                     isExpanded ? 'ic_tree_folder--opened' : 'ic_tree_folder'"
                                 color="transparent inherit"
                                 width="1rem" height="1rem"
                            />
                        </template>
                    </p-tree>
                    <p-context-menu v-if="contextMenuVisible" ref="contextMenuRef"
                                    theme="secondary"
                                    :menu="menu"
                                    @clickMenuEvent="clickMenuEvent"
                    />
                </div>
            </template>
            <template #default>
                <div v-if="treeApiHandler.ts.metaState.firstSelectedNode">
                    <p-horizontal-layout>
                        <template #container="{ height }">
                            <p-tab :tabs="tabs" :active-tab.sync="activeTab" :style="{'height': height+'px','overflow-x':'auto'}">
                                <template #summary>
                                    <div class="h-full">
                                        <PDynamicDetails
                                                :details="details"
                                                :data="treeApiHandler.ts.metaState.firstSelectedNode"
                                        />
                                    </div>
                                </template>
                                <template #member />
                            </p-tab>
                        </template>
                    </p-horizontal-layout>
                </div>
                <p-empty v-else class="empty">
                    <p-i :width="'14rem'" :height="'14rem'" :name="'ic_no_selected_proj'" />
                    <div class="empty-msg">
                        No Selected Project<br>
                        Please, Click an item from left table.
                    </div>
                </p-empty>
            </template>
        </p-vertical-page-layout2>
    </p-empty>
</template>

<script lang="ts">
    /* eslint-disable camelcase */
    import {
        computed, defineComponent, getCurrentInstance, reactive, ref, toRefs,
    } from '@vue/composition-api';
    import { object } from '@storybook/addon-knobs';
    import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
    import PTree from '@/components/molecules/tree-new/Tree.vue';
    import { ProjectNode, ProjectTreeAPI } from '@/lib/api/tree';
    import TreeItem, { TreeItemInterface, TreeState, TreeToolSet } from '@/components/molecules/tree-new/ToolSet';
    import { makeTrItems } from '@/lib/view-helper/index';
    import PContextMenu from '@/components/organisms/context-menu/context-menu/ContextMenu.vue';
    import { windowEventMount } from '@/lib/compostion-util';
    import PTab from '@/components/organisms/tabs/tab/Tab.vue';
    import { QuerySearchTableAPI } from '@/lib/api/table';
    import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
    import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
    import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';

    import PI from '@/components/atoms/icons/PI.vue';
    import PEmpty from '@/components/atoms/empty/Empty.vue';

    interface ProjectItemData {
        id: string,
        name: string,
        has_child: boolean,
        item_type: 'PROJECT_GROUP'|'PROJECT',
    }
    interface pageState {
        item: any,
        contextMenuVisible: boolean,
        sidebarStyle: {}
    }
    export default defineComponent({
        name: 'Project2',
        components: {
            PVerticalPageLayout2,
            PContextMenu,
            PTree,
            PTab,
            PHorizontalLayout,
            PDynamicView,
            PDynamicDetails,
            PI,
            PEmpty,
        },
        setup(props, context) {
            const state: any = reactive({
                item: {},
                contextMenuVisible: false,
                contextItem: null,
                tabs: makeTrItems([
                    ['summary', 'COMMON.SUMMARY'],
                    ['member', 'COMMON.MEMBER'],
                ], context.parent),
                activeTab: 'summary',
                multiTabs: makeTrItems([
                    ['detail', 'TAB.DETAILS'],
                    ['data', 'TAB.DATA'],
                ], context.parent),
                activeMultiTab: '',
            });
            const treeRef = ref(null);

            /**
             * Api Handler
             * */
            const contextRef = ref(null);
            const treeApiHandler = new ProjectTreeAPI<any, any, ProjectNode, any, TreeToolSet<any>>(
                TreeToolSet, undefined,
            );

            /**
             * multiple context menu options for tree depth
             * */

            const rootMenu = [{
                type: 'item', label: 'Create Project', name: 'create', disabled: false,
            }];
            const projectGrpMenu = [
                {
                    type: 'item', label: 'Create Project Group', name: 'add', disabled: false,
                },
                {
                    type: 'item', label: 'Update Project Group', name: 'update', disabled: false,
                },
                {
                    type: 'item', label: 'Delete Project Group', name: 'delete', disabled: false,
                },
                {
                    type: 'item', label: 'Create Project Group', name: 'create', disabled: false,
                },
            ];
            const projectMenu = [
                {
                    type: 'item', label: 'Update Project', name: 'update', disabled: false,
                },
                {
                    type: 'item', label: 'Delete Project', name: 'delete', disabled: false,
                },
            ];
            const menu = computed(() => {
                if (!state.contextItem) return rootMenu;
                if (state.contextItem.data.item_type === 'PROJECT_GROUP') return projectGrpMenu;
                return projectMenu;
            });

            /**
             * Functions for Context Menu
             * */

            const showContextMenu = (node?: TreeItemInterface<ProjectItemData>) => {
                if (node) {
                    state.contextItem = node;
                } else {
                    state.contextItem = null;
                }
                state.contextMenuVisible = true;
            };
            const selected = async (event) => {
                treeApiHandler.ts.getSelectedNode(event);
                state.contextMenuVisible = false;
            };
            const treeClickedRight = () => {
                showContextMenu();
            };
            const nodeClickedRight = (node, event) => {
                console.log(node, event);
                showContextMenu(node);
            };
            const clickMenuEvent = (event) => {
                console.debug('clickMenuEvent');
                console.log(treeApiHandler.ts.metaState.selectedNode);
            };
            const hideContextMenu = (event) => {
                state.contextMenuVisible = false;
            };
            windowEventMount('click', hideContextMenu);

            /**
             *  dynamic view - summary
             */
            const details = [
                {
                    name: 'Base Information',
                    data_source: [
                        { name: 'ID', key: 'project_id' },
                        { name: 'Name', key: 'name' },
                        {
                            name: 'Created at',
                            key: 'created_at.seconds',
                            view_type: 'datetime',
                            view_option: {
                                source_type: 'timestamp',
                                source_format: 'seconds',
                            },
                        },
                    ],
                },
            ];
            const projectItemData = ref({});



            const vm = getCurrentInstance();

            return {
                treeRef: treeApiHandler.ts.treeRef,
                treeApiHandler,
                ...toRefs(state),
                contextRef,
                menu,
                selected,
                treeClickedRight,
                nodeClickedRight,
                clickMenuEvent,
                hideContextMenu,
                details,
            };
        },
    });
</script>

<style lang="postcss" scoped>
    .treeSidebar {
        height: 100%;
    }

    .empty {
        flex-direction: column;
        text-align: center;
        justify-content: flex-start;
    }
</style>
