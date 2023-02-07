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
                           :selected-filters="defaultFilter"
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
import { costExplorerStore } from '@/services/cost-explorer/store';

export default {
    name: 'CostDashboardCreateDefaultFilter',
    components: {
        ViewFilterModal,
        PCheckbox,
        PButton,
    },

    setup() {
        const state = reactive({
            includesFilter: computed({
                get() {
                    return costExplorerStore.state.dashboard.includesFilter ?? false;
                },
                set(value) {
                    costExplorerStore.commit('dashboard/setIncludesFilter', value);
                },
            }),
            defaultFilterModalVisible: false,
            defaultFilter: computed(() => costExplorerStore.state.dashboard.defaultFilter ?? {}),
            isDashboardTemplate: computed(() => has(costExplorerStore.state.dashboard.selectedTemplate, 'public_dashboard_id')
                || has(costExplorerStore.state.dashboard.selectedTemplate, 'user_dashboard_id')),
        });

        const handleClickFilterButton = () => {
            state.defaultFilterModalVisible = true;
        };

        return {
            ...toRefs(state),
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
