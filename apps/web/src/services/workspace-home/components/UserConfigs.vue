<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PFieldTitle } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigListParameters } from '@/schema/config/user-config/api-verbs/list';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import type { CostQuerySetModel } from '@/schema/cost-analysis/cost-query-set/model';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import type {
    ReferenceData,
    ConfigData,
} from '@/lib/helper/config-data-helper';
import {
    convertCloudServiceConfigToReferenceData,
    convertCostAnalysisConfigToReferenceData,
    convertDashboardConfigToReferenceData,
    convertMenuConfigToReferenceData,
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import { MENU_ID } from '@/lib/menu/config';

import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import UserConfigsItem from '@/services/workspace-home/components/UserConfigsItem.vue';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceStoreGetters = userWorkspaceStore.getters;
const gnbStore = useGnbStore();
const gnbStoreGetters = gnbStore.getters;
const allReferenceStore = useAllReferenceStore();
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;

const recentListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

const storeState = reactive({
    userId: computed<string>(() => store.state.user.userId),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    costQuerySets: computed<CostQuerySetModel[]>(() => gnbStoreGetters.costQuerySets),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => allReferenceStore.getters.cloudServiceType),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
});
const state = reactive({
    recentList: [] as ReferenceData[],
});

const fetchRecentList = async (currentWorkspaceId: string) => {
    recentListApiQuery.setFilters([
        { k: 'user_id', v: storeState.userId, o: '=' },
        { k: 'name', v: 'console:recent:', o: '' },
        { k: 'data.workspace_id', v: currentWorkspaceId, o: '=' },
        { k: 'data.type', v: RECENT_TYPE.WORKSPACE, o: '!=' },
        { k: 'data.id', v: MENU_ID.WORKSPACE_HOME, o: '!=' },
        // NOTE: Code corresponding to data stored as 'home-dashboard'
        { k: 'data.id', v: 'home-dashboard', o: '!=' },
    ]).setPageLimit(10);

    const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
        query: recentListApiQuery.data,
    });
    state.recentList = (results || []).map((i) => convertRecentToReferenceData({
        ...i.data,
        itemType: i.data.type,
        itemId: i.data.id,
        workspaceId: storeState.currentWorkspaceId || '',
    }));
};

const convertRecentToReferenceData = (recentConfig: ConfigData) => {
    const { itemType } = recentConfig;
    if (itemType === RECENT_TYPE.DASHBOARD) {
        return convertDashboardConfigToReferenceData([recentConfig], [...dashboardGetters.workspaceItems, ...dashboardGetters.projectItems, ...dashboardGetters.privateItems])[0];
    }
    if (itemType === RECENT_TYPE.PROJECT) {
        return convertProjectConfigToReferenceData([recentConfig], storeState.projects)[0];
    }
    if (itemType === RECENT_TYPE.PROJECT_GROUP) {
        return convertProjectGroupConfigToReferenceData([recentConfig], storeState.projectGroups)[0];
    }
    if (itemType === RECENT_TYPE.CLOUD_SERVICE_TYPE || itemType === RECENT_TYPE.SECURITY) {
        return convertCloudServiceConfigToReferenceData([recentConfig], storeState.cloudServiceTypes)[0];
    }
    if (itemType === RECENT_TYPE.COST_ANALYSIS) {
        return convertCostAnalysisConfigToReferenceData([recentConfig], storeState.costQuerySets, storeState.costDataSource)[0];
    }
    return convertMenuConfigToReferenceData([recentConfig], store.getters['display/allMenuList'])[0];
};

watch(() => storeState.currentWorkspaceId, async (currentWorkspaceId) => {
    if (!currentWorkspaceId) return;
    await fetchRecentList(currentWorkspaceId);
}, { immediate: true });
</script>

<template>
    <div class="user-configs">
        <div class="box-wrapper most-recent">
            <p-field-title :label="$t('HOME.CONFIG_RECENT_TITLE')" />
            <div class="suggestion-list-wrapper">
                <user-configs-item v-for="(item) in state.recentList"
                                   :key="item.itemId"
                                   :item="item"
                />
            </div>
        </div>
        <div class="box-wrapper starred">
            <p-field-title :label="$t('HOME.CONFIG_STARRED_TITLE')" />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-configs {
    @apply flex;
    gap: 1rem;
    .box-wrapper {
        @apply border border-gray-200 text-label-md ;
        padding: 1rem;
        border-radius: 0.375rem;
        flex: 1;
        .suggestion-list-wrapper {
            @apply grid grid-cols-2;
            padding: 1.375rem 0.5rem 0.25rem 0.5rem;
        }
        &.most-recent {
            padding-top: 1.375rem;
        }
    }
}
</style>
