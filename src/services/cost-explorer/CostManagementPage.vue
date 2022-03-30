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
import { store } from '@/store';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import CostManagementMenu from '@/services/cost-explorer/modules/CostManagementMenu.vue';
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
            await store.dispatch('display/loadCurrencyRates');
        })();

        return {};
    },
};
</script>
