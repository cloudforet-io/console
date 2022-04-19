<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible">
            <template #sidebar>
                <cost-explorer-l-n-b />
            </template>
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import { store } from '@/store';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import CostExplorerLNB from '@/services/cost-explorer/CostExplorerLNB.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import { registerServiceStore } from '@/common/composables/register-service-store';
import { costExplorerStore, costExplorerStoreModule } from '@/services/cost-explorer/store';
import { CostExplorerState } from '@/services/cost-explorer/store/type';

export default {
    name: 'CostExplorerContainer',
    components: {
        GeneralPageLayout,
        CostExplorerLNB,
        VerticalPageLayout,
    },
    setup() {
        registerServiceStore<CostExplorerState>('costExplorer', costExplorerStoreModule, costExplorerStore);

        /* Init */
        (async () => {
            await store.dispatch('display/loadCurrencyRates');
        })();

        return {};
    },
};
</script>
