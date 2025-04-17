<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PCheckbox, PI, PRadio, PSelectDropdown, PTree, PBadge,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { SpaceRouter } from '@/router';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { ReferenceMap } from '@/store/reference/type';

import getRandomId from '@/lib/random-id-generator';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type {
    ProjectTreeItem, ProjectTreeNodeData, ProjectTreeRoot, ProjectTreeItemType,
    ProjectTreeNode,
} from '@/common/modules/project/project-tree-type';
import type { ProjectTreeOptions } from '@/common/modules/project/use-project-tree';
import { useProjectTree } from '@/common/modules/project/use-project-tree';

import { indigo, peacock } from '@/styles/colors';

import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

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
    position?: 'left' | 'right';
    selectionLabel?: TranslateResult;
    hideCreateButton?: boolean;
    workspaceId?: string;
    isInitSelectedItem?: boolean;
    block?: boolean;
    styleType?: string;
    appearanceType?: 'stack'|'badge';
    showDeleteAllButton?: boolean;
    showDropdownLeftArea?: boolean;
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
    position: 'left',
    selectionLabel: undefined,
    hideCreateButton: false,
    workspaceId: undefined,
    isInitSelectedItem: false,
    styleType: undefined,
    appearanceType: undefined,
    showDeleteAllButton: undefined,
    showDropdownLeftArea: false,
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
    contextKey: getRandomId(),
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

    let selectedItemType = undefined as ProjectTreeItemType|undefined;
    if (props.multiSelectable) {
        selectedItemType = props.projectGroupSelectable ? 'PROJECT_GROUP' : 'PROJECT';
    } else {
        selectedItemType = props.selectedProjectIds[0]?.includes('pg') ? 'PROJECT_GROUP' : 'PROJECT';
    }
    const pathList: string[][] = await Promise.all(props.selectedProjectIds.map((d) => getSearchPath(d, selectedItemType)));
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

const workspaceApiQuery = new ApiQueryHelper();
const dataFetcher = async (node: ProjectTreeNode): Promise<ProjectTreeNodeData[]> => {
    try {
        const params: ProjectTreeOptions = {
            sort: [{ key: 'name', desc: false }],
            item_type: 'ROOT',
            check_child: true,
        };

        if (props.workspaceId) {
            workspaceApiQuery.setFilters([
                { k: 'workspace_id', v: props.workspaceId, o: '=' },
            ]);
            params.query = workspaceApiQuery.data;
        }
        if (!props.projectSelectable) params.exclude_type = 'PROJECT';

        if (node.data?.id && node.data?.item_type) {
            params.item_id = node.data.id;
            params.item_type = node.data.item_type;
        }

        if (props.projectGroupSelectOptions?.type === 'PROJECT_GROUP' && (props.projectGroupSelectOptions?.currentProjectGroupId === node.data?.id)) {
            workspaceApiQuery.addFilter(
                { k: 'project_group_id', v: props.projectGroupSelectOptions?.id ?? '', o: '!=' },
            );
            params.query = workspaceApiQuery.data;
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
        if (state.visibleMenu && state._selectedProjectIds[0] !== props.selectedProjectIds[0]) state.visibleMenu = false;
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
    state.contextKey = getRandomId();
};

const handleClickCreateButton = () => {
    window.open(SpaceRouter.router.resolve({
        name: PROJECT_ROUTE_V2._NAME,
        ...(props.workspaceId ? { params: { workspaceId: props.workspaceId } } : {}),
    }).href);
    state.visibleMenu = false;
    handleUpdateVisibleMenu(false);
};

/* Watchers */
watch(() => props.selectedProjectIds, async (after, before) => {
    if (after !== state._selectedProjectIds) {
        if (props.readonly) {
            state._selectedProjectIds = after;
            state.selectedProjectItems = after.map((p) => {
                const reference = storeState.projects[p] || storeState.projectGroups[p];
                return {
                    name: p,
                    label: reference?.label ?? p,
                };
            });
            return;
        }
        await findNodes();

        /* when findNodes() has node delete function, this will be deprecated */
        if (after.length < before.length) {
            const deletedId = before.filter((d) => !after.includes(d))[0];
            const deletedIdx = state._selectedProjectIds.indexOf(deletedId);
            handleDeleteTag(deletedId, deletedIdx);
            if (props.isInitSelectedItem) {
                state._selectedProjectIds = [];
                state.selectedProjectItems = [];
            }
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
                           :show-select-marker="!props.readonly"
                           :multi-selectable="props.multiSelectable"
                           :use-fixed-menu-style="props.useFixedMenuStyle"
                           :invalid="props.invalid"
                           :disabled="props.disabled"
                           :placeholder="$t('COMMON.PROJECT_SELECT_DROPDOWN.PLACEHOLDER')"
                           :selected.sync="state.selectedItems"
                           :selection-label="props.selectionLabel"
                           :readonly="props.readonly"
                           :menu-position="props.position"
                           disable-handler
                           :show-delete-all-button="props.showDeleteAllButton"
                           :style-type="props.styleType"
                           :block="props.block"
                           :appearance-type="props.appearanceType"
                           :is-filterable="!props.readonly"
                           @update:visible-menu="handleUpdateVisibleMenu"
                           @delete-tag="handleDeleteTag"
        >
            <template v-if="props.showDropdownLeftArea"
                      #dropdown-left-area
            >
                <p-i name="ic_project"
                     width="1rem"
                     height="1rem"
                />
            </template>
            <template #menu-no-data-format>
                <div />
            </template>
            <template v-if="props.projectGroupSelectOptions && state.selectedItems.length"
                      #dropdown-button
            >
                <p-badge v-if="props.projectGroupSelectOptions && state.selectedItems.some((d) => d.name === props.projectGroupSelectOptions?.currentProjectGroupId)"
                         badge-type="subtle"
                         style-type="gray200"
                         class="current-badge"
                >
                    {{ $t('COMMON.PROJECT_SELECT_DROPDOWN.CURRENT') }}
                </p-badge>
                {{ state.selectedItems[0]?.label }}
            </template>
            <template v-if="!props.readonly"
                      #menu-menu
            >
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
                            <p-i :name="node.data.item_type === 'PROJECT_GROUP' ? 'ic_folder-filled' : 'ic_document-filled'"
                                 :color="node.data.item_type === 'PROJECT_GROUP' ? indigo[500] : peacock[600]"
                                 width="1rem"
                                 height="1rem"
                            />
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
                <div v-if="!props.hideCreateButton"
                     class="button-wrapper"
                >
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
    .current-badge {
        white-space: nowrap;
    }
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
