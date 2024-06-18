<script setup lang="ts">
import {
    PHeading,
} from '@spaceone/design-system';

import AnomalyDetectionConfigurationRecipientsForm
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationRecipientsForm.vue';
</script>

<template>
    <div class="anomaly-detection-configuration-recipients">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.RECIPIENTS')"
                   heading-type="sub"
                   class="heading"
        />
        <anomaly-detection-configuration-recipients-form />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-recipients {
    @apply flex flex-col bg-white border border-gray-200;
    padding: 2rem 1rem 1.5rem;
    border-radius: 0.375rem;
    .heading {
        margin-top: 0;
        margin-right: 0;
        margin-left: 0;
    }
}
</style>
