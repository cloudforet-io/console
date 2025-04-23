<script lang="ts" setup>
import {
    computed,
    reactive,
    ref,
    watch, onUnmounted,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { cloneDeep } from 'lodash';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import {
    POverlayLayout, PButton, PDataLoader, PEmpty, PToolbox,
} from '@cloudforet/mirinae';
import type { QueryTag } from '@cloudforet/mirinae/types/controls/search/query-search-tags/type';
import type {
    HandlerResponse, KeyDataType, KeyItem, KeyItemSet, ValueHandler, ValueMenuItem,
} from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';
import { i18n } from '@/translations';

import { useQueryTags } from '@/common/composables/query-tags';

import { DASHBOARD_CONTROL_MENU_ACTION_TYPES } from '@/services/_shared/dashboard/core/constants/dashboard-control-menu-constant';
import { DASHBOARD_SHARED_ENTRY_POINT } from '@/services/_shared/dashboard/core/constants/dashboard-shared-constant';
import type { DashboardControlActionType } from '@/services/_shared/dashboard/core/types/dashboard-control-menu-type';
import DashboardFolderTree from '@/services/dashboards/components/dashboard-folder/DashboardFolderTree.vue';
import { getDashboardTreeData, isPublicControlButtonDisabled } from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import { useDashboardTreeControlStore } from '@/services/dashboards/stores/dashboard-tree-control-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';
import { useProjectDashboardFolderQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-folder-query';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectDashboardSearchQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-search-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { useProjectDashboardModalStore } from '@/services/project/v2/stores/Project-dashboard-modal-store';

import { PROJECT_ROUTE_V2 } from '../routes/route-constant';

const queryTagsHelper = useQueryTags({
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'labels', label: 'Label' },
        ],
    }],
});

interface Props {
    projectGroupOrProjectId?: string;
}
const props = defineProps<Props>();

const projectDashboardModalStore = useProjectDashboardModalStore();
const visible = computed(() => projectDashboardModalStore.state.dashboardEditOverlayVisible);
const searchFilters = ref<ConsoleFilter[]>([]);

const projectGroupOrProjectId = computed(() => props.projectGroupOrProjectId);
const { projectGroupId, projectId } = useProjectOrGroupId(projectGroupOrProjectId);
const dashboardTreeControlStore = useDashboardTreeControlStore();
const dashboardTreeControlState = dashboardTreeControlStore.state;
const router = useRouter();

/* Query */
const {
    dashboardFolderList,
    dashboardFolderSharedList,
    isLoading: isFolderLoading,
} = useProjectDashboardFolderQuery({
    projectId,
    projectGroupId,
});
const {
    dashboardList,
    dashboardSharedList,
    isLoading: isDashboardLoading,
} = useProjectDashboardQuery({
    projectId,
    projectGroupId,
});

const {
    dashboardIdList,
    isSearching,
} = useProjectDashboardSearchQuery({
    searchFilters: computed(() => searchFilters.value),
});


const state = reactive({
    headerTitle: computed(() => i18n.t('Edit Dashboard List')),
});
const queryState = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'labels', label: 'Label' },
        ],
    }]),
    valueHandlerMap: computed(() => ({
        labels: getDashboardValueHandler(),
    })),
    queryTags: computed<QueryTag[]>(() => queryTagsHelper.queryTags.value),
    searchText: computed<string>(() => {
        if (!searchFilters.value.length) return '';
        const filter = searchFilters.value.find((_filter) => !_filter.k && !!_filter.v);
        if (!filter) return '';
        return String(filter.v);
    }),
});

const dashboardItems = computed<PublicDashboardModel[]>(() => [...dashboardSharedList.value, ...dashboardList.value]);
const dashboardFolderItems = computed<PublicFolderModel[]>(() => [...dashboardFolderSharedList.value, ...dashboardFolderList.value]);
const dashboardTreeData = computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(dashboardFolderItems.value, dashboardItems.value, dashboardTreeControlState.newIdList));
const refinedDashboardTreeData = computed<TreeNode<DashboardTreeDataType>[]>(() => {
    if (isSearching.value) return [];
    if (!searchFilters.value.length) return dashboardTreeData.value;
    return getSearchedTreeData(dashboardTreeData.value, dashboardIdList.value);
});
const publicTreeControlButtonDisableMap = computed<Record<string, boolean>>(() => {
    const _selectedPublicIdList: string[] = Object.entries(dashboardTreeControlState.selectedPublicIdMap).filter(([, isSelected]) => isSelected).map(([id]) => id);
    return {
        clone: _selectedPublicIdList.length === 0,
        move: isPublicControlButtonDisabled(dashboardItems.value, dashboardFolderItems.value, dashboardTreeControlState.selectedPublicIdMap, true),
        delete: isPublicControlButtonDisabled(dashboardItems.value, dashboardFolderItems.value, dashboardTreeControlState.selectedPublicIdMap, true),
    };
});

/* Util */
const getSearchedTreeData = (treeData: TreeNode<DashboardTreeDataType>[], searchedDashboardIdList: Set<string>): TreeNode<DashboardTreeDataType>[] => {
    const _results = [] as TreeNode<DashboardTreeDataType>[];
    treeData.forEach((node) => {
        if (node.data.type === 'DASHBOARD') {
            if (searchedDashboardIdList.has(node.data.id)) {
                _results.push(cloneDeep(node));
            }
        } else {
            const _children = getSearchedTreeData(node.children || [], searchedDashboardIdList);
            if (_children.length) {
                const _node = cloneDeep(node);
                _node.children = _children;
                _results.push(_node);
            }
        }
    });
    return _results;
};
const getDashboardValueHandler = (): ValueHandler | undefined => {
    const publicLabelsValueHandler = makeDistinctValueHandler('dashboard.PublicDashboard', 'labels');
    if (!publicLabelsValueHandler) return undefined;

    return async (inputText: string|number, keyItem: KeyItem, currentDataType?: KeyDataType, subPath?: string) => {
        const results = [] as ValueMenuItem[];
        const promises = [] as (HandlerResponse | Promise<HandlerResponse>)[];

        if (publicLabelsValueHandler) promises.push(publicLabelsValueHandler(inputText, keyItem, currentDataType, subPath));
        const responses = await Promise.allSettled(promises);

        // combine both of results and sort
        responses.forEach((res) => {
            if (res.status === 'fulfilled') {
                res.value.results.forEach((item) => {
                    if (results.some((d) => d.name === item.name)) return;
                    results.push(item);
                });
            }
        });
        results.sort((a, b) => (a.label > b.label ? 1 : -1));

        return {
            results,
            totalCount: results.length ?? 0,
        };
    };
};

/* Event */
const handleCreateDashboard = () => {
    const dashboardCreateRouteName = PROJECT_ROUTE_V2.DASHBOARD_CREATE._NAME;
    router.push({ name: dashboardCreateRouteName }).catch(() => {});
    projectDashboardModalStore.closeDashboardEditOverlay();
    dashboardTreeControlStore.reset();
};
const handleCreateFolder = () => {
    dashboardTreeControlStore.reset();
    projectDashboardModalStore.openCreateFolderFormModal();
};
const handleUpdateSelectedIdMap = (selectedIdMap: Record<string, boolean>) => {
    dashboardTreeControlStore.setSelectedPublicIdMap(selectedIdMap);
};
const handleClose = () => {
    projectDashboardModalStore.closeDashboardEditOverlay();
};
const handleQueryChange = (options: ToolboxOptions = {}) => {
    if (options.queryTags !== undefined) {
        dashboardTreeControlStore.setSearchQueryTags(options.queryTags);
    }
};
const handleSelectControlActions = (type: DashboardControlActionType, id: string) => {
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.EDIT) {
        if (id.includes('folder')) {
            projectDashboardModalStore.openEditFolderFormModal(id);
        } else {
            projectDashboardModalStore.openDashboardNameEditModal(id);
        }
    }
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.CLONE) {
        if (id.includes('folder')) {
            projectDashboardModalStore.openDashboardBundleCloneModal(id);
        } else {
            projectDashboardModalStore.openDashboardCloneModal(id);
        }
    }
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.MOVE) projectDashboardModalStore.openDashboardChangeFolderModal(id);
    if (type === DASHBOARD_CONTROL_MENU_ACTION_TYPES.DELETE) {
        if (id.includes('folder')) {
            projectDashboardModalStore.openDashboardBundleDeleteModal();
        } else {
            projectDashboardModalStore.openDashboardDeleteModal(id);
        }
    }
};
const handleClickControlDelete = () => {
    projectDashboardModalStore.openDashboardBundleDeleteModal();
};
const handleClickControlMove = () => {
    projectDashboardModalStore.openDashboardBundleMoveModal();
};
const handleClickControlClone = () => {
    projectDashboardModalStore.openDashboardBundleCloneModal();
};
const handleClickTreeItem = (node: TreeNode<DashboardTreeDataType>) => {
    if (!props.projectGroupOrProjectId) {
        console.error('projectGroupOrProjectId is not defined');
        return;
    }
    if (node.data.type === 'DASHBOARD') {
        router.push({
            name: PROJECT_ROUTE_V2._NAME,
            params: {
                projectGroupOrProjectId: props.projectGroupOrProjectId,
                dashboardId: node.data.id,
            },
        }).catch(() => {});
    }
};

watch(() => dashboardTreeControlState.searchQueryTags, async (queryTags: QueryTag[]) => {
    queryTagsHelper.setQueryTags(queryTags || []);
    dashboardTreeControlStore.resetSelectedIdMap();
    searchFilters.value = queryTagsHelper.filters.value;
}, { immediate: true });

onUnmounted(() => {
    searchFilters.value = [];
});

</script>

<template>
    <p-overlay-layout class="dashboard-edit-list-overlay"
                      style-type="primary"
                      size="md"
                      :title="state.headerTitle"
                      :visible="visible"
                      @close="handleClose"
    >
        <template #default>
            <div class="dashboard-edit-list-overlay-body">
                <div class="dashboard-tree-list-layout overflow-auto">
                    <div class="layout-header flex justify-between items-center pb-4">
                        <p class="text-label-lg text-gray-700 font-bold">
                            {{ i18n.t('Dashboard List') }}
                        </p>
                        <div class="inline-flex items-center gap-2">
                            <p-button icon-left="ic_plus"
                                      style-type="tertiary"
                                      size="sm"
                                      @click="handleCreateFolder"
                            >
                                {{ i18n.t('PROJECT.DASHBOARD.CREATE.CREATE_FOLDER') }}
                            </p-button>
                            <p-button icon-left="ic_plus"
                                      style-type="secondary"
                                      size="sm"
                                      @click="handleCreateDashboard"
                            >
                                {{ i18n.t('PROJECT.DASHBOARD.CREATE.CREATE_DASHBOARD') }}
                            </p-button>
                        </div>
                    </div>
                    <p-toolbox filters-visible
                               search-type="query"
                               placeholder="Search Dashboard"
                               :pagination-visible="false"
                               :page-size-changeable="false"
                               :key-item-sets="queryState.keyItemSets"
                               :value-handler-map="queryState.valueHandlerMap"
                               :query-tags="queryState.queryTags"
                               @change="handleQueryChange"
                               @refresh="handleQueryChange()"
                    />
                    <p-data-loader :loading="isDashboardLoading || isFolderLoading"
                                   :data="!!dashboardItems.length || !!dashboardFolderItems.length"
                                   class="dashboard-list-wrapper"
                    >
                        <template #no-data>
                            <p-empty show-image>
                                <template #image>
                                    <img alt="empty-default-image"
                                         src="@/assets/images/illust_jellyocto-with-a-telescope.svg"
                                    >
                                </template>
                                <template #button>
                                    <p-button icon-left="ic_plus_bold"
                                              @click="handleCreateDashboard"
                                    >
                                        {{ $t('DASHBOARDS.ALL_DASHBOARDS.CREAT_NEW_DASHBOARD') }}
                                    </p-button>
                                </template>
                                {{ $t('DASHBOARDS.ALL_DASHBOARDS.HELP_TEXT_CREATE') }}
                            </p-empty>
                        </template>
                        <dashboard-folder-tree :entry-point="DASHBOARD_SHARED_ENTRY_POINT.PROJECT"
                                               :selected-id-map="dashboardTreeControlState.selectedPublicIdMap"
                                               :dashboard-tree-data="refinedDashboardTreeData"
                                               :button-disable-map="publicTreeControlButtonDisableMap"
                                               :search-text="queryState.searchText"
                                               disable-favorite
                                               show-all
                                               show-control-buttons
                                               @update:selectedIdMap="handleUpdateSelectedIdMap"
                                               @select-control-actions="handleSelectControlActions"
                                               @click-control-delete="handleClickControlDelete"
                                               @click-control-move="handleClickControlMove"
                                               @click-control-clone="handleClickControlClone"
                                               @click-tree-item="handleClickTreeItem"
                        />
                    </p-data-loader>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="flex justify-end pr-6">
                <p-button style-type="primary"
                          size="md"
                          @click="handleClose"
                >
                    {{ $t('Done') }}
                </p-button>
            </div>
        </template>
    </p-overlay-layout>
</template>

<style lang="postcss" scoped>
.dashboard-edit-list-overlay {
    .dashboard-edit-list-overlay-body {
        @apply w-full h-full;
        padding: 0 1.5rem 1.5rem;

        .dashboard-tree-list-layout {
            @apply w-full h-full border border-gray-200 bg-gray-100 rounded-md;
            padding: 1rem;
        }
    }
}
</style>
