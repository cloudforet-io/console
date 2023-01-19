<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.lnbVisible"
                              :breadcrumbs="breadcrumbs"
        >
            <template #sidebar>
                <dashboards-l-n-b />
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
import { store } from '@/store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import DashboardsLNB from '@/services/dashboards/DashboardsLNB.vue';

export default {
    name: 'DashboardsContainer',
    components: { DashboardsLNB, GeneralPageLayout, VerticalPageLayout },
    setup() {
        const { breadcrumbs } = useBreadcrumbs();

        /* init */
        (async () => {
            await store.dispatch('display/loadCurrencyRates');
        })();

        return {
            breadcrumbs,
        };
    },
};
</script>
