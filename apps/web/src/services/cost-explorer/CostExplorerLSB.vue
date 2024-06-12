<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import CostAnomalyDetectionLSB from '@/services/cost-explorer/components/AnomalyDetectionLSB.vue';
import CostAnalysisLSB from '@/services/cost-explorer/components/CostAnalysisLSB.vue';

const route = useRoute();

const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.HOME_DASHBOARD;
        return targetMenuId;
    }),
});
</script>

<template>
    <aside class="sidebar-menu">
        <cost-analysis-l-s-b v-if="state.selectedMenuId === MENU_ID.COST_ANALYSIS" />
        <cost-anomaly-detection-l-s-b v-if="state.selectedMenuId.includes(MENU_ID.ANOMALY_DETECTION)" />
    </aside>
</template>
