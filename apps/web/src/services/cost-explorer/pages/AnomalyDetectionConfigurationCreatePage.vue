<script setup lang="ts">
import { PHeading, PButton } from '@cloudforet/mirinae';

import AnomalyDetectionConfigurationInformation
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationInformation.vue';
import AnomalyDetectionConfigurationRecipients
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationRecipients.vue';
</script>

<template>
    <div class="anomaly-detection-configuration-create-page">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.CREATE_TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <anomaly-detection-configuration-information class="form" />
        <anomaly-detection-configuration-recipients class="form" />
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
