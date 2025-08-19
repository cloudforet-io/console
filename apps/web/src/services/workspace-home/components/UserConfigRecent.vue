<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PFieldTitle } from '@cloudforet/mirinae';

import type { CostQuerySetModel } from '@/api-clients/cost-analysis/cost-query-set/schema/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import type {
    ReferenceData,
    ConfigData,
} from '@/lib/helper/config-data-helper';

import { useConvertReferencedConfigData } from '@/common/composables/config-data';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';
import { useRecentList } from '@/common/modules/recents/use-recent-list';

import UserConfigsItem from '@/services/workspace-home/components/UserConfigsItem.vue';


const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceStoreGetters = userWorkspaceStore.getters;
const gnbStore = useGnbStore();
const gnbStoreGetters = gnbStore.getters;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

/* Recent */
const recentConfigData = useRecentList();
const convertedRecentConfigData = useConvertReferencedConfigData({
    dashboardConfigList: computed(() => (recentConfigData.dashboardRecentList.value ?? []).map((i) => ({
        ...i.data,
        itemType: i.data.type,
        itemId: i.data.id,
        workspaceId: storeState.currentWorkspaceId || '',
    }))),
    projectConfigList: computed(() => (recentConfigData.projectRecentList.value ?? []).map((i) => ({
        ...i.data,
        itemType: i.data.type,
        itemId: i.data.id,
        workspaceId: storeState.currentWorkspaceId || '',
    }))),
    projectGroupConfigList: computed(() => (recentConfigData.projectGroupRecentList.value ?? []).map((i) => ({
        ...i.data,
        itemType: i.data.type,
        itemId: i.data.id,
        workspaceId: storeState.currentWorkspaceId || '',
    }))),
    costQuerySetConfigList: computed(() => (recentConfigData.costAnalysisRecentList.value ?? []).map((i) => ({
        ...i.data,
        itemType: i.data.type,
        itemId: i.data.id,
        workspaceId: storeState.currentWorkspaceId || '',
    }))),
    allConfigList: computed(() => (recentConfigData.menuRecentList.value ?? []).map((i) => ({
        ...i.data,
        itemType: i.data.type,
        itemId: i.data.id,
        workspaceId: storeState.currentWorkspaceId || '',
    }))),
});


const storeState = reactive({
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    costQuerySets: computed<CostQuerySetModel[]>(() => gnbStoreGetters.costQuerySets),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceGetters.costDataSource),
    projects: computed<ProjectReferenceMap>(() => allReferenceGetters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceGetters.projectGroup),
    // recentList: computed<UserConfigModel[]>(() => workspaceHomePageState.recentList),
});
const state = reactive({
    recentList: computed<(ReferenceData | undefined)[]>(() => {
        const _recentList = (recentConfigData.menuRecentList.value ?? []).map((i) => convertRecentToReferenceData({
            ...i.data,
            itemType: i.data.type,
            itemId: i.data.id,
            workspaceId: storeState.currentWorkspaceId || '',
        }));
        return _recentList.filter((i) => !!i && !i?.isDeleted).splice(0, 10);
    }),
});

const convertRecentToReferenceData = (recentConfig: ConfigData): ReferenceData|undefined => {
    const { itemType } = recentConfig;
    if (itemType === RECENT_TYPE.DASHBOARD) {
        return convertedRecentConfigData.convertedDashboard.value.find((d) => d.itemId === recentConfig.id);
    }
    if (itemType === RECENT_TYPE.PROJECT) {
        return convertedRecentConfigData.convertedProject.value.find((d) => d.itemId === recentConfig.id);
    }
    if (itemType === RECENT_TYPE.PROJECT_GROUP) {
        return convertedRecentConfigData.convertedProjectGroup.value.find((d) => d.itemId === recentConfig.id);
    }
    if (itemType === RECENT_TYPE.COST_ANALYSIS) {
        return convertedRecentConfigData.convertedCostQuerySet.value.find((d) => d.itemId === recentConfig.id);
    }
    return convertedRecentConfigData.convertedMenu.value.find((d) => d.itemId === recentConfig.id);
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
