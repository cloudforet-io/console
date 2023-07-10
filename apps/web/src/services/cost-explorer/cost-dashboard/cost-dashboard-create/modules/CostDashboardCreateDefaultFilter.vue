<script lang="ts" setup>

import {
    PButton, PCheckbox,
} from '@spaceone/design-system';
import { has } from 'lodash';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import ViewFilterModal from '@/services/cost-explorer/cost-dashboard/modules/ViewFilterModal.vue';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';

const { t } = useI18n();

const costDashboardPageStore = useCostDashboardPageStore();
const costDashboardPageState = costDashboardPageStore.$state;

const state = reactive({
    includesFilter: computed({
        get() {
            return costDashboardPageState.includesFilter ?? false;
        },
        set(value) {
            costDashboardPageStore.$patch({ includesFilter: value });
        },
    }),
    defaultFilterModalVisible: false,
    isDashboardTemplate: computed(() => has(costDashboardPageState.selectedTemplate, 'public_dashboard_id')
                || has(costDashboardPageState.selectedTemplate, 'user_dashboard_id')),
});

const handleClickFilterButton = () => {
    state.defaultFilterModalVisible = true;
};

</script>

<template>
    <h3>{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.FILTER') }}</h3>
    <p-checkbox v-model="state.includesFilter"
                :disabled="!state.isDashboardTemplate"
    >
        {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.APPLIED_FILTER') }}
    </p-checkbox>
    <p-button size="sm"
              style-type="tertiary"
              :disabled="!state.isDashboardTemplate"
              class="ml-2"
              @click="handleClickFilterButton"
    >
        {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.VIEW_FILTER') }}
    </p-button>
    <view-filter-modal v-model:visible="state.defaultFilterModalVisible"
                       :selected-filters="costDashboardPageState.defaultFilter"
    />
</template>

<style lang="postcss" scoped>
h3 {
    @apply font-bold mb-3;
    font-size: 0.875rem;
}
</style>
