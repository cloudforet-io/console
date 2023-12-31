<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PButton, PCheckbox, PI, PRadio, PSelectDropdown, PTree, PBadge,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceRouter } from '@/router';

import type { ReferenceMap } from '@/store/modules/reference/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ProjectTreeOptions } from '@/services/project/composables/use-project-tree';
import { useProjectTree } from '@/services/project/composables/use-project-tree';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import type {
    ProjectTreeItem, ProjectTreeNodeData, ProjectTreeRoot, ProjectTreeItemType,
    ProjectTreeNode,
} from '@/services/project/types/project-tree-type';


interface ProjectGroupSelectOptions {
    id: string;
    currentProjectGroupId?: string;
    type: 'PROJECT' | 'PROJECT_GROUP';
}
interface Props {
    multiSelectable?: boolean;
    projectSelectable?: boolean;
    projectGroupSelectable?: boolean;
    selectedProjectIds?: string[];
    invalid?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    useFixedMenuStyle?: boolean;
    projectGroupSelectOptions?: ProjectGroupSelectOptions;
}

const props = withDefaults(defineProps<Props>(), {
    multiSelectable: false,
    projectSelectable: true,
    projectGroupSelectable: true,
    selectedProjectIds: () => ([]),
    invalid: false,
    disabled: false,
    readonly: false,
    useFixedMenuStyle: true,
    projectGroupSelectOptions: undefined,
});

const emit = defineEmits<{(e: 'select', value: ProjectTreeNodeData[]): void;
    (e: 'close'): void;
    (e: 'update:selected-project-ids', value: string[]): void;
}>();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
});
const state = reactive({
    loading: true,
    visibleMenu: false,
    root: null as ProjectTreeRoot|null,
    // selected states
    selectedProjectItems: [] as ProjectTreeItem[],
    selectedProjects: computed<ProjectTreeNodeData[]>(() => state.selectedProjectItems.map((d) => d.node.data)),
    _selectedProjectIds: [...props.selectedProjectIds] as string[],
    selectedItems: computed<SelectDropdownMenuItem[]>({
        get() {
            const items: ReferenceMap = {
                ...storeState.projects,
                ...storeState.projectGroups,
            };
            return state._selectedProjectIds.map((id) => ({
                name: id,
                label: items[id]?.label,
            }));
        },
        set(val) {
            state._selectedProjectIds = val.map((d) => d.name);
        },
    }),
    selectComponent: computed(() => {
        if (props.multiSelectable) return PCheckbox;
        return PRadio;
    }),
    contextKey: Math.floor(Math.random() * Date.now()),
});
const projectTreeHelper = useProjectTree();

const getSearchPath = async (id: string|undefined, type?: ProjectTreeItemType): Promise<string[]> => {
    if (!id) return [];
    try {
        const res = await projectTreeHelper.getProjectTreeSearchPath({
            item_id: id,
            item_type: type,
        });
        return res.open_path || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const findNodes = async () => {
    if (!state.root) return;

    const pathList: string[][] = await Promise.all(props.selectedProjectIds.map((d) => getSearchPath(d, props.projectGroupSelectable ? 'PROJECT_GROUP' : 'PROJECT')));
    const predicateList = pathList.map((paths) => paths.map((d) => ((data) => data.id === d)));
    await state.root.fetchAndFindNodes(predicateList);
};

/* Tree props */
const predicate = (current: ProjectTreeNodeData, data: ProjectTreeNodeData): boolean => current?.id === data.id;
const toggleOptions = {
    validator: (node: ProjectTreeNode) => {
        if (props.projectGroupSelectOptions?.type === 'PROJECT_GROUP' && props.projectGroupSelectOptions?.id === node.data.id) {
            return false;
        }
        return node.data.item_type === 'PROJECT_GROUP' && (node.data.has_child || node.children.length > 0);
    },
    toggleOnNodeClick: true,
};
const selectOptions = computed(() => ({
    multiSelectable: props.multiSelectable,
    validator({ data }) {
        if (props.projectGroupSelectOptions?.type === 'PROJECT_GROUP' && props.projectGroupSelectOptions?.id === data.id) {
            return false;
        }
        return props.projectGroupSelectable ? true : data.item_type === 'PROJECT';
    },
}));
const dataSetter = (text: string, node: ProjectTreeNode) => {
    node.data.name = text;
};
const dataGetter = (node: ProjectTreeNode): string => node.data.name;
const dataFetcher = async (node: ProjectTreeNode): Promise<ProjectTreeNodeData[]> => {
    try {
        const params: ProjectTreeOptions = {
            sort: [{ key: 'name', desc: false }],
            item_type: 'ROOT',
            check_child: true,
        };

        if (!props.projectSelectable) params.exclude_type = 'PROJECT';

        if (node.data?.id && node.data?.item_type) {
            params.item_id = node.data.id;
            params.item_type = node.data.item_type;
        }

        if (props.projectGroupSelectOptions?.type === 'PROJECT_GROUP' && (props.projectGroupSelectOptions?.currentProjectGroupId === node.data?.id)) {
            params.query = {
                filter: [{
                    k: 'project_group_id',
                    v: props.projectGroupSelectOptions.id,
                    o: 'not',
                }],
            };
        }

        return await projectTreeHelper.getProjectTree(params);
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* Handlers */
const handleTreeInit = async (root: ProjectTreeRoot) => {
    state.root = root;

    state.loading = true;
    if (props.selectedProjectIds.length) {
        await findNodes();
    } else {
        await root.fetchData();
    }
    state.loading = false;
};

const handleTreeChangeSelect = (selected: ProjectTreeItem[]) => {
    if (!props.multiSelectable && state.selectedProjectItems === selected) return;

    state.selectedProjectItems = selected;
    state._selectedProjectIds = state.selectedProjects.map((d) => d.id);

    if (!props.multiSelectable) {
        if (state.visibleMenu) state.visibleMenu = false;
    }

    emit('select', state.selectedProjects);
};

const handleChangeSelectState = (node: ProjectTreeNode, path: number[], _, value: boolean) => {
    if (state.root) state.root.changeSelectState(node, path, value);
};

const handleDeleteTag = (_, index: number) => {
    if (state.selectedProjectItems[index]) {
        const { node, path } = state.selectedProjectItems[index];
        if (state.root) state.root.changeSelectState(node, path, false);
    }
};

const handleUpdateVisibleMenu = (value: boolean) => {
    state.visibleMenu = value;
    if (!value) emit('close');
};

const refreshProjectTree = async () => {
    await allReferenceStore.load('project', { force: true });
    state.contextKey = Math.floor(Math.random() * Date.now());
};

const handleClickCreateButton = () => {
    window.open(SpaceRouter.router.resolve({ name: PROJECT_ROUTE._NAME }).href);
    state.visibleMenu = false;
    handleUpdateVisibleMenu(false);
};

/* Watchers */
watch(() => props.selectedProjectIds, async (after, before) => {
    if (after !== state._selectedProjectIds) {
        await findNodes();

        /* when findNodes() has node delete function, this will be deprecated */
        if (after.length < before.length) {
            const deletedId = before.filter((d) => !after.includes(d))[0];
            const deletedIdx = state._selectedProjectIds.indexOf(deletedId);
            handleDeleteTag(deletedId, deletedIdx);
        }
    }
});

watch(() => state._selectedProjectIds, (selectedProjectIds) => {
    if (selectedProjectIds !== props.selectedProjectIds) {
        emit('update:selected-project-ids', selectedProjectIds);
    }
});
</script>

<template>
    <div class="project-select-dropdown">
        <p-select-dropdown :loading="state.loading"
                           :visible-menu="state.visibleMenu"
                           show-select-marker
                           :multi-selectable="props.multiSelectable"
                           :use-fixed-menu-style="props.useFixedMenuStyle"
                           :invalid="props.invalid"
                           :disabled="props.disabled"
                           :placeholder="$t('COMMON.PROJECT_SELECT_DROPDOWN.PLACEHOLDER')"
                           :selected.sync="state.selectedItems"
                           :readonly="props.readonly"
                           disable-handler
                           appearance-type="stack"
                           is-filterable
                           @update:visible-menu="handleUpdateVisibleMenu"
                           @delete-tag="handleDeleteTag"
        >
            <template #menu-no-data-format>
                <div />
            </template>
            <template v-if="props.projectGroupSelectOptions && state.selectedItems.length"
                      #dropdown-button
            >
                <p-badge v-if="props.projectGroupSelectOptions && state.selectedItems.some((d) => d.name === props.projectGroupSelectOptions.currentProjectGroupId)"
                         badge-type="subtle"
                         style-type="gray200"
                >
                    {{ $t('COMMON.PROJECT_SELECT_DROPDOWN.CURRENT') }}
                </p-badge>
                {{ state.selectedItems[0]?.label }}
            </template>
            <template #menu-menu>
                <div class="button-wrapper top">
                    <p-button icon-left="ic_refresh"
                              style-type="tertiary"
                              size="sm"
                              :disabled="state.loading"
                              @click.stop="refreshProjectTree"
                    >
                        {{ $t('COMMON.PROJECT_SELECT_DROPDOWN.RELOAD_PROJECT') }}
                    </p-button>
                </div>
                <p-tree :key="state.contextKey"
                        :edit-options="{disabled: true}"
                        :drag-options="{disabled: true}"
                        :toggle-options="toggleOptions"
                        :select-options="selectOptions"
                        :data-setter="dataSetter"
                        :data-getter="dataGetter"
                        :data-fetcher="dataFetcher"
                        @init="handleTreeInit"
                        @change-select="handleTreeChangeSelect"
                >
                    <template #data="{node}">
                        <span class="ml-1">{{ node.data.name }}</span>
                    </template>
                    <template #toggle-right="{node, path}">
                        <span>
                            <component :is="state.selectComponent"
                                       v-if="(node.data.item_type === 'PROJECT' && props.projectSelectable) || (node.data.item_type === 'PROJECT_GROUP' && props.projectGroupSelectable)"
                                       :selected="state.selectedProjects"
                                       :value="node.data"
                                       :predicate="predicate"
                                       class="mr-1"
                                       @change="handleChangeSelectState(node, path, ...arguments)"
                            />
                            <p-i :name="node.data.item_type === 'PROJECT_GROUP' ? 'ic_folder-filled' : 'ic_document-filled'" />
                            <p-badge v-if="props.projectGroupSelectOptions && node.data.id === props.projectGroupSelectOptions.currentProjectGroupId"
                                     badge-type="subtle"
                                     style-type="gray200"
                                     class="ml-1"
                            >
                                {{ $t('COMMON.PROJECT_SELECT_DROPDOWN.CURRENT') }}
                            </p-badge>
                        </span>
                    </template>
                </p-tree>
                <div class="button-wrapper">
                    <p-button icon-left="ic_plus_bold"
                              class="create-button"
                              style-type="secondary"
                              size="sm"
                              @click="handleClickCreateButton"
                    >
                        {{ $t('COMMON.PROJECT_SELECT_DROPDOWN.CREAT_PROJECT') }}
                    </p-button>
                </div>
            </template>
        </p-select-dropdown>
    </div>
</template>

<style lang="postcss" scoped>
.project-select-dropdown {
    .button-wrapper {
        padding: 0.5rem;

        &.top {
            padding-bottom: 0.25rem;
        }

        .create-button {
            width: 100%;
        }
    }

    /* custom design-system component - p-tree */

    :deep(.p-tree) {
        padding: 0.25rem;
        min-height: 12rem;

        .toggle-right {
            @apply flex-shrink-0;
        }
    }

    /* custom design-system component - p-context-menu */

    :deep(.p-context-menu) {
        .no-data {
            padding: 0;
        }
    }
}
</style>
