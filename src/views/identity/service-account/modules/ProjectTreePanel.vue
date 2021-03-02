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
                               @click="getAllData"
                />
            </div>

            <div class="body-container">
                <div class="tree-container" :style="{overflow: isLoading ? 'hidden' : 'auto'}">
                    <p-tree id-key="id" children-key="has_child"
                            :selected-nodes.sync="selectedNodes"
                            :data-fetcher="dataFetcher"
                            :select-options="selectOptions"
                            :edit-options="editOptions"
                            :drag-options="dragOptions"
                            @init="onTreeInit"
                    >
                        <template #data="{node}">
                            <span :class="{
                                'ml-2': data.item_type === 'PROJECT'
                            }"
                            >{{ node.data.name }}</span>
                        </template>
                        <template #toggle="{node}">
                            <p-i v-if="node.loading" name="ic_working"
                                 width="1rem" height="1rem"
                            />
                            <p-radio v-else-if="node.data.item_type === 'PROJECT'"
                                     :selected="node.selected" :value="true" @click.stop="node.setSelected(true)"
                            />
                        </template>
                        <template #toggle-right="{node}">
                            <p-i v-if="node.data.item_type === 'PROJECT_GROUP'" name="ic_tree_project-group" class="project-group-icon"
                                 width="1rem" height="1rem" color="inherit transparent"
                            />
                        </template>
                    </p-tree>
                    <transition name="fade-in">
                        <div v-if="isLoading" class="tree-loader">
                            <p-lottie name="thin-spinner" :size="1.5" auto />
                        </div>
                    </transition>
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
    PI, PPaneLayout, PLottie, PIconButton, PIconTextButton, PRadio, PTree,
} from '@spaceone/design-system';
import { TreeItem, TreeNode } from '@spaceone/design-system/dist/src/data-display/tree/tree-node/type';

import { PROJECT_MAIN_PAGE_NAME } from '@/routes/project/project-route';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { ProjectItemResp, ProjectTreeItem } from '@/views/project/project/type';



export default {
    name: 'ProjectTreePanel',
    components: {
        PTree,
        PI,
        PPaneLayout,
        PLottie,
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
            root: null as TreeItem|null,
            selectedNodes: [] as ProjectTreeItem[],
            firstSelectedNode: computed<ProjectTreeItem|undefined>(() => (state.selectedNodes[0])),
            selectOptions: {
                validator({ data }) {
                    return data.item_type === 'PROJECT';
                },
            },
            editOptions: {
                validator: text => (text && text.length > 2 && text.length < 40),
                invalidText: 'should NOT be shorter than 2 characters',
                validText: '2 ~ 40 characters',
                dataSetter(text, originData) {
                    return {
                        ...originData,
                        name: text,
                    };
                },
            },
            dragOptions: {
                disabled: false,
            },
            hasProject: true,
            isLoading: false,
        });

        const requestTreeData = async (id?: string, type?: string): Promise<ProjectItemResp[]|boolean> => {
            const params: any = {
                sort: { key: 'name', desc: false },
                item_type: 'ROOT',
            };
            if (id && type) {
                params.item_id = id;
                params.item_type = type;
            }
            try {
                const { items } = await SpaceConnector.client.identity.project.tree(params);
                return items;
            } catch (e) {
                console.error(e);
                return false;
            }
        };

        const dataFetcher = async (node?: ProjectTreeItem): Promise<ProjectItemResp[]|boolean> => {
            const res = await requestTreeData(node?.data.id, node?.data.item_type);
            return res;
        };

        const getRootData = async (): Promise<void> => {
            if (state.root) {
                state.selectedNodes = [];
                const res = await dataFetcher(state.root);
                await state.root.setChildren(res);
            }
        };

        const refreshQuery = new ApiQueryHelper().setCountOnly();

        const getAllData = async () => {
            state.isLoading = true;
            state.hasProject = false;
            const [res] = await Promise.all([
                SpaceConnector.client.identity.project.list({
                    query: refreshQuery.data,
                }), getRootData(),
            ]);
            if (res.total_count) state.hasProject = true;
            state.isLoading = false;
        };


        const projectPath = vm?.$router.resolve({ name: PROJECT_MAIN_PAGE_NAME }).href;
        const goToProject = () => {
            window.open(projectPath);
        };
        const selectProjectName = computed(() => {
            if (state.firstSelectedNode) {
                return state.firstSelectedNode.data.name;
            }
            return '';
        });


        const confirm = () => {
            if (state.firstSelectedNode) {
                emit('confirm', state.firstSelectedNode.node.data);
            } else {
                emit('confirm', null);
            }
        };

        const releaseProject = () => {
            if (state.firstSelectedNode) {
                state.firstSelectedNode.setSelected(false);
            }
        };

        const onTreeInit = async (root) => {
            state.root = root;
        };

        return {
            ...toRefs(state),
            dataFetcher,
            getAllData,
            goToProject,
            selectProjectName,
            confirm,
            releaseProject,
            onTreeInit,
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
    @apply relative border border-gray-200 bg-primary4 rounded-sm flex flex-col w-full;
}
.tree-container {
    @apply overflow-auto flex-grow px-2 py-4 w-full;
    height: 21.5rem;
}
.fade-in-leave-active {
    transition: opacity 0.2s;
}
.fade-in-enter, .fade-in-leave-to {
    opacity: 0;
}
.fade-in-leave, .fade-in-enter-to {
    opacity: 0.5;
}
.tree-loader {
    @apply absolute h-full w-full bg-white flex justify-center;
    padding-top: 30%;
    top: 0;
    left: 0;
    opacity: 0.5;
}
.no-select {
    @apply border-t border-gray-200 p-4 flex items-center;
}
.p-tree::v-deep {
    .p-tree-node .tree-row {
        .right-extra {
            display: none;
        }
        &:hover .node .right-extra {
            display: block;
        }
    }
}
</style>
