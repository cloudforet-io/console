<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PHeading, PButton } from '@spaceone/design-system';

import AnomalyDetectionConfigurationTable
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationTable.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const router = useRouter();
</script>

<template>
    <div class="anomaly-detection-configuration-page">
        <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.TITLE')">
            <template #extra>
                <p-button icon-left="ic_plus"
                          @click="router.push({ name: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.CONFIGURATION.CREATE._NAME})"
                >
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
