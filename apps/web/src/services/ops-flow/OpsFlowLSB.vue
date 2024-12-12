<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import BoardLSB from '@/services/ops-flow/components/BoardLSB.vue';


const route = useRoute();

const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId;
        return targetMenuId;
    }),

});
</script>

<template>
    <aside class="sidebar-menu">
        <board-l-s-b v-if="state.selectedMenuId === MENU_ID.TASK_BOARD" />
    </aside>
</template>
