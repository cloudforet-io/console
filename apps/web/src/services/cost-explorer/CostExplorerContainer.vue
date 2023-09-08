<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible"
                              :breadcrumbs="breadcrumbs"
        >
            <template #sidebar>
                <cost-explorer-l-n-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else
                             :breadcrumbs="breadcrumbs"
        >
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import { onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import ErrorHandler from '@/common/composables/error/errorHandler';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import CostExplorerLNB from '@/services/cost-explorer/CostExplorerLNB.vue';
import { useCostQuerySetStore } from '@/services/cost-explorer/store/cost-query-set-store';



export default {
    name: 'CostExplorerContainer',
    components: {
        GeneralPageLayout,
        CostExplorerLNB,
        VerticalPageLayout,
    },
    setup() {
        const { breadcrumbs } = useBreadcrumbs();
        const costQuerySetStore = useCostQuerySetStore();
        const costQuerySetState = costQuerySetStore.$state;
        const route = useRoute();

        onUnmounted(() => {
            costQuerySetStore.$dispose();
            costQuerySetStore.$reset();
        });

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
                        costQuerySetStore.$patch({
                            selectedDataSourceId: dataSourceId,
                        });
                    }
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            }

            /*
            * Both parameters are set in the route. (beforeEnter navigation guard in route.ts)
            * */
            if (params.dataSourceId && params.costQuerySetId) {
                costQuerySetStore.$patch({
                    selectedDataSourceId: params.dataSourceId,
                    selectedQuerySetId: params.costQuerySetId,
                });
            }
            await costQuerySetStore.listCostQuerySets();
        }, { immediate: true });


        return {
            breadcrumbs,
        };
    },
};
</script>
