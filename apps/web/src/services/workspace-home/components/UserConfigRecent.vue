<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PFieldTitle } from '@spaceone/design-system';

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

import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import UserConfigsItem from '@/services/workspace-home/components/UserConfigsItem.vue';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceStoreGetters = userWorkspaceStore.getters;
const gnbStore = useGnbStore();
const gnbStoreGetters = gnbStore.getters;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const dashboardStore = useDashboardStore();
const dashboardGetters = dashboardStore.getters;
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;

const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    costQuerySets: computed<CostQuerySetModel[]>(() => gnbStoreGetters.costQuerySets),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceGetters.costDataSource),
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => allReferenceGetters.cloudServiceType),
    projects: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceGetters.projectGroup),
    recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
});
const state = reactive({
    recentList: computed<ReferenceData[]>(() => {
        const _recentList = storeState.recentList.map((i) => convertRecentToReferenceData({
            ...i.data,
            itemType: i.data.type,
            itemId: i.data.id,
            workspaceId: storeState.currentWorkspaceId || '',
        }));
        return _recentList.filter((i) => i && !i?.isDeleted).splice(0, 10);
    }),
});

const convertRecentToReferenceData = (recentConfig: ConfigData): ReferenceData => {
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
</script>

<template>
    <div class="user-config-recent">
        <p-field-title :label="$t('HOME.CONFIG_RECENT_TITLE')"
                       size="lg"
                       class="header-wrapper"
        />
        <div class="suggestion-list-wrapper">
            <user-configs-item v-for="(item, idx) in state.recentList"
                               :key="`recent-list-${idx}`"
                               :item="item"
                               is-hidden-favorite-button
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-config-recent {
    .header-wrapper {
        padding: 1.375rem 1rem;
    }
    .suggestion-list-wrapper {
        @apply grid grid-cols-2;
        padding-right: 1.5rem;
        padding-bottom: 1.25rem;
        padding-left: 1.5rem;
    }
}
</style>
