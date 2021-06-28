<template>
    <p-pane-layout>
        <div class="panel-container">
            <div class="tree-panel-header">
                <span class="title">{{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_TITLE') }}</span>
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
                    <!--                    <i18n v-else-if="targetName && selectProjectName"-->
                    <!--                          path="IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_EXIST_DESC"-->
                    <!--                          class="align-baseline"-->
                    <!--                    >-->
                    <!--                        <template #item>-->
                    <!--                            <span class="font-bold">[{{ targetName }}]</span>-->
                    <!--                        </template>-->
                    <!--                        <template #project>-->
                    <!--                            <span class="font-bold text-blue">[{{ selectProjectName }}]</span>-->
                    <!--                        </template>-->
                    <!--                    </i18n>-->
                    <template v-else>
                        {{ $t('IDENTITY.SERVICE_ACCOUNT.ADD.PROJECT_SELECT_DESC') }}
                    </template>
                </div>

                <p-icon-button name="ic_refresh" class="refresh-btn"
                               @click="onRefresh"
                />
            </div>

            <div class="body-container">
                <div class="tree-container" :style="{overflow: isLoading ? 'hidden' : 'auto'}">
                    <p-tree :edit-options="{disabled: true}"
                            :drag-options="{disabled: true}"
                            :toggle-options="toggleOptions"
                            :select-options="selectOptions"
                            :data-setter="dataSetter"
                            :data-getter="dataGetter"
                            :data-fetcher="dataFetcher"
                            @init="onTreeInit"
                            @change-select="onChangeSelect"
                    >
                        <template #data="{node}">
                            <span :class="{
                                'ml-2': node.data.item_type === 'PROJECT'
                            }"
                            >{{ node.data.name }}</span>
                        </template>
                        <template #toggle="{node, selected, path}">
                            <p-radio v-if="node.data.item_type === 'PROJECT'"
                                     :selected="selected" :value="true"
                                     @click.stop="changeSelectState(node, path)"
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
                             :selected="!selectedNode"
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
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import {
    PI, PPaneLayout, PLottie, PIconButton, PIconTextButton, PRadio, PTree,
} from '@spaceone/design-system';

import { PROJECT_ROUTE } from '@/routes/project/project-route';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { ProjectGroupTreeItem, ProjectTreeRoot } from '@/views/project/project/type';
import { ProjectGroup } from '@/views/identity/service-account/type';


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
            root: null as ProjectTreeRoot|null,
            selectedItem: {} as ProjectGroupTreeItem,
            selectedNode: computed(() => state.selectedItem.node),
            hasProject: true,
            isLoading: false,
        });

        const toggleOptions = {
            validator: node => node.data.has_child || node.children.length > 0,
        };

        const selectOptions = {
            validator({ data }) {
                return data.item_type === 'PROJECT';
            },
        };

        const dataSetter = (text, node) => {
            node.data.name = text;
        };
        const dataGetter = node => node.data.name;

        const dataFetcher = async (node): Promise<ProjectGroup[]> => {
            try {
                const params: any = {
                    sort: { key: 'name', desc: false },
                    item_type: 'ROOT',
                    check_child: true,
                };

                if (node.data?.id && node.data?.item_type) {
                    params.item_id = node.data.id;
                    params.item_type = node.data.item_type;
                }

                const { items } = await SpaceConnector.client.identity.project.tree(params);
                return items;
            } catch (e) {
                console.error(e);
                return [];
            }
        };

        const onChangeSelect = (selected) => {
            state.selectedItem = selected.length > 0 ? selected[0] : {};
            emit('select', selected.length > 0 ? selected[0].node.data as ProjectGroup : null);
        };

        const changeSelectState = (node, path) => {
            state.root.changeSelectState(node, path);
        };

        const releaseProject = () => {
            if (state.selectedNode && state.root) {
                state.root.resetSelect();
            }
        };

        const refreshQuery = new ApiQueryHelper().setCountOnly();

        const onRefresh = async () => {
            if (!state.root) return;
            state.isLoading = true;
            state.hasProject = false;
            state.root.resetSelect();
            const [res] = await Promise.all([
                SpaceConnector.client.identity.project.list({
                    query: refreshQuery.data,
                }), state.root.fetchData(),
            ]);
            if (res.total_count) state.hasProject = true;
            state.isLoading = false;
        };


        const projectPath = vm?.$router.resolve({ name: PROJECT_ROUTE._NAME }).href;
        const goToProject = () => {
            window.open(projectPath);
        };
        const selectProjectName = computed(() => {
            if (state.selectedNode) {
                return state.selectedNode.data.name;
            }
            return '';
        });


        const confirm = () => {
            if (state.selectedNode) {
                emit('confirm', state.selectedNode.data);
            } else {
                emit('confirm', null);
            }
        };

        const onTreeInit = async (root) => {
            state.root = root;
        };

        return {
            ...toRefs(state),
            toggleOptions,
            selectOptions,
            dataSetter,
            dataGetter,
            dataFetcher,
            onChangeSelect,
            changeSelectState,
            releaseProject,
            onRefresh,
            goToProject,
            selectProjectName,
            confirm,
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
    .tree-node-back {
        &:not(:hover) .right-extra {
            display: none;
        }
    }
}
</style>
