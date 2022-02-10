<template>
    <fragment>
        <span>Filter</span>
        <p-check-box v-model="includesFilter" :disabled="!isDashboardTemplate">
            Include Applied Filter from selected dashboard
        </p-check-box>
        <p-button size="sm" style-type="gray-border"
                  :disabled="!isDashboardTemplate"
                  @click="handleClickFilterButton"
        >
            View Filter
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
