<template>
    <div>
        <p-tree-node data="All Project" :state.sync="treeAllState"
                     disable-toggle
                     @row:click="resetSelectedNodes"
        >
            <template #left-extra>
                <p-i name="ic_tree_all-projects" width="1rem" height="1rem"
                     class="mr-1"
                />
            </template>
        </p-tree-node>
        <p-tree-node v-for="(node, idx) in treeApiHandler.ts.metaState.nodes" :key="idx"
                     v-bind="treeApiHandler.ts.state"
                     :data.sync="node.data"
                     :children.sync="node.children"
                     :state.sync="node.state"
                     @toggle:click="treeApiHandler.toggle"
                     @node:click="onNodeClick"
                     @row:mouseenter="onHoverItem(...arguments, true)"
                     @row:mouseleave="onHoverItem(...arguments, false)"
        >
            <template #data="{data}">
                {{ data.name }}
            </template>
            <template #toggle="{state, toggleSize}">
                <p-i v-if="state.loading" name="ic_working" :width="toggleSize"
                     :height="toggleSize"
                />
            </template>
            <template #toggle-right>
                <p-i name="ic_tree_project-group" class="project-group-icon"
                     width="1rem" height="1rem" color="inherit transparent"
                />
            </template>
            <template #right-extra="{data}">
                <div v-if="hoveredNode && data.id === hoveredNode.node.data.id">
                    <!--                    <div v-tooltip.top="{content: $t('TREE_TYPE.CREATE_GRP'), delay: {show: 500}}"-->
                    <!--                         class="float-right text-base truncate leading-tight"-->
                    <!--                    >-->
                    <p-icon-button :name="'ic_plus'" class="group-add-btn"
                                   width="1rem" height="1rem"
                                   @click.stop="$emit('create', hoveredNode)"
                    />
                    <!--                    </div>-->
                </div>
            </template>
        </p-tree-node>
    </div>
</template>

<script lang="ts">

import PTreeNode from '@/components/molecules/tree/PTreeNode.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { getBaseNodeState, getDefaultNode } from '@/components/molecules/tree/PTreeNode.toolset';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import { ProjectTreeFluentAPI } from '@/lib/api/tree-node';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { fluentApi } from '@/lib/fluent-api';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import { ProjectGroup, ProjectTreeItem } from '@/views/project/project/modules/ProjectSearch.toolset';


export default {
    name: 'ProjectGroupTree',
    components: { PIconButton, PI, PTreeNode },
    setup(props, { emit }) {
        const projectAPI = fluentApi.identity().project();
        const treeAction = projectAPI.tree()
            .setSortBy('name')
            .setSortDesc(false)
            .setExcludeProject();
        const treeSearchAction = projectAPI.treeSearch();
        const treeApiHandler = new ProjectTreeFluentAPI({
            treeAction, treeSearchAction,
        });

        watch(() => treeApiHandler.ts.metaState.firstSelectedNode, async (after, before) => {
            if ((after && !before) || (after && after.node.data.id !== before.node.data.id)) {
                emit('select', after);
            } else if (!after && before) {
                emit('select', null);
            }
        }, { immediate: true });

        const onNodeClick = (item: ProjectTreeItem) => {
            if (treeApiHandler.ts.metaState.firstSelectedNode) {
                if (treeApiHandler.ts.metaState.firstSelectedNode.node.data.id !== item.node.data.id) {
                    treeApiHandler.ts.setNodeState(treeApiHandler.ts.metaState.firstSelectedNode, { selected: false });
                }
            }
            treeApiHandler.ts.setNodeState(item, { selected: true });
            treeApiHandler.ts.metaState.selectedNodes = [item];
        };

        const resetSelectedNodes = () => {
            if (treeApiHandler.ts.metaState.firstSelectedNode) {
                treeApiHandler.ts.metaState.firstSelectedNode.node.state.selected = false;
                treeApiHandler.ts.applyState(treeApiHandler.ts.metaState.firstSelectedNode);
                treeApiHandler.ts.metaState.selectedNodes = [];
            }
        };

        // watch(() => props.projectGroup, debounce(async (group) => {
        //     if (group) {
        //         if (treeApiHandler.ts.metaState.firstSelectedNode
        //         && treeApiHandler.ts.metaState.firstSelectedNode.node.data.id === group.id) {
        //             return;
        //         }
        //         await treeApiHandler.getSearchData(group.id, 'PROJECT_GROUP');
        //     } else {
        //         resetSelectedNodes();
        //     }
        // }, 30));


        const state = reactive({
            treeAllState: computed(() => ({
                selected: !treeApiHandler.ts.metaState.firstSelectedNode,
                expanded: false,
            })),
            hoveredNode: (null as (ProjectTreeItem|null)),
        });


        const onHoverItem = (item: ProjectTreeItem, matched, e, isHovered: boolean) => {
            // formState.isRoot = false;
            // state.isHover = isHovered;
            // state.hoveredId = item.node.data.id;
            state.hoveredNode = isHovered ? item : null;
        };

        const deleteSelectedNode = () => {
            treeApiHandler.ts.deleteNode(treeApiHandler.ts.metaState.firstSelectedNode);
            treeApiHandler.ts.metaState.selectedNodes = [];
        };

        const updateSelectedNode = (item: ProjectGroup) => {
            treeApiHandler.ts.metaState.firstSelectedNode.node.data = {
                ...treeApiHandler.ts.metaState.firstSelectedNode.node.data,
                name: item.name,
            };
        };

        const addNode = async (item: ProjectItemResp, parentNode: null|ProjectTreeItem) => {
            const newNode = getDefaultNode(item, {
                children: item.has_child,
                state: {
                    ...getBaseNodeState(),
                    loading: false,
                },
            });

            // add to root
            if (parentNode === null) treeApiHandler.ts.metaState.nodes.push(newNode);
            else if (Array.isArray(parentNode.node.children)) {
                parentNode.node.children.push(newNode);
                treeApiHandler.ts.setNodeState(parentNode, { expanded: true });
            } else {
                await treeApiHandler.getData(parentNode);
                treeApiHandler.ts.setNodeState(parentNode, { expanded: true });
            }
        };

        const findNode = async (groupId: string) => {
            await treeApiHandler.getSearchData(groupId, 'PROJECT_GROUP');
        };

        const listNodes = async () => {
            resetSelectedNodes();
            await treeApiHandler.getData();
        };

        listNodes();


        return {
            treeApiHandler,
            ...toRefs(state),
            onNodeClick,
            resetSelectedNodes,
            onHoverItem,
            deleteSelectedNode,
            updateSelectedNode,
            addNode,
            findNode,
            listNodes,
        };
    },
};
</script>

<style lang="postcss" scoped>
    ::v-deep .basic {
        @apply mx-3 mt-1;
    }
    .project-group-icon {
        @apply mx-1;
    }
    .group-add-btn {
         @apply float-right mr-1;
         max-width: 1.5rem;
         max-height: 1.5rem;
         min-width: 1.5rem;
         min-height: 1.5rem;
         &:hover {
             color: inherit;
         }
         &:hover {
             @apply bg-blue-300 border-blue-300;
         }
     }
</style>
