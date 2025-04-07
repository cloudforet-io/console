<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PDataLoader,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import ProjectHeader from '@/services/project/v2/components/ProjectHeader.vue';
import ProjectTabs from '@/services/project/v2/components/ProjectTabs.vue';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

interface Props {
    projectGroupId?: string;
    projectId?: string;
}
const props = defineProps<Props>();



const route = useRoute();

const gnbStore = useGnbStore();
const dashboardStore = useDashboardStore();

/* Query */
const {
    publicDashboardList,
} = useDashboardQuery();
const {
    publicFolderList,
} = useDashboardFolderQuery();

const state = reactive({
    // TODO: need to be updated by real data
    item: computed<ProjectModel|undefined>(() => undefined),
    projectGroupMoveModalVisible: false,
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.PROJECT,
        // TODO: need to be updated by real data
        projectId: '',
    })),
});
const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => [
        {
            // TODO: check route
            name: PROJECT_ROUTE_V2._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_SUMMARY'),
        },
        ...(singleItemTabState.dashboardTabs.length
            ? [
                {
                    name: 'divider',
                    tabType: 'divider',
                },
                ...singleItemTabState.dashboardTabs,
            ]
            : []),
    ]),
    dashboardTabs: computed(() => {
        const projectDashboardItems = publicDashboardList.value
            .filter((d) => d.version !== '1.0' && d.shared && d.scope === 'PROJECT');
        const projectFolderItems = publicFolderList.value
            .filter((d) => d.shared && d.scope === 'PROJECT');

        const folderTabs = projectFolderItems.map((folder) => ({
            name: folder.folder_id,
            label: folder.name,
            tabType: 'folder',
            icon: 'ic_folder',
            subItems: projectDashboardItems.filter((dashboard) => dashboard.folder_id === folder.folder_id).map((dashboard) => ({
                name: dashboard.dashboard_id,
                label: dashboard.name,
                icon: 'ic_service_dashboard',
            })),
        }));
        const dashboardTabs = projectDashboardItems.filter((dashboard) => !dashboard.folder_id).map((dashboard) => ({
            name: dashboard.dashboard_id,
            label: dashboard.name,
            icon: 'ic_service_dashboard',
        }));
        return [
            ...folderTabs,
            ...dashboardTabs,
        ];
    }),
    // TODO: check route
    activeTab: PROJECT_ROUTE_V2._NAME,
});

/* Watchers */
// TODO: check if it is needed
// watch(() => projectDetailPageState.projectId, async (projectId) => {
//     if (projectId) {
//         await projectDetailPageStore.getProject(projectId);
//     }
// });
watch(() => route.name, (routeName) => {
    const flattenTabs = singleItemTabState.tabs.reduce((acc, tab) => {
        if (tab?.subItems) {
            acc.push(...tab.subItems);
        } else {
            acc.push(tab);
        }
        return acc;
    }, [] as TabItem[]);
    const exactRoute = route.matched.find((d) => flattenTabs.find((tab) => tab.name === d.name));
    // TODO: check route
    if (routeName === PROJECT_ROUTE_V2._NAME) {
        singleItemTabState.activeTab = route.params.dashboardId;
    } else {
        // TODO: check route
        singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE_V2._NAME;
    }
}, { immediate: true });
// TODO: check if it is needed
// watch([
//     () => props.id,
//     () => appContextStore.getters.globalGrantLoading,
// ], ([id, globalGrantLoading]) => {
//     if (!globalGrantLoading) projectDetailPageStore.setProjectId(id);
// }, { immediate: true });
// TODO: check if it is needed
// watch(() => projectDetailPageState.projectId, (projectId) => {
//     gnbStore.setId(projectId);
// }, { immediate: true });
watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    dashboardStore.reset();
});
</script>

<template>
    <div class="project-detail-page">
        <project-header :id="props.id" />
        <!-- TODO: bind loading with the real state -->
        <p-data-loader class="detail-tab-content"
                       :loading="false"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <project-tabs :id="props.id"
                          :item="state.item"
                          :tabs="singleItemTabState.tabs"
                          :active-tab.sync="singleItemTabState.activeTab"
            />
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.project-detail-page {
    height: 100%;
    .detail-tab-content {

        margin-top: 1rem;
        .page-inner {
            height: 100%;
            max-width: 85.5rem;
        }
        .help-tap {
            padding-top: 2rem;
            padding-right: 1rem;
            padding-left: 1rem;
            .plugin-wrapper {
                @apply flex;
                gap: 1rem;
                .plugin-info-wrapper {
                    flex: 1;
                    .plugin-info {
                        @apply flex items-center;
                        gap: 0.125rem;
                        .name {
                            @apply text-label-xl font-bold;
                        }
                    }
                    .desc {
                        @apply text-label-sm text-gray-600;
                    }
                }
            }
            .docs-wrapper {
                margin-top: 1.125rem;
                .empty {
                    @apply bg-violet-100;
                    padding-top: 4.125rem;
                    padding-bottom: 4.125rem;
                    border-radius: 0.375rem;
                }
            }
            .markdown {
                @apply bg-violet-100;
                padding: 1rem;
                border-radius: 0.375rem;
            }
        }
    }
}

/* custom design-system component - p-data-loader */
:deep(.p-data-loader) {
    .data-wrapper {
        overflow-y: unset;
    }
    .col-type {
        display: inline-flex;
        align-items: center;
        .name {
            margin-top: -0.125rem;
        }
    }
}
</style>
