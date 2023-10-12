<template>
    <fragment>
        <h3>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.SAVE_AS') }}</h3>
        <p-radio v-for="privacy in filteredPrivacyList"
                 :key="privacy.name"
                 v-model="selectedPrivacy"
                 :value="privacy.name"
                 class="mr-4"
                 @change="handleRadio"
        >
            <span class="capitalize ml-1">{{ privacy.label.toLowerCase() }}</span>
        </p-radio>
    </fragment>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PRadio } from '@spaceone/design-system';

import { i18n } from '@/translations';

import type { DashboardPrivacyType } from '@/services/cost-explorer/cost-dashboard/type';
import { DASHBOARD_PRIVACY_TYPE } from '@/services/cost-explorer/cost-dashboard/type';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';


const privacyList = [
    {
        name: DASHBOARD_PRIVACY_TYPE.USER,
        label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PRIVATE'),
    },
    {
        name: DASHBOARD_PRIVACY_TYPE.PUBLIC,
        label: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PUBLIC'),
    },
];

export default {
    name: 'CostDashboardCreateSelectPrivacy',
    components: {
        PRadio,
    },
    props: {
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const costDashboardPageStore = useCostDashboardPageStore();

        const state = reactive({
            selectedPrivacy: DASHBOARD_PRIVACY_TYPE.USER as DashboardPrivacyType,
            filteredPrivacyList: computed(() => (props.manageDisabled ? privacyList.filter((item) => item.name !== DASHBOARD_PRIVACY_TYPE.PUBLIC) : privacyList)),
        });

        const handleRadio = (value: DashboardPrivacyType) => {
            costDashboardPageStore.$patch({ selectedDashboardPrivacy: value });
        };

        return {
            ...toRefs(state),
            handleRadio,
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
