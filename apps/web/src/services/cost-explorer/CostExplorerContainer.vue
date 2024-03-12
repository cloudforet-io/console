<script lang="ts" setup>
import {
    onUnmounted, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';


import ErrorHandler from '@/common/composables/error/errorHandler';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import CostExplorerLSB from '@/services/cost-explorer/CostExplorerLSB.vue';
import { useCostExplorerSettingsStore } from '@/services/cost-explorer/stores/cost-explorer-settings-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';


const costQuerySetStore = useCostQuerySetStore();
const costQuerySetState = costQuerySetStore.state;
const costExplorerSettingsStore = useCostExplorerSettingsStore();

const route = useRoute();

watch(() => route.params, async (params) => {
    // Case - Directly access Budget Page
    if (!costQuerySetState.selectedDataSourceId) {
        const fetcher = getCancellableFetcher(SpaceConnector.clientV2.costAnalysis.dataSource.list);
        try {
            const { status, response } = await fetcher({
                query: {
                    only: ['data_source_id'],
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

    /*
    * Both parameters are set in the route. (beforeEnter navigation guard in routes.ts)
    * */
    if (params.dataSourceId && params.costQuerySetId) {
        costQuerySetStore.setSelectedDataSourceId(params.dataSourceId);
        costQuerySetStore.setSelectedQuerySetId(params.costQuerySetId);
    }
    await costQuerySetStore.listCostQuerySets();
}, { immediate: true });

costExplorerSettingsStore.initState();
onUnmounted(() => {
    costQuerySetStore.reset();
    costExplorerSettingsStore.$dispose();
    costExplorerSettingsStore.$reset();
});
</script>

<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lsbVisible"
                              class="cost-explorer-container"
        >
            <template #sidebar>
                <cost-explorer-l-s-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <centered-page-layout v-else-if="$route.meta.centeredLayout"
                              class="cost-centered-layout"
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
    &::before {
        opacity: 1;
        background-position: 50% 0;
        background-size: 90rem auto;
        background-repeat: no-repeat;
    }
}
</style>
