<template>
    <vertical-page-layout class="cost-management-page">
        <template #sidebar>
            <cost-management-menu />
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
</template>

<script lang="ts">
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import { store } from '@/store';
import CostManagementMenu from '@/services/billing/cost-management/modules/CostManagementMenu.vue';

export default {
    name: 'CostManagementPage',
    components: {
        CostManagementMenu,
        VerticalPageLayout,
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
.cost-management-page::v-deep {
    @apply flex;
    .page-contents {
        overflow-x: auto;
    }
}
</style>
