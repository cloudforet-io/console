<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PI, PIconButton, PTree, PButton, PDataLoader,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectGroupUpdateParameters } from '@/schema/identity/project-group/api-verbs/update';
import type { ProjectChangeProjectGroupParameters } from '@/schema/identity/project/api-verbs/change-project-group';
import { store } from '@/store';
import { i18n } from '@/translations';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { useProjectTree } from '@/services/project/composables/use-project-tree';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';
import type {
    ProjectTreeNodeData,
} from '@/services/project/types/project-tree-type';


interface Props {
    initGroupId?: string;
    manageDisabled?: boolean;
}
const props = defineProps<Props>();

const projectPageStore = useProjectPageStore();
const projectPageGetters = projectPageStore.getters;
const projectPageState = projectPageStore.state;
const state = reactive({
    hasRootProjectGroupManagePermission: computed(() => !props.manageDisabled && store.getters['user/hasDomainRole']),
    hasCurrentProjectGroupManagePermission: computed(() => !props.manageDisabled && projectPageState.permissionInfo[(projectPageGetters.groupId) ?? '']),
    loading: false,
    editOptions: computed(() => ({
        disabled: !projectPageState.treeEditMode,
        editStartValidator: (item) => (projectPageState.permissionInfo[item.data.id] || item.data.has_permission) && (item.data.item_type !== 'PROJECT'),
        validator: (text) => (text && text.length > 2 && text.length < 40),
        setDataAfterEdit: false,
    })),
    dragOptions: computed(() => ({
        disabled: !projectPageState.treeEditMode,
        dragValidator(node, dragNodeParent) {
            if (!dragNodeParent) return !props.manageDisabled;
            return !!(projectPageState.permissionInfo[node.data.id] || node.data.has_permission);
        },
        dropValidator(node, oldParent, parent) {
            if (oldParent?.data.id === parent?.data.id) return true;

            if (!parent) {
                if (node.data.item_type === 'PROJECT') return false;
                return !props.manageDisabled;
            }
            if (parent.data.item_type === 'PROJECT') return false;
            if (parent.children?.some((child) => child.data.name === node.data.name)) return false;
            return !!(projectPageState.permissionInfo[parent.data.id] || parent.data.has_permission);
        },
    })),
    allProjectRoot: null as any,
    allProjectNode: computed(() => ([i18n.t('PROJECT.LANDING.ALL_PROJECTS')])),
});
const projectTreeHelper = useProjectTree();

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
    'no-permission': projectPageState.treeEditMode ? !projectPageState.permissionInfo[data.id] && !data.has_permission : false,
});

const getAllCurrentItems = (): {path: number[]; node: any}[] => {
    if (!projectPageState.rootNode) return [];
    return projectPageState.rootNode.getAllItems();
};

const dataFetcher = async (node: any = {}, projectOnly = false): Promise<ProjectTreeNodeData[]> => {
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

        if (projectPageState.treeEditMode) {
            if (projectOnly) params.exclude_type = 'PROJECT_GROUP';
        } else {
            params.exclude_type = 'PROJECT';
        }

        const items = await projectTreeHelper.getProjectTree(params);

        if (!node.data) {
            projectPageState.hasProjectGroup = Array.isArray(items) ? !!items.length : false;
        }

        projectPageStore.addPermissionInfo(items.filter((d) => d.item_type === 'PROJECT_GROUP')
            .map((d) => d.id));
        return items;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const addProjectNodes = async (items) => {
    if (!projectPageState.rootNode) return;

    const permittedItems = items.filter(({ node }) => projectPageState.permissionInfo[node.data.id]);

    const newChildren: ProjectTreeNodeData[][] = await Promise.all(permittedItems.map(({ node }) => dataFetcher(node, true)));

    permittedItems.forEach(({ node, path }, i) => {
        projectPageState.rootNode?.updateNodeByPath(path, { ...node.data, has_child: node.data.has_child || newChildren[i].length > 0 });
        if (!node.$folded) projectPageState.rootNode?.addChildNodeByPath(path, newChildren[i], false);
    });
};

const removeProjectNodes = async (items) => {
    if (!projectPageState.rootNode) return;

    const projectItems = items.filter(({ node }) => node.data.item_type === 'PROJECT');

    projectItems.forEach(({ node }) => {
        projectPageState.rootNode?.deleteNode((d) => d.id === node.data.id);
    });

    const projectGroupItems = items.filter(({ node }) => node.data.item_type === 'PROJECT_GROUP' && node.data.has_child);

    const newChildren: ProjectTreeNodeData[][] = await Promise.all(projectGroupItems.map(({ node }) => dataFetcher(node)));

    projectGroupItems.forEach(({ node, path }, i) => {
        projectPageState.rootNode?.updateNodeByPath(path, { ...node.data, has_child: newChildren[i].length > 0 });
    });
};

watch(() => projectPageState.treeEditMode, async (treeEditMode) => {
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
        await SpaceConnector.clientV2.identity.projectGroup.update<ProjectGroupUpdateParameters>({
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
            project_group_id: node.data.id,
            name: editText,
        });

        dataSetter(editText, node);
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
    }
};

const updateProjectGroup = async (node, oldParent, parent) => {
    try {
        await SpaceConnector.clientV2.identity.projectGroup.update<ProjectGroupUpdateParameters>({
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
            project_group_id: node.data.id,
            parent_group_id: parent?.data?.id || undefined,
        });
        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
        throw (e);
    }
};

const updateProject = async (node, oldParent, parent) => {
    try {
        await SpaceConnector.clientV2.identity.project.changeProjectGroup<ProjectChangeProjectGroupParameters>({
            project_id: node.data.id,
            project_group_id: parent?.data?.id || undefined,
            domain_id: store.state.domain.domainId, // TODO: remove domain_id after backend is ready
        });

        // this is for refresh project list cards
        if (projectPageGetters.groupId === oldParent?.data.id || projectPageGetters.groupId === parent.data.id) {
            projectPageStore.setSelectedItem(cloneDeep(projectPageState?.selectedItem));
        }

        showSuccessMessage(i18n.t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT'));
        throw (e);
    }
};

const onDrop = async (node, oldParent, parent, rollback) => {
    if (!projectPageState.rootNode) return;
    if (oldParent?.data.id === parent?.data.id) return;
    if (oldParent?.data.has_child && oldParent?.children.length === 1) {
        projectPageState.rootNode.updateNode((d) => d.id === oldParent.data.id, {
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
    projectPageStore.setSelectedItem(selected[0] || {});
};

const onAllProjectChangeSelect = (selected) => {
    if (selected.length > 0 && projectPageGetters.groupId && projectPageState.rootNode) {
        projectPageState.rootNode.resetSelect();
    }
};

watch(() => projectPageGetters.groupId, (data) => {
    if (!state.allProjectRoot) return;
    if (data) {
        state.allProjectRoot.resetSelect();
    } else {
        state.allProjectRoot.changeSelectState(state.allProjectNode, [0]);
    }
});

/* Init */
const onTreeInit = (root) => {
    projectPageStore.setRootNode(root);
};

const onAllProjectTreeInit = (root) => {
    state.allProjectRoot = root;
};

watch([() => projectPageState.rootNode, () => state.allProjectRoot], async ([rootNode, allProjectRoot]) => {
    if (rootNode && allProjectRoot) {
        if (projectPageState.isInitiated) return;

        state.loading = true;
        if (props.initGroupId) {
            const res = await projectPageStore.selectNode(props.initGroupId);

            if (!res) {
                allProjectRoot.changeSelectState(state.allProjectNode, [0]);
                await rootNode.fetchData();
            }
        } else {
            allProjectRoot.changeSelectState(state.allProjectNode, [0]);
            await rootNode.fetchData();
        }
        projectPageStore.setIsInitiated(true);
        state.loading = false;
    }
}, { immediate: true });
</script>

<template>
    <fragment>
        <sidebar-title :title="$t('PROJECT.LANDING.PROJECT_GROUPS')">
            <template #extra>
                <div class="action-btn-wrapper">
                    <p-button v-if="projectPageState.treeEditMode"
                              size="sm"
                              style-type="highlight"
                              @click="projectPageStore.setTreeEditMode(false)"
                    >
                        {{ $t('PROJECT.LANDING.PROJECT_GROUP_TREE.DONE') }}
                    </p-button>
                    <template v-else>
                        <p-icon-button v-tooltip.bottom="$t('PROJECT.LANDING.PROJECT_GROUP_TREE.EDIT')"
                                       name="ic_edit-text"
                                       style-type="transparent"
                                       size="sm"
                                       :disabled="props.manageDisabled"
                                       @click="projectPageStore.setTreeEditMode(true)"
                        />
                        <p-icon-button v-tooltip.bottom="$t('PROJECT.LANDING.PROJECT_GROUP_TREE.CREATE')"
                                       name="ic_plus_thin"
                                       style-type="transparent"
                                       size="sm"
                                       color="inherit"
                                       class="ml-1"
                                       :disabled="!(state.hasRootProjectGroupManagePermission || state.hasCurrentProjectGroupManagePermission)"
                                       @click="projectPageStore.openProjectGroupFormModal()"
                        />
                    </template>
                </div>
            </template>
        </sidebar-title>

        <p-data-loader :loading="state.loading">
            <div class="mx-3">
                <p-tree :data-fetcher="() => state.allProjectNode"
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

                <p-tree :edit-options="state.editOptions"
                        :drag-options="state.dragOptions"
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
                        <p-icon-button v-if="projectPageState.treeEditMode && node.data.item_type !== 'PROJECT' && projectPageState.permissionInfo[node.data.id]"
                                       name="ic_close"
                                       class="group-delete-btn"
                                       size="sm"
                                       color="inherit"
                                       :disabled="props.manageDisabled"
                                       @click.stop="projectPageStore.openProjectGroupDeleteCheckModal({node, path})"
                        />
                        <p-icon-button v-if="!projectPageState.treeEditMode && node.data.item_type !== 'PROJECT'"
                                       name="ic_plus"
                                       class="group-add-btn"
                                       size="sm"
                                       :disabled="props.manageDisabled || !projectPageState.permissionInfo[node.data.id]"
                                       @click.stop="projectPageStore.openProjectGroupFormModal({node, path})"
                        />
                    </template>
                </p-tree>
            </div>
        </p-data-loader>
    </fragment>
</template>

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
