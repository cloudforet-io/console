<template>
    <fragment>
        <vertical-page-layout v-if="$route.meta.isVerticalLayout"
                              class="cost-management-page"
        >
            <template #sidebar>
                <cost-management-menu />
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
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import { store } from '@/store';
import CostManagementMenu from '@/services/billing/cost-management/modules/CostManagementMenu.vue';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

export default {
    name: 'CostManagementPage',
    components: {
        GeneralPageLayout,
        CostManagementMenu,
        VerticalPageLayout,
    },
    setup() {
        (async () => {
            await Promise.allSettled([
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
