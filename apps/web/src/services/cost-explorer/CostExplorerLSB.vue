<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { MENU_ID } from '@/lib/menu/config';

import { useCurrentMenuId } from '@/common/composables/current-menu-id';

import CostAnalysisLSB from '@/services/cost-explorer/components/CostAnalysisLSB.vue';
import CostAnomalyDetectionLSB from '@/services/cost-explorer/components/CostAnomalyDetectionLSB.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const route = useRoute();

const { currentMenuId } = useCurrentMenuId();

const state = reactive({
    menuId: computed<string>(() => {
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return currentMenuId.value;
    }),
});
</script>

<template>
    <aside class="sidebar-menu">
        <cost-analysis-l-s-b v-if="state.menuId === MENU_ID.COST_ANALYSIS" />
        <cost-anomaly-detection-l-s-b v-if="route.name?.includes(MENU_ID.ANOMALY_DETECTION)" />
    </aside>
</template>
