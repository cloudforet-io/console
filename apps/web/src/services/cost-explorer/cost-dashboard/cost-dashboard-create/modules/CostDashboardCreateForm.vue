<script lang="ts" setup>
import { PPaneLayout } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

import CostDashboardCreateDefaultFilter
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateDefaultFilter.vue';
import CostDashboardCreateSelectPrivacy
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateSelectPrivacy.vue';
import CostDashboardCreateWithDashboard
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateWithDashboard.vue';
import CostDashboardCreateWithLayout
    from '@/services/cost-explorer/cost-dashboard/cost-dashboard-create/modules/CostDashboardCreateWithLayout.vue';

interface Props {
    manageDisabled: boolean;
}

defineProps<Props>();
const { t } = useI18n();

</script>

<template>
    <div class="cost-dashboard-create-form">
        <p-pane-layout>
            <h2>{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.TEMPLATE.TEMPLATE') }}</h2>
            <p-pane-layout>
                <cost-dashboard-create-with-layout />
                <cost-dashboard-create-with-dashboard />
            </p-pane-layout>
            <cost-dashboard-create-default-filter />
        </p-pane-layout>
        <p-pane-layout>
            <h2>{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CREATE.VISIBILITY.VISIBILITY') }}</h2>
            <cost-dashboard-create-select-privacy :manage-disabled="manageDisabled" />
        </p-pane-layout>
    </div>
</template>

<style lang="postcss" scoped>
.cost-dashboard-create-form {
    @apply flex flex-col row-gap-4;
    .p-pane-layout {
        @apply pt-8 pr-4 pb-10 pl-4 mb-4;
    }
    h2 {
        @apply mb-6;
        font-size: 1.5rem;
        line-height: 1.25;
    }
}
</style>
