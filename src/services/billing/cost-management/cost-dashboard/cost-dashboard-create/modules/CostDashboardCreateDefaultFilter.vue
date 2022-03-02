<template>
    <fragment>
        <h3>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.FILTER') }}</h3>
        <p-check-box v-model="includesFilter" :disabled="!isDashboardTemplate">
            {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.APPLIED_FILTER') }}
        </p-check-box>
        <p-button size="sm" style-type="gray-border"
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
import {
    PButton, PCheckBox,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { has } from 'lodash';
import { store } from '@/store';
import ViewFilterModal from '@/services/billing/cost-management/cost-dashboard/modules/ViewFilterModal.vue';

export default {
    name: 'CostDashboardCreateDefaultFilter',
    components: {
        ViewFilterModal,
        PCheckBox,
        PButton,
    },

    setup() {
        const state = reactive({
            includesFilter: computed({
                get() {
                    return store.state.service?.costDashboard?.includesFilter ?? false;
                },
                set(value) {
                    store.commit('service/costDashboard/setIncludesFilter', value);
                },
            }),
            defaultFilterModalVisible: false,
            defaultFilter: computed(() => store.state.service?.costDashboard?.defaultFilter ?? {}),
            isDashboardTemplate: computed(() => has(store.state.service?.costDashboard?.selectedTemplate, 'public_dashboard_id')
                || has(store.state.service?.costDashboard?.selectedTemplate, 'user_dashboard_id')),
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
