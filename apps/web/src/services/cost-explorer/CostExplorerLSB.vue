<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import CostAdvancedSettingsLSB from '@/services/cost-explorer/components/CostAdvancedSettingsLSB.vue';
import CostAnalysisLSB from '@/services/cost-explorer/components/CostAnalysisLSB.vue';

const route = useRoute();

const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        return targetMenuId;
    }),

});
</script>

<template>
    <aside class="sidebar-menu">
        <cost-analysis-l-s-b v-if="state.selectedMenuId === MENU_ID.COST_ANALYSIS" />
        <cost-advanced-settings-l-s-b v-if="route.name.includes(MENU_ID.COST_ADVANCED_SETTINGS)" />
    </aside>
</template>
