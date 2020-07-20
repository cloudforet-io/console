<template>
    <p-pane-layout class="panel">
        <slot name="top">
            <div class="title">
                Project
            </div>
        </slot>
        <div class="flex my-4">
            <p-icon-text-button style-type="primary" name="ic_plus_bold" outline
                                @click="goToProject"
            >
                {{ $t('BTN.CREATE_PROJECT') }}
            </p-icon-text-button>
        </div>
        <div class="toolbox">
            <span v-if="!hasProject" class="msg">
                {{ $t('ACTION.PROJECT.NO_PROJECT') }}
            </span>
            <div v-else-if="error" class="alert">
                <span class="alert-msg">
                    <p-i name="ic_alert" width="1rem" height="1rem" />
                </span>
                <span>   {{ $t('ACTION.PROJECT.SELECT_PROJECT_OR_RELEASE') }}</span>
            </div>
            <i18n v-else-if="targetName&&selectProjectName"
                  path="ACTION.PROJECT.ITEM_WILL_SELECT_FOR"
                  tag="span"
                  class="align-baseline"
            >
                <template #item>
                    <span class="font-bold">[{{ targetName }}]</span>
                </template>
                <template #project>
                    <span class="font-bold text-blue">[{{ selectProjectName }}]</span>
                </template>
            </i18n>
            <span v-else class="msg">
                {{ $t('ACTION.PROJECT.SELECT_PROJECT_FOR',{resource:resourceName}) }}
            </span>
            <p-icon-button
                name="ic_refresh"
                @click="refreshProject"
            />
        </div>

        <div class="body-container">
            <div ref="treeContainer" class="tree-container">
                <p-tree-node v-for="(node, idx) in treeApiHandler.ts.metaState.nodes" :key="idx"
                             v-bind="treeApiHandler.ts.state"
                             :data.sync="node.data"
                             :children.sync="node.children"
                             :state.sync="node.state"
                             @toggle:click="toggle"
                             @node:click="selectItem"
                             @checkbox:click="selectItem"
                >
                    <template #data="{data}">
                        <span :class="{
                            'ml-2': data.item_type === 'PROJECT'
                        }"
                        >{{ data.name }}</span>
                    </template>
                    <template #toggle="{state, toggleSize, data, getListeners}">
                        <p-i v-if="state.loading" name="ic_working" :width="toggleSize"
                             :height="toggleSize"
                        />
                        <p-radio v-else-if="data.item_type === 'PROJECT'"
                                 :selected="state.selected" :value="true" v-on="getListeners('checkbox')"
                        />
                    </template>
                    <template #toggle-right="{data}">
                        <p-i v-if="data.item_type === 'PROJECT_GROUP'" name="ic_tree_project-group" class="project-group-icon"
                             width="1rem" height="1rem" color="inherit transparent"
                        />
                    </template>
                </p-tree-node>
            </div>
            <div class="no-select">
                <p-radio class="mr-2"
                         :selected="!treeApiHandler.ts.metaState.firstSelectedNode"
                         :value="true" @click="releaseProject"
                /><span class="cursor-pointer" @click="releaseProject">Select no Project</span>
            </div>
        </div>
        <div v-if="isLoading">
            <PSkeleton class="tree-box" />
        </div>

        <slot name="bottom" />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { ProjectNodeState, ProjectTreeFluentAPI } from '@/lib/api/tree-node';
import PTreeNode from '@/components/molecules/tree/PTreeNode.vue';
import { fluentApi } from '@/lib/fluent-api';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PaneLayout.vue';
import { PROJECT_MAIN_PAGE_NAME } from '@/routes/project/project-route';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import PRadio from '@/components/molecules/forms/radio/Radio.vue';
import { TreeItem } from '@/components/molecules/tree/PTreeNode.toolset';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';

export default {
    name: 'SProjectTreePanel',
    components: {
        PI, PPaneLayout, PSkeleton, PIconButton, PIconTextButton, PTreeNode, PRadio,
    },
    events: ['change'],
    props: {
        resourceName: {
            type: String,
            default: '',
        },
        targetName: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance();
        const projectApi = fluentApi.identity().project();
        const treeApiHandler = new ProjectTreeFluentAPI({
            treeAction: projectApi.tree().setSortBy('name').setSortDesc(false),
            treeSearchAction: projectApi.treeSearch(),
        });

        const state = reactive({
            error: false,
            selectNode: computed(() => treeApiHandler.ts.metaState.firstSelectedNode),
            hasProject: true,
            isLoading: false,
        });

        const refreshProject = async () => {
            state.isLoading = true;
            state.hasProject = false;
            const resp = await fluentApi.identity().project().list().setCountOnly()
                .execute();
            // treeApiHandler.ts.metaState.selectedNodes = [];
            await treeApiHandler.getData();
            if (resp.data.total_count) {
                state.hasProject = true;
            }
            state.isLoading = false;
        };

        const resetSelectedNode = (item: TreeItem<ProjectItemResp, ProjectNodeState>, compare?: TreeItem<ProjectItemResp, ProjectNodeState>) => {
            if (compare) {
                if (compare.node.data.id === item.node.data.id) {
                    treeApiHandler.ts.metaState.selectedNodes = [];
                } else if (compare.parent) resetSelectedNode(item, compare.parent);
            } else {
                if (!treeApiHandler.ts.metaState.firstSelectedNode) return;
                if (!treeApiHandler.ts.metaState.firstSelectedNode.parent) return;
                if (treeApiHandler.ts.metaState.firstSelectedNode.level <= item.level) return;
                resetSelectedNode(item, treeApiHandler.ts.metaState.firstSelectedNode.parent);
            }
        };

        const projectPath = vm?.$router.resolve({ name: PROJECT_MAIN_PAGE_NAME }).href;
        const goToProject = () => {
            window.open(projectPath);
        };
        const selectProjectName = computed(() => {
            if (treeApiHandler.ts.metaState.firstSelectedNode) {
                return treeApiHandler.ts.metaState.firstSelectedNode.node.data.name;
            }
            return '';
        });

        onMounted(async () => {
            await refreshProject();
            await treeApiHandler.getData();
        });

        return {
            treeApiHandler,
            // treeRef: treeAPITS.ts.treeRef,
            ...toRefs(state),
            // update: (event) => {
            //     treeAPITS.ts.getSelectedNode(event);
            // },
            refreshProject,
            goToProject,
            selectProjectName,
            resetSelectedNode,
            async toggle(item: TreeItem<ProjectItemResp, ProjectNodeState>, matched: TreeItem<ProjectItemResp, ProjectNodeState>[], e: MouseEvent): Promise<void> {
                e.stopPropagation();
                if (item.node.state.expanded) {
                    resetSelectedNode(item);
                    item.node.state.expanded = false;
                    treeApiHandler.ts.applyState(item);
                    item.node.children = !!item.node.children;
                    return;
                }

                await treeApiHandler.getData(item);
            },
            selectItem(item: TreeItem<ProjectItemResp, ProjectNodeState>): void {
                if (item.node.data.item_type === 'PROJECT') {
                    if (!item.node.state.selected) treeApiHandler.ts.setSelectedNodes(item);
                }
            },
            confirm(): void {
                if (treeApiHandler.ts.metaState.firstSelectedNode) {
                    emit('confirm', treeApiHandler.ts.metaState.firstSelectedNode.node.data);
                } else {
                    emit('confirm', null);
                }
            },
            releaseProject() {
                if (treeApiHandler.ts.metaState.firstSelectedNode) {
                    treeApiHandler.ts.setNodeState(treeApiHandler.ts.metaState.firstSelectedNode, { selected: false });
                    treeApiHandler.ts.metaState.selectedNodes = [];
                }
            },
        };
    },

};
</script>

<style lang="postcss" scoped>
    .tree-box {
        @apply w-full min-h-56 max-h-56 rounded-b-sm;

    @screen lg {
        @apply w-1/2;
    }
    }
    .toolbox {
        @apply flex mb-2 mt-5 align-middle items-center;
    .msg {
        @apply align-middle font-bold;
        padding-right: 10.8rem;
    }
    }
    .tree {
        @apply overflow-auto border-gray-200  border;
    }
    .project-group-icon {
        @apply mx-1;
    }
    .title {
        @apply text-2xl mb-8;
        line-height: 120%;
    }
    .alert {
        @apply text-alert align-middle;
    .alert-msg {
        @apply align-middle;
    }
    }
    .body-container {
        @apply border border-gray-200 rounded-sm flex flex-col;
        max-width: 35.75rem;

        /* min-height: 17.5rem; */
    }
    .tree-container {
        @apply overflow-auto flex-grow px-2 py-4;
        max-width: 35.75rem;

        /* min-height: 17.5rem; */
        height: 21.5rem;
    }
    .no-select {
        @apply border-t border-gray-200 p-4 flex items-center;
    }
</style>
