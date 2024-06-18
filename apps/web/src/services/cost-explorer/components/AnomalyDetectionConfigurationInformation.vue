<script setup lang="ts">
import {
    PHeading,
} from '@spaceone/design-system';

import AnomalyDetectionConfigurationInformationForm
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationInformationForm.vue';

</script>

<template>
    <div class="anomaly-detection-configuration-information">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.BASE_INFORMATION')"
                   heading-type="sub"
                   class="heading"
        />
        <anomaly-detection-configuration-information-form />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-information {
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
