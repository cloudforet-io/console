<template>
    <fragment>
        <sidebar-title :title="$t('PROJECT.LANDING.PROJECT_GROUPS')">
            <template #extra>
                <div class="action-btn-wrapper">
                    <p-button v-if="treeEditMode"
                              size="sm"
                              style-type="highlight"
                              @click="finishTreeEdit"
                    >
                        {{ $t('PROJECT.LANDING.PROJECT_GROUP_TREE.DONE') }}
                    </p-button>
                    <template v-else>
                        <p-icon-button v-tooltip.bottom="$t('PROJECT.LANDING.PROJECT_GROUP_TREE.EDIT')"
                                       name="ic_edit-text"
                                       style-type="transparent"
                                       size="sm"
                                       :disabled="manageDisabled"
                                       @click="startTreeEdit"
                        />
                        <p-icon-button v-tooltip.bottom="$t('PROJECT.LANDING.PROJECT_GROUP_TREE.CREATE')"
                                       name="ic_plus_thin"
                                       style-type="transparent"
                                       size="sm"
                                       color="inherit"
                                       class="ml-1"
                                       :disabled="!(hasRootProjectGroupManagePermission || hasCurrentProjectGroupManagePermission)"
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
                        fetch-on-init
                        @init="onAllProjectTreeInit"
                        @change-select="onAllProjectChangeSelect"
                >
                    <template #left-extra>
                        <p-i name="ic_dots-4-square"
                             width="1rem"
                             height="1rem"
                             class="all-project-button"
                             color="inherit"
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
                        @init="onTreeInit"
                        @finish-edit="onFinishEdit"
                        @drop="onDrop"
                        @change-select="onChangeSelect"
                >
                    <template #data="{node}">
                        {{ node.data.name }}
                    </template>
                    <template #icon="{node}">
                        <p-i :name="node.data.item_type === 'PROJECT' ? 'ic_document-filled' : 'ic_folder-filled'"
                             class="project-group-icon"
                             color="inherit"
                             width="1rem"
                             height="1rem"
                        />
                        <favorite-button v-if="node.data.item_type === 'PROJECT_GROUP'"
                                         :item-id="node.data.id"
                                         :favorite-type="FAVORITE_TYPE.PROJECT_GROUP"
                                         scale="0.75"
                                         read-only
                                         class="mr-1"
                        />
                    </template>
                    <template #right-extra="{node, path}">
                        <p-icon-button v-if="treeEditMode && node.data.item_type !== 'PROJECT' && permissionInfo[node.data.id]"
                                       name="ic_delete"
                                       class="group-delete-btn"
                                       size="sm"
                                       color="inherit"
                                       :disabled="manageDisabled"
                                       @click.stop="openProjectGroupDeleteCheckModal({node, path})"
                        />
                        <p-icon-button v-if="!treeEditMode && node.data.item_type !== 'PROJECT'"
                                       name="ic_plus"
                                       class="group-add-btn"
                                       size="sm"
                                       :disabled="manageDisabled || !permissionInfo[node.data.id]"
                                       @click.stop="openProjectGroupCreateForm({node, path})"
                        />
                    </template>
                </p-tree>
            </div>
        </p-data-loader>
    </fragment>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PI, PIconButton, PTree, PButton, PDataLoader,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import type {
    ProjectItemResp,
} from '@/services/project/type';

export default {
    name: 'ProjectTree',
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
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            hasRootProjectGroupManagePermission: computed(() => !props.manageDisabled && store.getters['user/hasDomainRole']),
            hasCurrentProjectGroupManagePermission: computed(() => !props.manageDisabled && state.permissionInfo[store.getters['service/project/groupId']]),
            loading: false,
            rootNode: computed(() => store.state.service.project.rootNode),
            permissionInfo: computed(() => store.state.service.project.permissionInfo),
            treeEditMode: computed(() => store.state.service.project.treeEditMode),
            editOptions: computed(() => ({
                disabled: !state.treeEditMode,
                editStartValidator: (item) => (state.permissionInfo[item.data.id] || item.data.has_permission) && (item.data.item_type !== 'PROJECT'),
                validator: (text) => (text && text.length > 2 && text.length < 40),
                setDataAfterEdit: false,
            })),
            dragOptions: computed(() => ({
                disabled: !state.treeEditMode,
                dragValidator(node, dragNodeParent) {
                    if (!dragNodeParent) return !props.manageDisabled;
                    return !!(state.permissionInfo[node.data.id] || node.data.has_permission);
                },
                dropValidator(node, oldParent, parent) {
                    if (oldParent?.data.id === parent?.data.id) return true;

                    if (!parent) {
                        if (node.data.item_type === 'PROJECT') return false;
                        return !props.manageDisabled;
                    }
                    if (parent.data.item_type === 'PROJECT') return false;
                    if (parent.children?.some((child) => child.data.name === node.data.name)) return false;
                    return !!(state.permissionInfo[parent.data.id] || parent.data.has_permission);
                },
            })),
            allProjectRoot: null as any,
            allProjectNode: computed(() => ([i18n.t('PROJECT.LANDING.ALL_PROJECT')])),
        });

        const toggleOptions = {
            validator: (node) => node.data.has_child || node.children.length > 0,
            removeChildrenOnFold: true,
        };

        const selectOptions = {
            validator({ data }) {
                return data.item_type === 'PROJECT_GROUP';
            },
        };

        const dataSetter = (text, node) => {
            node.data.name = text;
        };
        const dataGetter = (node) => node.data.name;

        const getClassNames = ({ data }) => ({
            'no-permission': state.treeEditMode ? !state.permissionInfo[data.id] && !data.has_permission : false,
        });

        const openProjectGroupDeleteCheckModal = (item) => {
            store.dispatch('service/project/openProjectGroupDeleteCheckModal', item);
        };

        const openProjectGroupCreateForm = (item = {}) => {
            store.dispatch('service/project/openProjectGroupCreateForm', item);
        };

        const startTreeEdit = () => {
            store.commit('service/project/setTreeEditMode', true);
        };

        const finishTreeEdit = () => {
            store.commit('service/project/setTreeEditMode', false);
        };

        const getAllCurrentItems = (): {path: number[]; node: any}[] => {
            if (!state.rootNode) return [];
            return state.rootNode.getAllItems();
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
                    store.commit('service/project/setHasProjectGroup', Array.isArray(items) ? !!items.length : false);
                }

                store.dispatch(
                    'service/project/addPermissionInfo',
                    items.filter((d) => d.item_type === 'PROJECT_GROUP')
                        .map((d) => d.id),
                );
                return items;
            } catch (e) {
                ErrorHandler.handleError(e);
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
                state.rootNode.deleteNode((d) => d.id === node.data.id);
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
                await addProjectNodes(items);
            } else {
                await removeProjectNodes(items);
            }
            state.loading = false;
        });

        const onFinishEdit = async (node, editText: string) => {
            try {
                const params = {
                    project_group_id: node.data.id,
                    name: editText,
                };

                await SpaceConnector.client.identity.projectGroup.update(params);

                dataSetter(editText, node);
                showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
            }
        };

        const updateProjectGroup = async (node, oldParent, parent) => {
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
                showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
                throw (e);
            }
        };

        const updateProject = async (node, oldParent, parent) => {
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
                if (store.getters['service/project/groupId'] === oldParent?.data.id || store.getters['service/project/groupId'] === parent.data.id) {
                    store.commit('service/project/setSelectedItem', { ...store.state.service.project.selectedItem });
                }

                showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT'));
                throw (e);
            }
        };

        const onDrop = async (node, oldParent, parent, rollback) => {
            if (!state.rootNode) return;
            if (oldParent?.data.id === parent?.data.id) return;
            if (oldParent?.data.has_child && oldParent?.children.length === 1) {
                state.rootNode.updateNode((d) => d.id === oldParent.data.id, {
                    ...oldParent.data,
                    has_child: false,
                });
            }

            try {
                if (node.data.item_type === 'PROJECT_GROUP') {
                    await updateProjectGroup(node, oldParent, parent);
                } else {
                    await updateProject(node, oldParent, parent);
                }
            } catch (e) {
                rollback();
            }
        };

        const onChangeSelect = (selected) => {
            store.commit('service/project/setSelectedItem', selected[0] || {});
        };

        const onAllProjectChangeSelect = (selected) => {
            if (selected.length > 0 && store.getters['service/project/groupId'] && state.rootNode) {
                state.rootNode.resetSelect();
            }
        };

        watch(() => store.getters['service/project/groupId'], (data) => {
            if (!state.allProjectRoot) return;
            if (data) {
                state.allProjectRoot.resetSelect();
            } else {
                state.allProjectRoot.changeSelectState(state.allProjectNode, [0]);
            }
        });

        /* Init */
        const onTreeInit = (root) => {
            store.dispatch('service/project/initRoot', root);
        };

        const onAllProjectTreeInit = (root) => {
            state.allProjectRoot = root;
        };

        watch([() => state.rootNode, () => state.allProjectRoot], async ([rootNode, allProjectRoot]) => {
            if (rootNode && allProjectRoot) {
                if (store.state.service.project.isInitiated) return;

                state.loading = true;
                if (props.initGroupId) {
                    const res = await store.dispatch('service/project/selectNode', props.initGroupId);
                    if (!res) {
                        allProjectRoot.changeSelectState(state.allProjectNode, [0]);
                        await rootNode.fetchData();
                    }
                } else {
                    allProjectRoot.changeSelectState(state.allProjectNode, [0]);
                    await rootNode.fetchData();
                }
                store.commit('service/project/setIsInitiated', true);
                state.loading = false;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            toggleOptions,
            selectOptions,
            FAVORITE_TYPE,
            dataSetter,
            dataGetter,
            getClassNames,
            openProjectGroupDeleteCheckModal,
            openProjectGroupCreateForm,
            startTreeEdit,
            finishTreeEdit,
            dataFetcher,
            onFinishEdit,
            onDrop,
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

/* custom design-system component - p-tree */
:deep(.p-tree) {
    .tree-node-back {
        &:not(:hover) .group-add-btn {
            display: none;
        }
        &:hover .data {
            max-width: 65% !important;
        }
        .data {
            max-width: 80%;
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
