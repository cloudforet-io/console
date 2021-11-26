<template>
    <vertical-page-layout class="cost-management-page">
        <template #sidebar>
            <cost-dashboard-list />
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
</template>

<script lang="ts">
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import CostDashboardList from '@/services/billing/cost-management/cost-dashboard/modules/CostDashboardList.vue';
import { store } from '@/store';

export default {
    name: 'CostManagementPage',
    components: {
        VerticalPageLayout,
        CostDashboardList,
    },
    setup() {
        (async () => {
            await Promise.all([
                store.dispatch('resource/serviceAccount/load'),
                store.dispatch('resource/project/load'),
                store.dispatch('resource/projectGroup/load'),
                store.dispatch('resource/region/load'),
                store.dispatch('resource/provider/load'),
                store.dispatch('display/loadCurrencyRates'),
            ]);
        })();

        return {
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-management-page {
    @apply flex;
}
</style>
