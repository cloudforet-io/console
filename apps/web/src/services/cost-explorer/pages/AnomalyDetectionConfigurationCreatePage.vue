<script setup lang="ts">
import { PHeading } from '@spaceone/design-system';

import AnomalyDetectionConfigurationInformationForm
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationInformationForm.vue';
</script>

<template>
    <div>
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.CREATE_TITLE')"
                   show-back-button
                   @click-back-button="$router.go(-1)"
        />
        <anomaly-detection-configuration-information-form />
    </div>
</template>
