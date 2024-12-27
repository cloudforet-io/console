<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import {
    PDataLoader,
} from '@cloudforet/mirinae';
import type { Route } from '@cloudforet/mirinae/types/navigation/breadcrumbs/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ProjectModel } from '@/schema/identity/project/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import ProjectDetailTab from '@/services/project/components/ProjectDetailTab.vue';
import ProjectDetailTabHeader from '@/services/project/components/ProjectDetailTabHeader.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/stores/project-detail-page-store';
import type { WebhookType } from '@/services/project/types/project-alert-type';

interface Props {
    id?: string;
}
const props = defineProps<Props>();
const route = useRoute();

const gnbStore = useGnbStore();
const appContextStore = useAppContextStore();
const allReferenceStore = useAllReferenceStore();
const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageState = projectDetailPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const dashboardStore = useDashboardStore();
const userStore = useUserStore();

const storeState = reactive({
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    language: computed(() => userStore.state.language),
    dashboardList: computed(() => dashboardStore.state.publicDashboardItems),
    folderList: computed(() => dashboardStore.state.publicFolderItems),
});
const state = reactive({
    item: computed<ProjectModel|undefined>(() => projectDetailPageState.currentProject),
    projectGroupId: computed<string|undefined>(() => state.item?.project_group_id),
    projectGroupInfo: computed<ProjectGroupReferenceItem>(() => storeState.projectGroups?.[state.projectGroupId] ?? {}),
    pageNavigation: computed<Route[]>(() => {
        const results: Route[] = [
            { name: i18n.t('MENU.PROJECT') as string, to: { name: PROJECT_ROUTE._NAME } },
        ];
        if (!isEmpty(state.projectGroupInfo)) {
            results.push({
                name: state.projectGroupInfo.name,
                to: referenceRouter(state.projectGroupId, { resource_type: 'identity.ProjectGroup' }),
            });
        }
        results.push({ name: state.item?.name });
        return results;
    }),
    projectGroupMoveModalVisible: false,
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.PROJECT,
        id: projectDetailPageState.projectId,
    })),
    webhookTypeList: [] as WebhookType[],
});
const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => [
        {
            name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
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
        const projectDashboardItems = storeState.dashboardList.filter((dashboard) => dashboard.project_id === '*' && dashboard.version !== '1.0');
        const projectFolderItems = storeState.folderList.filter((folder) => folder.project_id === '*');

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
    activeTab: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
});

const listProjectDashboard = async () => {
    await dashboardStore.load();
};

/* Watchers */
watch(() => projectDetailPageState.projectId, async (projectId) => {
    if (projectId) {
        await Promise.allSettled([
            projectDetailPageStore.getProject(projectId),
            projectDetailPageStore.getAlertCounts(projectId),
        ]);
    }
});
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
    if (routeName === PROJECT_ROUTE.DETAIL.TAB.DASHBOARD._NAME) {
        singleItemTabState.activeTab = route.params.dashboardId;
    } else {
        singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME;
    }
}, { immediate: true });
watch([
    () => props.id,
    () => appContextStore.getters.globalGrantLoading,
], ([id, globalGrantLoading]) => {
    if (!globalGrantLoading) projectDetailPageStore.setProjectId(id);
}, { immediate: true });
watch([() => singleItemTabState.activeTab, () => state.item], () => {
    gnbStore.setBreadcrumbs(state.pageNavigation);
});
watch(() => projectDetailPageState.projectId, (projectId) => {
    gnbStore.setId(projectId);
}, { immediate: true });
watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

onMounted(async () => {
    state.webhookTypeList = await projectDetailPageStore.getListWebhookType();
    await listProjectDashboard();
});
onUnmounted(() => {
    projectDetailPageStore.reset();
    dashboardStore.reset();
});
</script>

<template>
    <div class="project-detail-tab-page">
        <project-detail-tab-header :id="props.id" />
        <p-data-loader class="detail-tab-content"
                       :loading="projectDetailPageState.loading"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <div>
                <project-detail-tab :id="props.id"
                                    :item="state.item"
                                    :tabs="singleItemTabState.tabs"
                                    :active-tab.sync="singleItemTabState.activeTab"
                />
            </div>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.project-detail-tab-page {
    height: 100%;
    .detail-tab-content {
        margin-top: 1rem;
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
