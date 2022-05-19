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
import { ComponentRenderProxy, computed, getCurrentInstance } from '@vue/composition-api';

import { store } from '@/store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import { registerServiceStore } from '@/common/composables/register-service-store';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import CostExplorerLNB from '@/services/cost-explorer/CostExplorerLNB.vue';
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
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const { breadcrumbs } = useBreadcrumbs(computed(() => vm.$route));

        /* Init */
        (async () => {
            await store.dispatch('display/loadCurrencyRates');
        })();

        return {
            breadcrumbs,
        };
    },
};
</script>
