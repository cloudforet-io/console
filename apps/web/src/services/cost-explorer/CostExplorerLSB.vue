<script setup lang="ts">

import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { MENU_ID } from '@/lib/menu/config';

import CostAnalysisLSB from '@/services/cost-explorer/components/CostAnalysisLSB.vue';

const route = useRoute();

const state = reactive({
    menuId: computed<string>(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        return closestRoute?.meta?.menuId;
    }),
});
</script>

<template>
    <aside class="sidebar-menu">
        <cost-analysis-l-s-b v-if="state.menuId === MENU_ID.COST_ANALYSIS" />
    </aside>
</template>
