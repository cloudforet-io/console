<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PI, PTreeView } from '@cloudforet/mirinae';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';
import type { TreeDisplayMap } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import { gray } from '@/styles/colors';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardMainPageStore } from '@/services/dashboards/stores/dashboard-main-page-store';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';


interface Props {
    type: 'PUBLIC'|'PRIVATE';
}
const props = withDefaults(defineProps<Props>(), {
    type: 'PUBLIC',
});
const route = useRoute();
const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();
const dashboardMainPageStore = useDashboardMainPageStore();
const dashboardMainPageGetters = dashboardMainPageStore.getters;
const state = reactive({
    currentParentPathIds: [] as string[],
    currentFolderId: undefined as string|undefined,
    treeDisplayMap: {} as TreeDisplayMap,
    dashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
        if (props.type === 'PRIVATE') {
            return dashboardMainPageGetters.privateDashboardTreeData;
        }
        return dashboardMainPageGetters.publicDashboardTreeData;
    }),
    selectedTreeId: undefined as string|undefined,
});

/* Util */
const updateTreeDisplayMap = (selectedTreeId: string) => {
    state.treeDisplayMap[selectedTreeId] = { isOpen: !state.treeDisplayMap[selectedTreeId]?.isOpen };
    state.currentFolderId = selectedTreeId;
    state.treeDisplayMap = { ...state.treeDisplayMap };
};
const init = (dashboardId?: string, _onMounted?: boolean) => {
    if (!dashboardId) {
        state.selectedTreeId = undefined;
        return;
    }
    state.selectedTreeId = dashboardId as string;
    const dashboardItems = props.type === 'PRIVATE' ? dashboardMainPageGetters.privateDashboardItems : dashboardMainPageGetters.publicDashboardItems;
    const folderId = dashboardItems.find((d) => d.dashboard_id === dashboardId)?.folder_id;
    if (_onMounted && folderId) {
        updateTreeDisplayMap(folderId);
    }
};

/* Event */
const handleClickTreeItem = (node: TreeNode<DashboardTreeDataType>) => {
    if (node.data.type === 'FOLDER') {
        updateTreeDisplayMap(node.data.id);
        return;
    }
    router.push(getProperRouteLocation({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: {
            dashboardId: node.data.id || '',
        },
    }));
};

/* Watcher */
watch(() => route.params, ({ dashboardId }) => {
    init(dashboardId);
});

/* Lifecycle */
onMounted(() => {
    init(route.params.dashboardId, true);
});
</script>

<template>
    <div class="project-main-tree">
        <p-tree-view :tree-data="state.dashboardTreeData"
                     :tree-display-map="state.treeDisplayMap"
                     :selected-id="state.selectedTreeId"
        >
            <template #content="{ node }">
                <div class="dashboard-menu-item-content"
                     @click="handleClickTreeItem(node)"
                >
                    <div class="contents-wrapper">
                        <p-i class="dashboard-icon"
                             :name="Array.isArray(node.children) ? 'ic_folder' : 'ic_service_dashboard'"
                             :color="gray[600]"
                             width="0.875rem"
                             height="0.875rem"
                        />
                        <span class="text">{{ node.data.name }}</span>
                    </div>
                    <favorite-button v-if="node.data.type === 'DASHBOARD'"
                                     :item-id="node.id"
                                     :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                     scale="0.8"
                                     class="favorite-button"
                    />
                </div>
            </template>
        </p-tree-view>
    </div>
</template>

<style scoped lang="postcss">
.project-main-tree {
    width: 100%;
    max-height: 20rem;
    overflow-y: auto;
    .dashboard-menu-item-content {
        @apply flex items-center justify-between w-full;
        height: 2rem;
        .contents-wrapper {
            @apply flex items-center gap-1 w-full;

            .dashboard-icon {
                min-width: 0.875rem;
            }
            .text {
                @apply text-label-md text-gray-900;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .favorite-button {
            display: none;
            min-width: 1.5rem;
            height: 1rem;
            padding-left: 0.5rem;
        }

        &:hover {
            .contents-wrapper {
                width: calc(100% - 1.5rem);
            }
            .favorite-button {
                display: block;
            }
        }
    }
}
</style>
