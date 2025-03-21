<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { clone } from 'lodash';

import { PDivider, PHeading, PIconButton } from '@cloudforet/mirinae';

import type { BudgetModel } from '@/schema/cost-analysis/budget/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY_SYMBOL } from '@/store/modules/display/config';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import BudgetDetailDeleteModal from '@/services/cost-explorer/components/BudgetDetailDeleteModal.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';


interface Props {
    loading?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    loading: false,
});

const { getProperRouteLocation } = useProperRouteLocation();
const appContextStore = useAppContextStore();
const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const allReferenceStore = useAllReferenceStore();

const router = useRouter();
const route = useRoute();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    dataSourceMap: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
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
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
    isProjectTarget: computed(() => state.budgetData?.resource_group === 'PROJECT'),
    dataSourceName: computed(() => {
        if (!state.budgetData) return '';
        return storeState.dataSourceMap[state.budgetData.data_source_id]?.label;
    }),
    deleteModalVisible: false,
});

/* Event */
const handleClickDelete = () => {
    state.deleteModalVisible = true;
};
const handleUpdateDelete = (visible) => {
    state.deleteModalVisible = visible;
};
const handleConfirmDelete = () => {
    router.push(getProperRouteLocation({ name: COST_EXPLORER_ROUTE.BUDGET._NAME }));
};
const handleClickBackButton = () => {
    router.push(getProperRouteLocation({ name: COST_EXPLORER_ROUTE.BUDGET._NAME }));
};
</script>

<template>
    <div class="budget-detail-heading">
        <p-heading :show-back-button="!props.loading"
                   :title="state.budgetData?.name"
                   class="mb-2"
                   @click-back-button="handleClickBackButton"
        >
            <template v-if="!props.loading"
                      #title-right-extra
            >
                <div v-if="storeState.isAdminMode || (state.hasReadWriteAccess && state.isProjectTarget && storeState.isWorkspaceOwner)"
                     class="title-button-group"
                >
                    <p-icon-button name="ic_delete"
                                   @click="handleClickDelete"
                    />
                </div>
                <div class="title-right-extra">
                    <div class="right-item">
                        <span class="label">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DATA_SOURCE') }}:</span>
                        <span>{{ state.dataSourceName }}</span>
                    </div>
                    <p-divider vertical
                               class="divider"
                    />
                    <div class="right-item">
                        <span class="label">{{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DETAIL.ORIGINAL_CURRENCY') }}:</span>
                        <span>{{ CURRENCY_SYMBOL[state.budgetData?.currency] }}{{ state.budgetData?.currency }}</span>
                    </div>
                </div>
            </template>
        </p-heading>
        <budget-detail-delete-modal v-if="!props.loading"
                                    :visible="state.deleteModalVisible"
                                    @update="handleUpdateDelete"
                                    @confirm="handleConfirmDelete"
        />
    </div>
</template>

<style lang="postcss" scoped>
.budget-detail-heading {
    .title-button-group {
        display: inline-flex;
    }

    .title-right-extra {
        @apply inline-flex items-center justify-end;
        flex-grow: 1;
        float: right;
        min-height: 2.5rem;
        .divider {
            height: 0.875rem;
            margin: 0 0.5rem;
        }

        .right-item {
            @apply text-gray-800;
            font-size: 0.875rem;
            .label {
                font-weight: 700;
                padding-right: 0.25rem;
            }
        }
    }
}
</style>
