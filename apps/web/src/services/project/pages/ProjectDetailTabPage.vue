<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import {
    PDataLoader, PHorizontalLayout, PTab, PDefinitionTable, PStatus, PHeading, PLazyImg,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import type { Route } from '@cloudforet/mirinae/types/navigation/breadcrumbs/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ProjectModel } from '@/schema/identity/project/model';
import type { WebhookModel } from '@/schema/monitoring/webhook/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import type { ProjectGroupReferenceItem, ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';

import { referenceRouter } from '@/lib/reference/referenceRouter';

import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { BACKGROUND_COLOR } from '@/styles/colorsets';

import { userStateFormatter } from '@/services/iam/composables/refined-table-data';
import ProjectDetailTab from '@/services/project/components/ProjectDetailTab.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/stores/project-detail-page-store';

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

const storeState = reactive({
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
    selectedWebhookItem: computed<WebhookModel|undefined>(() => projectDetailPageGetters.selectedWebhookItem),
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
});
const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => [
        {
            name: PROJECT_ROUTE.DETAIL.TAB.DASHBOARD._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_DASHBOARD'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_PROJECT_MEMBER'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_ALERT'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_NOTIFICATIONS'),
        },
        {
            name: PROJECT_ROUTE.DETAIL.TAB.TAG._NAME,
            label: i18n.t('PROJECT.DETAIL.TAB_TAG'),
        },
    ]),
    activeTab: PROJECT_ROUTE.DETAIL.TAB.DASHBOARD._NAME,
    webhookDetailTab: computed<TabItem[]>(() => [
        {
            name: 'details',
            label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.DETAILS'),
        },
    ]),
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

/* Watchers */
watch(() => projectDetailPageState.projectId, async (projectId) => {
    if (projectId) {
        await Promise.allSettled([
            projectDetailPageStore.getProject(projectId),
            projectDetailPageStore.getAlertCounts(projectId),
        ]);
    }
});

watch(() => route.name, () => {
    const exactRoute = route.matched.find((d) => singleItemTabState.tabs.find((tab) => tab.name === d.name));
    singleItemTabState.activeTab = exactRoute?.name || PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME;
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
    <p-data-loader class="project-detail-tab-page"
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
                    <project-detail-tab :style="{ height: `${height}px` }"
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
                <p-heading heading-type="sub"
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
                            <p-lazy-img :src="storeState.plugins[value] ? storeState.plugins[value].icon : 'ic_webhook'"
                                        error-icon="ic_webhook"
                                        width="1rem"
                                        height="1rem"
                                        class="mr-2"
                            />
                            <span class="name">{{ storeState.plugins[value] ? storeState.plugins[value].label : value }}</span>
                        </div>
                    </template>
                </p-definition-table>
            </p-tab>
        </div>
        <div v-else>
            <project-detail-tab :item="state.item"
                                :tabs="singleItemTabState.tabs"
                                :active-tab.sync="singleItemTabState.activeTab"
            />
        </div>
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.project-detail-tab-page {
    height: 100%;
    margin-top: 1.5rem;
    .page-inner {
        height: 100%;
        max-width: 85.5rem;
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
