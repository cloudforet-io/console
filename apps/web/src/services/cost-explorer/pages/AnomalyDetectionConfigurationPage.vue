<script setup lang="ts">
import { PHeading, PButton } from '@spaceone/design-system';

import AnomalyDetectionConfigurationTable
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationTable.vue';
</script>

<template>
    <div class="anomaly-detection-configuration-page">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.TITLE')">
            <template #extra>
                <p-button icon-left="ic_plus">
                    {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <anomaly-detection-configuration-table />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-page {
    @apply flex flex-col;
}
</style>
