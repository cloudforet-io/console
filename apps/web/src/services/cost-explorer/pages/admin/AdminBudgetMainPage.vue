<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { clone } from 'lodash';

import {
    PHeading, PDivider, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import { useUserStore } from '@/store/user/user-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import BudgetMainList from '@/services/cost-explorer/components/BudgetMainList.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const { getProperRouteLocation } = useProperRouteLocation();

const storeState = reactive({
    pageAccessPermissionMap: computed<PageAccessMap>(() => userStore.getters.pageAccessPermissionMap),
});
const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
});

const handleCreateBudgetSelect = () => {
    router.push(getProperRouteLocation({ name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME }));
};
</script>

<template>
    <div class="budget-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')" />
            </template>
            <template v-if="state.hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateBudgetSelect"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-divider />
        <budget-main-list />
    </div>
</template>
