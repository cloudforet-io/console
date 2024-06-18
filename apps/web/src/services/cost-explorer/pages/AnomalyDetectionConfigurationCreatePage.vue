<script setup lang="ts">
import { PHeading } from '@spaceone/design-system';

import AnomalyDetectionConfigurationInformationForm
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationInformationForm.vue';
import AnomalyDetectionConfigurationRecipientsForm
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationRecipientsForm.vue';
</script>

<template>
    <div class="anomaly-detection-configuration-create-page">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.CREATE_TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <anomaly-detection-configuration-information-form class="form" />
        <anomaly-detection-configuration-recipients-form class="form" />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-create-page {
    .form + .form {
        margin-top: 1rem;
    }
}
</style>
