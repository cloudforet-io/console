<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import {
    PDataLoader, PHorizontalLayout, PTab, PDefinitionTable, PStatus, PHeading, PLazyImg, PBadge, PMarkdown,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import type { Route } from '@cloudforet/mirinae/types/navigation/breadcrumbs/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ProjectModel } from '@/schema/identity/project/model';
import type { WebhookModel } from '@/schema/monitoring/webhook/model';
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

import { userStateFormatter } from '@/services/iam/composables/refined-table-data';
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
const projectDetailPageGetters = projectDetailPageStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const dashboardStore = useDashboardStore();
const userStore = useUserStore();

const storeState = reactive({
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    selectedWebhookItem: computed<WebhookModel|undefined>(() => projectDetailPageGetters.selectedWebhookItem),
    language: computed(() => userStore.state.language ?? 'en'),
    dashboardList: computed(() => dashboardStore.state.publicDashboardItems),
    folderList: computed(() => dashboardStore.state.publicFolderItems),
});
const state = reactive({
    item: computed<ProjectModel|undefined>(() => projectDetailPageState.currentProject),
    projectGroupId: computed<string|undefined>(() => state.item?.project_group_id),
    projectGroupInfo: computed<ProjectGroupReferenceItem>(() => storeState.projectGroups?.[state.projectGroupId] ?? {}),
    pageNavigation: computed<Route[]>(() => {
        let results: Route[] = [
            { name: i18n.t('MENU.PROJECT') as string, to: { name: PROJECT_ROUTE._NAME } },
        ];
        if (!isEmpty(state.projectGroupInfo)) {
            results.push({
                name: state.projectGroupInfo.name,
                to: referenceRouter(state.projectGroupId, { resource_type: 'identity.ProjectGroup' }),
            });
        }
        if (route.name === PROJECT_ROUTE.DETAIL.EVENT_RULE._NAME) {
            results = results.concat([
                { name: state.item?.name, to: referenceRouter(state.item?.project_id, { resource_type: 'identity.Project' }) },
                { name: i18n.t('PROJECT.DETAIL.ALERT.EVENT_RULE') as string },
            ]);
        } else if (route.name === PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS.ADD._NAME) {
            results = results.concat([
                { name: state.item?.name, to: referenceRouter(state.item?.project_id, { resource_type: 'identity.Project' }) },
                { name: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: route.query.protocolLabel }) as string },
            ]);
        } else {
            results.push({ name: state.item?.name });
        }
        return results;
    }),
    projectGroupMoveModalVisible: false,
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.PROJECT,
        id: projectDetailPageState.projectId,
    })),
    webhookTypeList: [] as WebhookType[],
    selectedPlugin: computed<WebhookType|undefined>(() => {
        const id = storeState.selectedWebhookItem?.plugin_info.plugin_id;
        return state.webhookTypeList.find((i) => i.plugin_id === id);
    }),
});
const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => [
        {
            name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_SUMMARY'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_ALERT'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_NOTIFICATIONS'),
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
    webhookDetailTab: computed<TabItem[]>(() => {
        const defaultTab = [{
            name: 'details',
            label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.DETAILS'),
        }];
        if (state.selectedPlugin?.docs && !isEmpty(state.selectedPlugin?.docs)) {
            defaultTab.push({
                name: 'help',
                label: i18n.t('PROJECT.DETAIL.HELP'),
            });
        }
        return defaultTab;
    }),
    webhookDetailActiveTab: 'details',
});
const tableState = reactive({
    definitionFields: computed<DefinitionField[]>(() => [
        { label: 'Webhook ID', name: 'webhook_id' },
        { label: 'Name', name: 'name' },
        { label: 'State', name: 'state' },
        { label: 'Plugin', name: 'plugin_info.plugin_id' },
        { label: 'Version', name: 'plugin_info.version' },
        { label: 'Webhook URL', name: 'webhook_url' },
    ]),
});

const listProjectDashboard = async () => {
    await dashboardStore.load();
};

/* Watchers */
watch(() => storeState.selectedWebhookItem, () => {
    singleItemTabState.webhookDetailActiveTab = 'details';
}, { immediate: true });
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
            <div v-if="singleItemTabState.activeTab === PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME
                && route.query?.tab === 'webhook'"
            >
                <p-horizontal-layout class="page-inner"
                                     :height="522"
                >
                    <template #container="{ height }">
                        <project-detail-tab :id="props.id"
                                            :style="{ height: `${height}px` }"
                                            :item="state.item"
                                            :tabs="singleItemTabState.tabs"
                                            :active-tab.sync="singleItemTabState.activeTab"
                        />
                    </template>
                </p-horizontal-layout>
                <p-tab v-if="storeState.selectedWebhookItem"
                       :tabs="singleItemTabState.webhookDetailTab"
                       :active-tab.sync="singleItemTabState.webhookDetailActiveTab"
                >
                    <template #details>
                        <p-heading class="pt-8 px-4 pb-4"
                                   heading-type="sub"
                                   :title="$t('PROJECT.DETAIL.MEMBER.BASE_INFORMATION')"
                        />
                        <p-definition-table :fields="tableState.definitionFields"
                                            :data="storeState.selectedWebhookItem"
                                            :skeleton-rows="4"
                                            block
                        >
                            <template #data-state="{data}">
                                <p-status
                                    class="capitalize"
                                    v-bind="userStateFormatter(data)"
                                />
                            </template>
                            <template #data-plugin_info.plugin_id="{value}">
                                <div class="col-type">
                                    <p-lazy-img :src="state.selectedPlugin ? state.selectedPlugin?.tags?.icon : 'ic_webhook'"
                                                error-icon="ic_webhook"
                                                width="1rem"
                                                height="1rem"
                                                class="mr-2"
                                    />
                                    <span class="name">{{ state.selectedPlugin ? state.selectedPlugin?.name : value }}</span>
                                </div>
                            </template>
                        </p-definition-table>
                    </template>
                    <template #help>
                        <div class="help-tap">
                            <div class="plugin-wrapper">
                                <p-lazy-img :src="state.selectedPlugin ? state.selectedPlugin?.tags?.icon : 'ic_webhook'"
                                            error-icon="ic_webhook"
                                            width="2rem"
                                            height="2rem"
                                />
                                <div class="plugin-info-wrapper">
                                    <p class="plugin-info">
                                        <span class="name">
                                            {{ state.selectedPlugin ? state.selectedPlugin?.name : storeState.selectedWebhookItem?.plugin_info.plugin_id }}
                                        </span>
                                        <p-badge style-type="gray900"
                                                 badge-type="solid-outline"
                                        >
                                            v {{ storeState.selectedWebhookItem?.plugin_info.version }}
                                        </p-badge>
                                    </p>
                                    <p class="desc">
                                        {{ state.selectedPlugin?.tags?.long_description || state.selectedPlugin?.tags.description }}
                                    </p>
                                </div>
                            </div>
                            <div class="docs-wrapper">
                                <p-markdown :markdown="state.selectedPlugin?.docs"
                                            :language="storeState.language"
                                            remove-spacing
                                            class="markdown"
                                />
                            </div>
                        </div>
                    </template>
                </p-tab>
            </div>
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
