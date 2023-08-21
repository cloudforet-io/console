<script lang="ts" setup>
import { PRadio } from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DashboardPrivacyType } from '@/services/cost-explorer/cost-dashboard/type';
import { DASHBOARD_PRIVACY_TYPE } from '@/services/cost-explorer/cost-dashboard/type';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';

interface Props {
    manageDisabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    manageDisabled: false,
});
const { t } = useI18n();

const privacyList = [
    {
        name: DASHBOARD_PRIVACY_TYPE.USER,
        label: t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PRIVATE'),
    },
    {
        name: DASHBOARD_PRIVACY_TYPE.PUBLIC,
        label: t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.PUBLIC'),
    },
];

const costDashboardPageStore = useCostDashboardPageStore();

const state = reactive({
    selectedPrivacy: DASHBOARD_PRIVACY_TYPE.USER as DashboardPrivacyType,
    filteredPrivacyList: computed(() => (props.manageDisabled ? privacyList.filter((item) => item.name !== DASHBOARD_PRIVACY_TYPE.PUBLIC) : privacyList)),
});

const handleRadio = (value: DashboardPrivacyType) => {
    costDashboardPageStore.$patch({ selectedDashboardPrivacy: value });
};

</script>

<template>
    <h3>{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.SAVE_AS') }}</h3>
    <p-radio v-for="privacy in state.filteredPrivacyList"
             :key="privacy.name"
             v-model:selected="state.selectedPrivacy"
             :value="privacy.name"
             class="mr-4"
             @change="handleRadio"
    >
        <span class="capitalize ml-1">{{ privacy.label.toLowerCase() }}</span>
    </p-radio>
</template>

<style lang="postcss" scoped>
h3 {
    @apply font-bold mb-3;
    font-size: 0.875rem;
}
</style>
