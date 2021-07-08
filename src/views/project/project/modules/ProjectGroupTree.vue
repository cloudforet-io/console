<template>
    <fragment>
        <sidebar-title :title="$t('PROJECT.LANDING.PROJECT_GROUPS')">
            <template #extra>
                <div class="action-btn-wrapper">
                    <p-button v-if="treeEditMode" size="sm" style-type="secondary"
                              @click="finishTreeEdit"
                    >
                        {{ $t('PROJECT.LANDING.PROJECT_GROUP_TREE.DONE') }}
                    </p-button>
                    <template v-else>
                        <p-icon-button v-tooltip.bottom="$t('PROJECT.LANDING.PROJECT_GROUP_TREE.EDIT')"
                                       name="ic_edit-text" style-type="transparent" size="sm"
                                       @click="startTreeEdit"
                        />
                        <p-icon-button v-tooltip.bottom="$t('PROJECT.LANDING.PROJECT_GROUP_TREE.CREATE')"
                                       name="ic_plus_thin" style-type="transparent" size="sm"
                                       color="inherit"
                                       class="ml-1"
                                       @click="openProjectGroupCreateForm()"
                        />
                    </template>
                </div>
            </template>
        </sidebar-title>

        <p-data-loader :loading="loading">
            <div class="mx-3">
                <p-tree :data-fetcher="() => allProjectNode"
                        :toggle-options="{disabled: true}"
                        :edit-options="{disabled: true}"
                        :drag-options="{disabled: true}"
                        @init="onAllProjectTreeInit"
                        @change-select="onAllProjectChangeSelect"
                >
                    <template #left-extra>
                        <p-i name="ic_tree_all-projects" width="1rem" height="1rem"
                             class="all-project-button" color="inherit"
                        />
                    </template>
                </p-tree>

                <p-tree :edit-options="editOptions"
                        :drag-options="dragOptions"
                        :toggle-options="toggleOptions"
                        :select-options="selectOptions"
                        :data-setter="dataSetter"
                        :data-getter="dataGetter"
                        :data-fetcher="dataFetcher"
                        :get-class-names="getClassNames"
                        :fetch-on-init="false"
                        @init="onTreeInit"
                        @finish-edit="onFinishEdit"
                        @start-drag="onStartDrag"
                        @end-drag="onEndDrag"
                        @update-drag="onUpdateDrag"
                        @change-select="onChangeSelect"
                >
                    <template #data="{node}">
                        {{ node.data.name }}
                    </template>
                    <template #toggle="{node}">
                        <p-i v-if="node.loading" name="ic_working"
                             width="1rem" height="1rem"
                        />
                    </template>
                    <template #toggle-right="{node}">
                        <favorite-button v-if="node.data.item_type === 'PROJECT_GROUP'"
                                         :item-id="node.data.id"
                                         favorite-type="projectGroup"
                                         resource-type="identity.ProjectGroup"
                                         scale="0.75"
                                         read-only
                        />
                    </template>
                    <template #icon="{node}">
                        <p-i :name="node.data.item_type === 'PROJECT' ? 'ic_tree_project' : 'ic_tree_project-group'"
                             class="project-group-icon"
                             color="inherit"
                             width="1rem" height="1rem"
                        />
                    </template>
                    <template #right-extra="{node, path}">
                        <p-icon-button v-if="treeEditMode && node.data.item_type !== 'PROJECT' && (permissionInfo[node.data.id] || node.data.has_permission)"
                                       name="ic_delete" class="group-delete-btn"
                                       size="sm"
                                       color="inherit"
                                       @click.stop="openProjectGroupDeleteCheckModal({node, path})"
                        />
                        <p-icon-button v-if="!treeEditMode && node.data.item_type !== 'PROJECT'" name="ic_plus" class="group-add-btn"
                                       size="sm"
                                       @click.stop="openProjectGroupCreateForm({node, path})"
                        />
                    </template>
                </p-tree>
            </div>
        </p-data-loader>
    </fragment>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PI, PIconButton, PTree, PButton, PDataLoader,
} from '@spaceone/design-system';
import { TreeItem } from '@spaceone/design-system/dist/src/data-display/tree/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    ProjectItemResp,
} from '@/views/project/project/type';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import { store } from '@/store';
import SidebarTitle from '@/common/components/sidebar-title/SidebarTitle.vue';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

export default {
    name: 'ProjectGroupTree',
    components: {
        SidebarTitle,
        FavoriteButton,
        PTree,
        PIconButton,
        PI,
        PButton,
        PDataLoader,
    },
    props: {
        initGroupId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: false,
            rootNode: computed(() => store.state.projectPage.rootNode),
            permissionInfo: {},
            treeEditMode: computed(() => store.state.projectPage.treeEditMode),
            editOptions: computed(() => ({
                disabled: !state.treeEditMode,
                editStartValidator: item => !!(state.permissionInfo[item.data.id] || item.data.has_permission) || (item.data.item_type !== 'PROJECT'),
                validator: text => (text && text.length > 2 && text.length < 40),
                dataSetter(text, originData) {
                    return {
                        ...originData,
                        name: text,
                    };
                },
                dataGetter(data) {
                    return data.name;
                },
            })),
            dragOptions: computed(() => ({
                disabled: !state.treeEditMode,
                dragValidator(node, parent) {
                    if (!parent) return store.getters['user/isAdmin'];
                    return !!(state.permissionInfo[node.data.id] || node.data.has_permission);
                },
                dropValidator(node, parent) {
                    if (state.dragParent?.data.id === parent?.data.id) return true;

                    if (!parent) {
                        if (node.data.item_type === 'PROJECT') return false;
                        return store.getters['user/isAdmin'];
                    }
                    if (parent.data.item_type === 'PROJECT') return false;
                    if (parent.children.some(child => child.data.name === node.data.name)) return false;
                    return !!(state.permissionInfo[parent.data.id] || parent.data.has_permission);
                },
            })),
            dragParent: null as any,
            allProjectRoot: null as any,
            allProjectNode: computed(() => ([vm.$t('PROJECT.LANDING.ALL_PROJECT')])),
        });

        const toggleOptions = {
            validator: node => node.data.has_child || node.children.length > 0,
        };

        const selectOptions = {
            validator({ data }) {
                return data.item_type === 'PROJECT_GROUP';
            },
        };

        const dataSetter = (text, node) => {
            node.data.name = text;
        };
        const dataGetter = node => node.data.name;

        const getClassNames = ({ data }) => ({
            'no-permission': state.treeEditMode ? !state.permissionInfo[data.id] && !data.has_permission : false,
        });

        const openProjectGroupDeleteCheckModal = (item) => {
            store.dispatch('projectPage/openProjectGroupDeleteCheckModal', item);
        };

        const openProjectGroupCreateForm = (item = {}) => {
            store.dispatch('projectPage/openProjectGroupCreateForm', item);
        };

        const startTreeEdit = () => {
            store.commit('projectPage/setTreeEditMode', true);
        };

        const finishTreeEdit = () => {
            store.commit('projectPage/setTreeEditMode', false);
        };

        const getAllCurrentItems = (): {path: number[]; node: any}[] => {
            if (!state.rootNode) return [];
            return state.rootNode.getAllItems();
        };

        const permissionApiQueryHelper = new ApiQueryHelper();
        const setPermissionInfo = async (ids: string[]) => {
            const res = {};

            try {
                permissionApiQueryHelper.setOnly('project_group_id')
                    .setFilters([{ k: 'project_group_id', v: ids }]);

                const { results } = await SpaceConnector.client.identity.projectGroup.list({
                    query: permissionApiQueryHelper.data,
                    author_within: true,
                });
                results.forEach((d) => {
                    res[d.project_group_id] = true;
                });
            } catch (e) {
                console.error(e);
            }

            state.permissionInfo = res;
        };

        const dataFetcher = async (node: any = {}, projectOnly = false): Promise<ProjectItemResp[]> => {
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

                if (state.treeEditMode) {
                    params.include_permission = true;
                    if (projectOnly) params.exclude_type = 'PROJECT_GROUP';
                } else {
                    params.exclude_type = 'PROJECT';
                }

                const { items } = await SpaceConnector.client.identity.project.tree(params);

                if (!node.data) {
                    store.commit('projectPage/setHasProjectGroup', Array.isArray(items) ? !!items.length : false);
                }

                return items;
            } catch (e) {
                console.error(e);
                return [];
            }
        };

        const addProjectNodes = async (items) => {
            if (!state.rootNode) return;

            const permittedItems = items.filter(({ node }) => state.permissionInfo[node.data.id]);

            const newChildren: ProjectItemResp[][] = await Promise.all(permittedItems.map(({ node }) => dataFetcher(node, true)));

            permittedItems.forEach(({ node, path }, i) => {
                state.rootNode.updateNodeByPath(path, { ...node.data, has_child: node.data.has_child || newChildren[i].length > 0 });
                if (!node.$folded) state.rootNode.addChildNodeByPath(path, newChildren[i], false);
            });
        };

        const removeProjectNodes = async (items) => {
            if (!state.rootNode) return;

            const projectItems = items.filter(({ node }) => node.data.item_type === 'PROJECT');

            projectItems.forEach(({ node }) => {
                state.rootNode.deleteNode(d => d.id === node.data.id);
            });

            const projectGroupItems = items.filter(({ node }) => node.data.item_type === 'PROJECT_GROUP' && node.data.has_child);

            const newChildren: ProjectItemResp[][] = await Promise.all(projectGroupItems.map(({ node }) => dataFetcher(node)));

            projectGroupItems.forEach(({ node, path }, i) => {
                state.rootNode.updateNodeByPath(path, { ...node.data, has_child: newChildren[i].length > 0 });
            });
        };

        watch(() => state.treeEditMode, async (treeEditMode) => {
            const items = getAllCurrentItems();
            state.loading = true;
            if (treeEditMode) {
                await setPermissionInfo(items.map(d => d.node.data.id));
                await addProjectNodes(items);
            } else {
                await removeProjectNodes(items);
            }
            state.loading = false;
        });

        const onFinishEdit = async (item) => {
            try {
                const params = {
                    project_group_id: item.data.id,
                    name: item.data.name,
                };

                await SpaceConnector.client.identity.projectGroup.update(params);
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '', vm.$root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'), e, vm.$root);
            }
        };

        const onStartDrag = (node, parent) => {
            state.dragParent = parent;
        };

        const updateProjectGroup = async (node, parent) => {
            const params: any = {
                project_group_id: node.data.id,
            };
            if (parent) {
                params.parent_project_group_id = parent.data.id;
            } else {
                params.release_parent_project_group = true;
            }
            try {
                await SpaceConnector.client.identity.projectGroup.update(params);
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'), e, vm.$root);
            }
        };

        const updateProject = async (node, parent) => {
            const params: any = {
                project_id: node.data.id,
            };
            if (parent) {
                params.project_group_id = parent.data.id;
            } else {
                params.release_parent_project_group = true;
            }
            try {
                await SpaceConnector.client.identity.project.update(params);

                // this is for refresh project list cards
                if (store.getters['projectPage/groupId'] === state.dragParent?.data.id || store.getters['projectPage/groupId'] === parent.data.id) {
                    store.commit('projectPage/setSelectedItem', { ...store.state.projectPage.selectedItem });
                }

                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT'), e, vm.$root);
            }
        };

        const onEndDrag = () => {
            state.dragParent = null;
        };

        const onUpdateDrag = async (node, parent) => {
            if (!state.rootNode) return;
            if (state.dragParent?.data.id === parent?.data.id) return;

            if (state.dragParent?.data.has_child && state.dragParent?.children.length === 1) {
                state.rootNode.updateNode(d => d.id === state.dragParent.data.id, {
                    ...state.dragParent.data,
                    has_child: false,
                });
            }

            if (node.data.item_type === 'PROJECT_GROUP') {
                await updateProjectGroup(node, parent);
            } else {
                await updateProject(node, parent);
            }
        };

        const onChangeSelect = (selected) => {
            store.commit('projectPage/setSelectedItem', selected[0] || {});
        };

        const onAllProjectChangeSelect = (selected) => {
            if (selected.length > 0 && store.getters['projectPage/groupId'] && state.rootNode) {
                state.rootNode.resetSelect();
            }
        };

        watch(() => store.getters['projectPage/groupId'], (data) => {
            if (!state.allProjectRoot) return;
            if (data) {
                state.allProjectRoot.resetSelect();
            } else {
                state.allProjectRoot.changeSelectState(state.allProjectNode, [0]);
            }
        });


        /* Init */
        const onTreeInit = (root) => {
            store.dispatch('projectPage/initRoot', root);
        };

        const onAllProjectTreeInit = (root) => {
            state.allProjectRoot = root;
        };

        watch([() => state.rootNode, () => state.allProjectRoot], async ([rootNode, allProjectRoot]) => {
            if (rootNode && allProjectRoot) {
                if (store.state.projectPage.isInitiated) return;

                state.loading = true;
                if (props.initGroupId) {
                    const res = await store.dispatch('projectPage/selectNode', props.initGroupId);
                    if (!res) {
                        allProjectRoot.changeSelectState(state.allProjectNode, [0]);
                        await rootNode.fetchData();
                    }
                } else {
                    allProjectRoot.changeSelectState(state.allProjectNode, [0]);
                    await rootNode.fetchData();
                }
                store.commit('projectPage/setIsInitiated', true);
                state.loading = false;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            toggleOptions,
            selectOptions,
            dataSetter,
            dataGetter,
            getClassNames,
            openProjectGroupDeleteCheckModal,
            openProjectGroupCreateForm,
            startTreeEdit,
            finishTreeEdit,
            dataFetcher,
            onFinishEdit,
            onStartDrag,
            onEndDrag,
            onUpdateDrag,
            onChangeSelect,
            onTreeInit,
            onAllProjectTreeInit,
            onAllProjectChangeSelect,
        };
    },
};
</script>

<style lang="postcss" scoped>
.action-btn-wrapper {
    @apply ml-auto justify-end mr-3 inline-flex items-center;
}
.all-project-button {
    @apply mr-1;
}
.project-group-icon {
    @apply mx-1;
}
.group-add-btn, .group-delete-btn {
    @apply float-right mr-1;
    max-width: 1.5rem;
    max-height: 1.5rem;
    min-width: 1.5rem;
    min-height: 1.5rem;
    &:hover {
        @apply bg-blue-300 border-blue-300;
    }
    color: inherit;
}
.p-tree::v-deep {
    .tree-node-back {
        &:not(:hover) .group-add-btn {
            display: none;
        }
        .node.no-permission {
            > .data, > .icon {
                @apply text-gray-400;
                cursor: not-allowed;
            }
        }
    }
}
</style>
