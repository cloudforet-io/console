<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import {
    PHeading, PDivider, PButton,
} from '@cloudforet/mirinae';

import { SpaceRouter } from '@/router';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import BudgetMainList from '@/services/cost-explorer/components/BudgetMainList.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


const route = useRoute();

const storeState = reactive({
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    pageAccessPermissionMap: computed<PageAccessMap>(() => store.getters['user/pageAccessPermissionMap']),
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
    SpaceRouter.router.push({ name: COST_EXPLORER_ROUTE.BUDGET.CREATE._NAME });
};
</script>

<template>
    <div class="budget-page">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.MAIN.BUDGET')">
            <template v-if="state.hasReadWriteAccess && storeState.isWorkspaceOwner"
                      #extra
            >
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateBudgetSelect"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-divider />
        <budget-main-list />
    </div>
</template>
