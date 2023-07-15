<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PI, PIconButton, PTree, PButton, PDataLoader,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { useProjectPageStore } from '@/services/project/store/project-page-store';
import type {
    ProjectItemResp,
} from '@/services/project/type';

interface Props {
    initGroupId?: string;
    manageDisabled?: boolean;
}

const props = defineProps<Props>();
const store = useStore();
const { t } = useI18n();

const projectPageStore = useProjectPageStore();
const state = reactive({
    hasRootProjectGroupManagePermission: computed(() => !props.manageDisabled && store.getters['user/hasDomainRole']),
    hasCurrentProjectGroupManagePermission: computed(() => !props.manageDisabled && projectPageStore.permissionInfo[(projectPageStore.groupId) ?? '']),
    loading: false,
    editOptions: computed(() => ({
        disabled: !projectPageStore.treeEditMode,
        editStartValidator: (item) => (projectPageStore.permissionInfo[item.data.id] || item.data.has_permission) && (item.data.item_type !== 'PROJECT'),
        validator: (text) => (text && text.length > 2 && text.length < 40),
        setDataAfterEdit: false,
    })),
    dragOptions: computed(() => ({
        disabled: !projectPageStore.treeEditMode,
        dragValidator(node, dragNodeParent) {
            if (!dragNodeParent) return !props.manageDisabled;
            return !!(projectPageStore.permissionInfo[node.data.id] || node.data.has_permission);
        },
        dropValidator(node, oldParent, parent) {
            if (oldParent?.data.id === parent?.data.id) return true;

            if (!parent) {
                if (node.data.item_type === 'PROJECT') return false;
                return !props.manageDisabled;
            }
            if (parent.data.item_type === 'PROJECT') return false;
            if (parent.children?.some((child) => child.data.name === node.data.name)) return false;
            return !!(projectPageStore.permissionInfo[parent.data.id] || parent.data.has_permission);
        },
    })),
    allProjectRoot: null as any,
    allProjectNode: computed(() => ([t('PROJECT.LANDING.ALL_PROJECT')])),
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
    'no-permission': projectPageStore.treeEditMode ? !projectPageStore.permissionInfo[data.id] && !data.has_permission : false,
});

const openProjectGroupDeleteCheckModal = (item) => {
    projectPageStore.openProjectGroupDeleteCheckModal(item);
};

const openProjectGroupCreateForm = (item = {}) => {
    projectPageStore.openProjectGroupCreateForm(item);
};

const startTreeEdit = () => {
    projectPageStore.$patch({ treeEditMode: true });
};

const finishTreeEdit = () => {
    projectPageStore.$patch({ treeEditMode: false });
};

const getAllCurrentItems = (): {path: number[]; node: any}[] => {
    if (!projectPageStore.rootNode) return [];
    return projectPageStore.rootNode.getAllItems();
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

        if (projectPageStore.treeEditMode) {
            params.include_permission = true;
            if (projectOnly) params.exclude_type = 'PROJECT_GROUP';
        } else {
            params.exclude_type = 'PROJECT';
        }

        const { items } = await SpaceConnector.client.identity.project.tree(params);

        if (!node.data) {
            projectPageStore.hasProjectGroup = Array.isArray(items) ? !!items.length : false;
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
    if (!projectPageStore.rootNode) return;

    const permittedItems = items.filter(({ node }) => projectPageStore.permissionInfo[node.data.id]);

    const newChildren: ProjectItemResp[][] = await Promise.all(permittedItems.map(({ node }) => dataFetcher(node, true)));

    permittedItems.forEach(({ node, path }, i) => {
        projectPageStore.rootNode?.updateNodeByPath(path, { ...node.data, has_child: node.data.has_child || newChildren[i].length > 0 });
        if (!node.$folded) projectPageStore.rootNode?.addChildNodeByPath(path, newChildren[i], false);
    });
};

const removeProjectNodes = async (items) => {
    if (!projectPageStore.rootNode) return;

    const projectItems = items.filter(({ node }) => node.data.item_type === 'PROJECT');

    projectItems.forEach(({ node }) => {
        projectPageStore.rootNode?.deleteNode((d) => d.id === node.data.id);
    });

    const projectGroupItems = items.filter(({ node }) => node.data.item_type === 'PROJECT_GROUP' && node.data.has_child);

    const newChildren: ProjectItemResp[][] = await Promise.all(projectGroupItems.map(({ node }) => dataFetcher(node)));

    projectGroupItems.forEach(({ node, path }, i) => {
        projectPageStore.rootNode?.updateNodeByPath(path, { ...node.data, has_child: newChildren[i].length > 0 });
    });
};

watch(() => projectPageStore.treeEditMode, async (treeEditMode) => {
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
        showSuccessMessage(t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
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
        showSuccessMessage(t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT_GROUP'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT_GROUP'));
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
        if (projectPageStore.groupId === oldParent?.data.id || projectPageStore.groupId === parent.data.id) {
            projectPageStore.$patch((_state) => {
                _state.selectedItem = { ...projectPageStore?.selectedItem };
            });
        }

        showSuccessMessage(t('PROJECT.LANDING.ALT_S_UPDATE_PROJECT'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.LANDING.ALT_E_UPDATE_PROJECT'));
        throw (e);
    }
};

const onDrop = async (node, oldParent, parent, rollback) => {
    if (!projectPageStore.rootNode) return;
    if (oldParent?.data.id === parent?.data.id) return;
    if (oldParent?.data.has_child && oldParent?.children.length === 1) {
        projectPageStore.rootNode.updateNode((d) => d.id === oldParent.data.id, {
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
    projectPageStore.$patch((_state) => {
        _state.selectedItem = selected[0] || {};
    });
};

const onAllProjectChangeSelect = (selected) => {
    if (selected.length > 0 && projectPageStore.groupId && projectPageStore.rootNode) {
        projectPageStore.rootNode.resetSelect();
    }
};

watch(() => projectPageStore.groupId, (data) => {
    if (!state.allProjectRoot) return;
    if (data) {
        state.allProjectRoot.resetSelect();
    } else {
        state.allProjectRoot.changeSelectState(state.allProjectNode, [0]);
    }
});

/* Init */
const onTreeInit = (root) => {
    projectPageStore.initRoot(root);
};

const onAllProjectTreeInit = (root) => {
    state.allProjectRoot = root;
};

watch([() => projectPageStore.rootNode, () => state.allProjectRoot], async ([rootNode, allProjectRoot]) => {
    if (rootNode && allProjectRoot) {
        if (projectPageStore.isInitiated) return;

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
        projectPageStore.$patch({ isInitiated: true });
        state.loading = false;
    }
}, { immediate: true });

</script>

<template>
    <sidebar-title :title="t('PROJECT.LANDING.PROJECT_GROUPS')">
        <template #extra>
            <div class="action-btn-wrapper">
                <p-button v-if="projectPageStore.treeEditMode"
                          size="sm"
                          style-type="highlight"
                          @click="finishTreeEdit"
                >
                    {{ t('PROJECT.LANDING.PROJECT_GROUP_TREE.DONE') }}
                </p-button>
                <template v-else>
                    <p-icon-button v-tooltip.bottom="t('PROJECT.LANDING.PROJECT_GROUP_TREE.EDIT')"
                                   name="ic_edit-text"
                                   style-type="transparent"
                                   size="sm"
                                   :disabled="manageDisabled"
                                   @click="startTreeEdit"
                    />
                    <p-icon-button v-tooltip.bottom="t('PROJECT.LANDING.PROJECT_GROUP_TREE.CREATE')"
                                   name="ic_plus_thin"
                                   style-type="transparent"
                                   size="sm"
                                   color="inherit"
                                   class="ml-1"
                                   :disabled="!(state.hasRootProjectGroupManagePermission || state.hasCurrentProjectGroupManagePermission)"
                                   @click="openProjectGroupCreateForm()"
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
                    <p-icon-button v-if="projectPageStore.treeEditMode && node.data.item_type !== 'PROJECT' && projectPageStore.permissionInfo[node.data.id]"
                                   name="ic_close"
                                   class="group-delete-btn"
                                   size="sm"
                                   color="inherit"
                                   :disabled="manageDisabled"
                                   @click.stop="openProjectGroupDeleteCheckModal({node, path})"
                    />
                    <p-icon-button v-if="!projectPageStore.treeEditMode && node.data.item_type !== 'PROJECT'"
                                   name="ic_plus"
                                   class="group-add-btn"
                                   size="sm"
                                   :disabled="manageDisabled || !projectPageStore.permissionInfo[node.data.id]"
                                   @click.stop="openProjectGroupCreateForm({node, path})"
                    />
                </template>
            </p-tree>
        </div>
    </p-data-loader>
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
