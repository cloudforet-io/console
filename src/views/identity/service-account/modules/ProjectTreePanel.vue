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
                    <p-tree v-else ref="treeRef"
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
                    </p-tree>
                </div>
                <div class="no-select">
                    <p-radio class="mr-2"
                             :selected="!firstSelectedNode"
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
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PI, PPaneLayout, PSkeleton, PIconButton, PIconTextButton, PRadio, PTree,
} from '@spaceone/design-system';
import { TreeItem, TreeNode } from '@spaceone/design-system/dist/src/molecules/tree-node/type';

import { PROJECT_MAIN_PAGE_NAME } from '@/routes/project/project-route';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { ProjectItemResp } from '@/views/project/project/type';


function getTreeItem<T=ProjectItemResp>(
    key: number, level: number, node: TreeNode<T>, parent: TreeItem<T>|null = null,
): TreeItem<T> {
    return {
        key,
        level,
        node,
        parent,
    };
}

const getParam = (id?: string, type?: string) => {
    const param: any = {
        sort: { key: 'name', desc: false },
        item_type: 'ROOT',
    };
    if (id && type) {
        param.item_id = id;
        param.item_type = type;
    }
    return param;
};

const toNodes = (resp): TreeNode[]|boolean => {
    if (resp.items.length === 0) {
        return false;
    }
    return resp.items.map(d => ({
        data: d,
        children: d.has_child,
        state: {
            expanded: false,
            selected: false,
            loading: false,
        },
    }));
};

export default {
    name: 'ProjectTreePanel',
    components: {
        PTree,
        PI,
        PPaneLayout,
        PSkeleton,
        PIconButton,
        PIconTextButton,
        PRadio,
    },
    props: {
        targetName: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            treeRef: null as null|any,
            firstSelectedNode: computed<TreeItem|null>(() => (state.treeRef ? state.treeRef.firstSelectedNode : null)),
            hasProject: true,
            isLoading: false,
            error: false,
        });

        const requestTreeData = async (node?: TreeNode): Promise<TreeNode[]|boolean> => {
            try {
                const res = await SpaceConnector.client.identity.project.tree(getParam(node?.data.id, node?.data.item_type));
                return toNodes(res);
            } catch (e) {
                console.error(e);
                return false;
            }
        };

        const getData = async (item?: TreeItem): Promise<void> => {
            if (item) {
                item.node.state.expanded = true;
                item.node.state.loading = true;
                state.treeRef.applyState(item);

                item.node.children = await requestTreeData(item.node);

                item.node.state.loading = false;
                state.treeRef.applyState(item);
            } else {
                const res = await requestTreeData();
                if (state.treeRef) state.treeRef.nodes = Array.isArray(res) ? res : [];
            }
        };

        const refreshQuery = new ApiQueryHelper().setCountOnly();

        const refreshProject = async () => {
            state.isLoading = true;
            state.hasProject = false;
            const [res] = await Promise.all([
                SpaceConnector.client.identity.project.list({
                    query: refreshQuery.data,
                }), getData(),
            ]);
            if (res.total_count) state.hasProject = true;
            state.isLoading = false;
        };

        const resetSelectedNode = (item: TreeItem<ProjectItemResp>, compare?: TreeItem<ProjectItemResp>) => {
            if (compare) {
                if (compare.node.data.id === item.node.data.id) {
                    state.treeRef.selectedNodes = [];
                } else if (compare.parent) resetSelectedNode(item, compare.parent);
            } else {
                if (!state.firstSelectedNode) return;
                if (!state.firstSelectedNode.parent) return;
                if (state.firstSelectedNode.level <= item.level) return;
                resetSelectedNode(item, state.firstSelectedNode.parent);
            }
        };

        const projectPath = vm?.$router.resolve({ name: PROJECT_MAIN_PAGE_NAME }).href;
        const goToProject = () => {
            window.open(projectPath);
        };
        const selectProjectName = computed(() => {
            if (state.firstSelectedNode) {
                return state.firstSelectedNode.node.data.name;
            }
            return '';
        });

        const unWatch = watch(() => state.treeRef, async (treeRef) => {
            if (treeRef) {
                await refreshProject();
                await getData();
                unWatch();
            }
        });


        const toggle = async (item: TreeItem<ProjectItemResp>, matched: TreeItem<ProjectItemResp>[], e: MouseEvent) => {
            e.stopPropagation();
            if (item.node.state.expanded) {
                resetSelectedNode(item);
                item.node.state.expanded = false;
                state.treeRef.applyState(item);
                item.node.children = !!item.node.children;
                return;
            }

            await getData(item);
        };
        const selectItem = (item: TreeItem<ProjectItemResp>) => {
            if (item.node.data.item_type === 'PROJECT') {
                if (!item.node.state.selected) state.treeRef.setSelectedNodes(item);
            }
        };
        const confirm = () => {
            if (state.firstSelectedNode) {
                emit('confirm', state.firstSelectedNode.node.data);
            } else {
                emit('confirm', null);
            }
        };

        const releaseProject = () => {
            if (state.firstSelectedNode) {
                state.treeRef.setNodeState(state.firstSelectedNode, { selected: false });
                state.treeRef.selectedNodes = [];
            }
        };

        return {
            ...toRefs(state),
            refreshProject,
            goToProject,
            selectProjectName,
            resetSelectedNode,
            toggle,
            selectItem,
            confirm,
            releaseProject,
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
