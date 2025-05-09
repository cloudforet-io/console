<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import {
    PDataLoader,
} from '@cloudforet/mirinae';
import type { Route } from '@cloudforet/mirinae/types/navigation/breadcrumbs/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import { i18n } from '@/translations';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { useGlobalConfigUiAffectsSchema } from '@/lib/config/global-config/composables/use-global-config-ui-affects-schema';
import { MENU_ID } from '@/lib/menu/config';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import { useDashboardFolderQuery } from '@/services/dashboards/composables/use-dashboard-folder-query';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import ProjectAlertTab from '@/services/project/v1/components/ProjectAlertTab.vue';
import ProjectDetailTab from '@/services/project/v1/components/ProjectDetailTab.vue';
import ProjectDetailTabHeader from '@/services/project/v1/components/ProjectDetailTabHeader.vue';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store';

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
const userStore = useUserStore();
const alertManagerUiAffectsSchema = useGlobalConfigUiAffectsSchema('ALERT_MANAGER');

const { visibleContents } = useContentsAccessibility(MENU_ID.ALERT_MANAGER);
const { getReferenceLocation } = useReferenceRouter();

/* Query */
const {
    publicDashboardList,
} = useDashboardQuery();
const {
    publicFolderList,
} = useDashboardFolderQuery();

const storeState = reactive({
    visibleAlertTab: computed<boolean>(() => visibleContents.value && (alertManagerUiAffectsSchema.value?.visibleProjectAlertTab ?? false)),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    language: computed<string|undefined>(() => userStore.state.language),
});
const state = reactive({
    item: computed<ProjectModel|undefined>(() => projectDetailPageState.currentProject),
    projectGroupId: computed<string|undefined>(() => state.item?.project_group_id),
    projectGroupInfo: computed<ProjectGroupReferenceItem>(() => storeState.projectGroups?.[state.projectGroupId] ?? {}),
    pageNavigation: computed<Route[]>(() => {
        const results: Route[] = [
            { name: i18n.t('MENU.PROJECT') as string, to: { name: PROJECT_ROUTE_V1._NAME } },
        ];
        if (!isEmpty(state.projectGroupInfo)) {
            results.push({
                name: state.projectGroupInfo.name,
                to: getReferenceLocation(state.projectGroupId, { resource_type: 'identity.ProjectGroup' }),
            });
        }
        // if (route.name === PROJECT_ROUTE_V1.DETAIL.EVENT_RULE._NAME) {
        //     results = results.concat([
        //         { name: state.item?.name, to: getReferenceLocation(state.item?.project_id, { resource_type: 'identity.Project' }) },
        //         { name: i18n.t('PROJECT.DETAIL.ALERT.EVENT_RULE') as string },
        //     ]);
        // } else if (route.name === PROJECT_ROUTE_V1.DETAIL.TAB.NOTIFICATIONS.ADD._NAME) {
        //     results = results.concat([
        //         { name: state.item?.name, to: getReferenceLocation(state.item?.project_id, { resource_type: 'identity.Project' }) },
        //         { name: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: route.query.protocolLabel }) as string },
        //     ]);
        // } else {
        // }
        results.push({ name: state.item?.name });
        return results;
    }),
    projectGroupMoveModalVisible: false,
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.PROJECT,
        id: projectDetailPageState.projectId,
    })),
});
const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => [
        {
            name: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_SUMMARY'),
        },
        ...(!storeState.visibleAlertTab ? [] : [
            {
                name: PROJECT_ROUTE_V1.DETAIL.TAB.ALERT._NAME,
                label: i18n.t('PROJECT.DETAIL.TAB_ALERT'),
            },
            {
                name: PROJECT_ROUTE_V1.DETAIL.TAB.NOTIFICATIONS._NAME,
                label: i18n.t('PROJECT.DETAIL.TAB_NOTIFICATIONS'),
            },
        ]),
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
    activeTab: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
});

/* Watchers */
watch(() => projectDetailPageState.projectId, async (projectId) => {
    if (projectId) {
        await projectDetailPageStore.getProject(projectId);
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
    if (routeName === PROJECT_ROUTE_V1.DETAIL.TAB.DASHBOARD._NAME) {
        singleItemTabState.activeTab = route.params.dashboardId;
    } else {
        singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME;
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

onUnmounted(() => {
    projectDetailPageStore.reset();
});
</script>

<template>
    <div class="project-detail-tab-page">
        <project-detail-tab-header :id="props.id" />
        <p-data-loader class="detail-tab-content"
                       :loading="projectDetailPageState.loading"
                       :loader-backdrop-color="BACKGROUND_COLOR"
        >
            <project-alert-tab v-if="singleItemTabState.activeTab === PROJECT_ROUTE_V1.DETAIL.TAB.ALERT._NAME
                                   && route.query?.tab === 'webhook'"
                               :id="props.id"
                               :tabs="singleItemTabState.tabs"
                               :active-tab.sync="singleItemTabState.activeTab"
            />
            <div v-else>
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
