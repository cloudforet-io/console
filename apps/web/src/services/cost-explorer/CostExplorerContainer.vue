<script lang="ts" setup>
import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { computed, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import ErrorHandler from '@/common/composables/error/errorHandler';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import CostExplorerLNB from '@/services/cost-explorer/CostExplorerLNB.vue';
import { useCostExplorerSettingsStore } from '@/services/cost-explorer/store/cost-explorer-settings-store';
import { useCostQuerySetStore } from '@/services/cost-explorer/store/cost-query-set-store';

const store = useStore();
const route = useRoute();

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
</script>

<template>
    <vertical-page-layout v-if="route.meta.lnbVisible"
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
</template>
