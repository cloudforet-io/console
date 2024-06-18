<script setup lang="ts">
import { PHeading, PButton } from '@spaceone/design-system';

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
        <div class="buttons-wrapper">
            <p-button style-type="tertiary"
                      size="lg"
            >
                {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="lg"
            >
                {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CREATE') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-create-page {
    .form + .form {
        margin-top: 1rem;
    }
    .buttons-wrapper {
        @apply inline-flex float-right;
        margin-top: 1.5rem;
        gap: 1rem;
    }
}
</style>
