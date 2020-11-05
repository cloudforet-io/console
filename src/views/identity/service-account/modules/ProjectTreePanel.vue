<template>
    <p-pane-layout>
        <div class="panel-container">
            <div class="tree-panel-header">
                <span class="title">{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE') }}</span>
                <span class="title-optional">&nbsp;({{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_OPTIONAL') }})</span>
                <p-icon-text-button style-type="primary" name="ic_plus_bold" outline
                                    @click="goToProject"
                >
                    {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_CREATE') }}
                </p-icon-text-button>
            </div>
            <div class="toolbox">
                <div class="msg">
                    <template v-if="isLoading">
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_SELECT_DESC') }}
                    </template>
                    <template v-else-if="!hasProject">
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_NO_DATA') }}
                    </template>
                    <template v-else-if="error">
                        <p-i name="ic_alert" width="1rem" height="1rem"
                             class="mr-2"
                        />
                        <span class="alert">{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_SELECT_ERROR') }}</span>
                    </template>
                    <i18n v-else-if="targetName && selectProjectName"
                          path="IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_EXIST_DESC"
                          class="align-baseline"
                    >
                        <template #item>
                            <span class="font-bold">[{{ targetName }}]</span>
                        </template>
                        <template #project>
                            <span class="font-bold text-blue">[{{ selectProjectName }}]</span>
                        </template>
                    </i18n>
                    <template v-else>
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_SELECT_DESC') }}
                    </template>
                </div>

                <p-icon-button name="ic_refresh" class="refresh-btn"
                               @click="refreshProject"
                />
            </div>

            <div class="body-container">
                <div class="tree-container">
                    <p-skeleton v-if="isLoading" class="tree-loader" />
                    <template v-else>
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
                    </template>
                </div>
                <div class="no-select">
                    <p-radio class="mr-2"
                             :selected="!treeApiHandler.ts.metaState.firstSelectedNode"
                             :value="true" @click="releaseProject"
                    /><span class="cursor-pointer" @click="releaseProject">{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_NO_SELECTION') }}</span>
                </div>
            </div>

            <slot name="bottom" />
        </div>
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
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';
import { PROJECT_MAIN_PAGE_NAME } from '@/routes/project/project-route';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import { TreeItem } from '@/components/molecules/tree/PTreeNode.toolset';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';

export default {
    name: 'ProjectTreePanel',
    components: {
        PI, PPaneLayout, PSkeleton, PIconButton, PIconTextButton, PTreeNode, PRadio,
    },
    props: {
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
.panel-container {
    max-width: 35.75rem;
}
.toolbox {
    @apply flex mb-2 mt-5 align-middle items-center justify-between;
    .msg {
        @apply align-middle font-bold;
        .alert {
            @apply text-alert font-normal;
        }
    }
    .refresh-btn {
        @apply flex-shrink-0;
    }
}
.tree {
    @apply overflow-auto border-gray-200  border;
}
.project-group-icon {
    @apply mx-1;
}
.tree-panel-header {
    margin-bottom: 2rem;
    line-height: 120%;
    .title {
        @apply text-2xl;
    }
    .title-optional {
        @apply text-lg text-gray-400;
        margin-right: 1rem;
    }
}

.body-container {
    @apply border border-gray-200 rounded-sm flex flex-col w-full;
}
.tree-container {
    @apply overflow-auto flex-grow px-2 py-4 w-full;
    height: 21.5rem;
}
.tree-loader {
    @apply h-full w-full rounded-b-sm;
}
.no-select {
    @apply border-t border-gray-200 p-4 flex items-center;
}
</style>
