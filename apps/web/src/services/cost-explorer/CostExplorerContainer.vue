<script lang="ts" setup>
import { onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';


import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import { UNIFIED_COST_KEY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import CostExplorerLSB from '@/services/cost-explorer/CostExplorerLSB.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useCostExplorerSettingsStore } from '@/services/cost-explorer/stores/cost-explorer-settings-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';


const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.state;
const costExplorerSettingsStore = useCostExplorerSettingsStore();
const appContextStore = useAppContextStore();
const userStore = useUserStore();

const route = useRoute();
const setCostParams = async () => {
    // Case - Directly access Budget Page
    if (!costQuerySetState.selectedDataSourceId) {
        const fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);
        try {
            const { status, response } = await fetcher({
                query: {
                    only: ['data_source_id'],
                    sort: [{ key: 'workspace_id', desc: appContextStore.getters.isAdminMode }],
                },
            });

            if (status === 'succeed') {
                const dataSourceId = response.results[0].data_source_id;
                costQuerySetStore.setSelectedDataSourceId(dataSourceId);
            }
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }
    const { dataSourceId, costQuerySetId } = route.params;
    /*
    * Both parameters are set in the route. (beforeEnter navigation guard in routes.ts)
    * */
    if (dataSourceId && costQuerySetId) {
        if (dataSourceId !== UNIFIED_COST_KEY) costQuerySetStore.setSelectedDataSourceId(dataSourceId);
        costQuerySetStore.setSelectedQuerySetId(costQuerySetId);
    }
    await costQuerySetStore.listCostQuerySets();
};
const changeCostQuerySet = () => {
    const { dataSourceId, costQuerySetId } = route.params;
    if (dataSourceId && costQuerySetId) {
        if (dataSourceId !== UNIFIED_COST_KEY) costQuerySetStore.setSelectedDataSourceId(dataSourceId);
        costQuerySetStore.setSelectedQuerySetId(costQuerySetId);
    }
};
const { callApiWithGrantGuard } = useGrantScopeGuard(['WORKSPACE', 'DOMAIN'], setCostParams);

watch(() => route.params, async (after, before) => {
    if ((after.workspaceId === before?.workspaceId) && (after.dataSourceId === before?.dataSourceId)) {
        changeCostQuerySet();
        return;
    }
    await callApiWithGrantGuard();
}, { immediate: true });

costExplorerSettingsStore.initState(userStore.state.userId);
onUnmounted(() => {
    costQuerySetStore.reset();
    costExplorerSettingsStore.$dispose();
    costExplorerSettingsStore.$reset();
});
</script>

<template>
    <fragment>
        <vertical-page-layout v-if="route?.meta?.lsbVisible"
                              class="cost-explorer-container"
        >
            <template #sidebar>
                <cost-explorer-l-s-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <centered-page-layout v-else-if="route?.meta?.centeredLayout"
                              class="cost-centered-layout"
                              :class="{'landing-page': route?.name === COST_EXPLORER_ROUTE.LANDING._NAME}"
                              has-nav-bar
        >
            <router-view />
        </centered-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<style lang="postcss" scoped>
.cost-explorer-container {
    :deep(.right-container) {
        overflow-x: hidden;
    }
}
.cost-centered-layout {
    &.landing-page {
        &::before {
            opacity: 1;
            background-position: 50% 0;
            background-size: 90rem auto;
            background-repeat: no-repeat;
        }
    }
}
</style>
