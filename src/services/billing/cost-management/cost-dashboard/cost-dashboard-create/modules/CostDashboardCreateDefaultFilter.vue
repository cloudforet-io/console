<template>
    <p>
        <span>Filter</span>
        <p-check-box v-model="includesFilter" :disabled="!isDashboardTemplate">
            Include Applied Filter from selected dashboard
        </p-check-box>
        <p-button size="sm" style-type="gray-border"
                  @click="handleClickFilterButton"
        >
            View Filter
        </p-button>
        <cost-dashboard-create-default-filter-modal v-model="defaultFilterModalVisible" :default-filter="defaultFilter" />
    </p>
</template>

<script lang="ts">
import {
    PButton, PCheckBox,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import CostDashboardCreateDefaultFilterModal
    from '@/services/billing/cost-management/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateDefaultFilterModal.vue';
import { store } from '@/store';

export default {
    name: 'CostDashboardCreateDefaultFilter',
    components: {
        CostDashboardCreateDefaultFilterModal,
        PCheckBox,
        PButton,
    },

    setup() {
        const state = reactive({
            includesFilter: false,
            defaultFilterModalVisible: false,
            defaultFilter: computed(() => store.state.service?.costDashboardCreate?.defaultFilter || {}),
            isDashboardTemplate: computed(() => store.state.service?.costDashboardCreate?.selectedTemplate.hasOwnProperty('public_dashboard_id')),
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
