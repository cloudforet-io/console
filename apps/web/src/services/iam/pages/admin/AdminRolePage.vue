<script lang="ts" setup>
import { computed, onUnmounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { clone } from 'lodash';

import {
    PHorizontalLayout, PHeading, PButton, PHeadingLayout,
} from '@cloudforet/mirinae';

import { store } from '@/store';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import RoleManagementTab from '@/services/iam/components/RoleManagementTab.vue';
import RoleManagementTable from '@/services/iam/components/RoleManagementTable.vue';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { useRolePageStore } from '@/services/iam/store/role-page-store';


const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;
const { getProperRouteLocation } = useProperRouteLocation();

const router = useRouter();
const route = useRoute();

const storeState = reactive({
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

/* Component */
const handleCreateRole = () => {
    router.push(getProperRouteLocation({ name: IAM_ROUTE.ROLE.CREATE._NAME }));
};

onUnmounted(() => {
    rolePageStore.$dispose();
    rolePageStore.$reset();
});
</script>

<template>
    <section class="role-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('IAM.ROLE.ROLE')"
                           use-selected-count
                           use-total-count
                           :total-count="rolePageState.totalCount"
                           :selected-count="rolePageState.selectedIndices.length"
                />
            </template>
            <template v-if="state.hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateRole"
                >
                    {{ $t('IAM.ROLE.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-horizontal-layout class="role-toolbox-layout">
            <template #container="{ height }">
                <role-management-table :table-height="height"
                                       :has-read-write-access="state.hasReadWriteAccess"
                />
            </template>
        </p-horizontal-layout>
        <role-management-tab />
    </section>
</template>

<style lang="postcss" scoped>
.role-page {
    @apply mx-0;
    max-width: 100%;
}

/* custom design-system component - p-horizontal-layout */
:deep(.role-toolbox-layout) {
    .horizontal-contents {
        overflow: unset;
    }
}
</style>
