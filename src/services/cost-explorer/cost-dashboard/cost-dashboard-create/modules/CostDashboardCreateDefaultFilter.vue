<template>
    <fragment>
        <h3>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.FILTER') }}</h3>
        <p-checkbox v-model="includesFilter"
                    :disabled="!isDashboardTemplate"
        >
            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.APPLIED_FILTER') }}
        </p-checkbox>
        <p-button size="sm"
                  style-type="tertiary"
                  :disabled="!isDashboardTemplate"
                  class="ml-2"
                  @click="handleClickFilterButton"
        >
            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.VIEW_FILTER') }}
        </p-button>
        <view-filter-modal :visible.sync="defaultFilterModalVisible"
                           :selected-filters="costDashboardPageState.defaultFilter"
        />
    </fragment>
</template>

<script lang="ts">

import { computed, reactive, toRefs } from 'vue';

import {
    PButton, PCheckbox,
} from '@spaceone/design-system';
import { has } from 'lodash';

import ViewFilterModal from '@/services/cost-explorer/cost-dashboard/modules/ViewFilterModal.vue';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';

export default {
    name: 'CostDashboardCreateDefaultFilter',
    components: {
        ViewFilterModal,
        PCheckbox,
        PButton,
    },

    setup() {
        const costDashboardPageStore = useCostDashboardPageStore();
        const costDashboardPageState = costDashboardPageStore.state;

        const state = reactive({
            includesFilter: computed({
                get() {
                    return costDashboardPageState.includesFilter ?? false;
                },
                set(value) {
                    costDashboardPageState.includesFilter = value;
                },
            }),
            defaultFilterModalVisible: false,
            isDashboardTemplate: computed(() => has(costDashboardPageState.selectedTemplate, 'public_dashboard_id')
                || has(costDashboardPageState.selectedTemplate, 'user_dashboard_id')),
        });

        const handleClickFilterButton = () => {
            state.defaultFilterModalVisible = true;
        };

        return {
            ...toRefs(state),
            costDashboardPageState,
            handleClickFilterButton,
        };
    },
};
</script>

<style lang="postcss" scoped>
h3 {
    @apply font-bold mb-3;
    font-size: 0.875rem;
}
</style>
