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
        <centered-page-layout v-else-if="$route.meta.centeredLayout"
                              class="cost-centered-layout"
                              has-nav-bar
        >
            <router-view />
        </centered-page-layout>
        <general-page-layout v-else
                             :breadcrumbs="breadcrumbs"
        >
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import { computed, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import { store } from '@/store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import ErrorHandler from '@/common/composables/error/errorHandler';
import CenteredPageLayout from '@/common/modules/page-layouts/CenteredPageLayout.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import CostExplorerLNB from '@/services/cost-explorer/CostExplorerLNB.vue';
import { useCostExplorerSettingsStore } from '@/services/cost-explorer/stores/cost-explorer-settings-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/stores/cost-query-set-store';



export default {
    name: 'CostExplorerContainer',
    components: {
        CenteredPageLayout,
        GeneralPageLayout,
        CostExplorerLNB,
        VerticalPageLayout,
    },
    setup() {
        const { breadcrumbs } = useBreadcrumbs();
        const userId = computed(() => store.state.user.userId);
        const costQuerySetStore = useCostQuerySetStore();
        const costQuerySetState = costQuerySetStore.$state;
        const costExplorerSettingsStore = useCostExplorerSettingsStore();
        costExplorerSettingsStore.initState();
        costExplorerSettingsStore.$onAction((action) => {
            action.after(() => {
                if (window) {
                    const settings = LocalStorageAccessor.getItem(userId.value) ?? {};
                    settings.costExplorer = action.store.$state;
                    LocalStorageAccessor.setItem(userId.value, settings);
                }
            });
        });
        const route = useRoute();

        onUnmounted(() => {
            costQuerySetStore.$dispose();
            costQuerySetStore.$reset();
            costExplorerSettingsStore.$dispose();
            costExplorerSettingsStore.$reset();
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

<style lang="postcss" scoped>
.cost-centered-layout {
    &::before {
        opacity: 1;
        background-position: 50% 0;
        background-size: 90rem auto;
        background-repeat: no-repeat;
    }
}
</style>
