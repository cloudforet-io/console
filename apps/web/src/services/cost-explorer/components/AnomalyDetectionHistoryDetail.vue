<script setup lang="ts">
import {
    PLink,
} from '@cloudforet/mirinae';


import AnomalyDetectionHistoryDetailTrend
    from '@/services/cost-explorer/components/AnomalyDetectionHistoryDetailTrend.vue';
</script>

<template>
    <div class="anomaly-detection-history-detail">
        <div class="info-wrapper">
            <p>
                <strong>{{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.TITLE') }}: </strong>
                <p-link :to="{}"
                        action-icon="internal-link"
                        new-tab
                        class="col-name"
                >
                    config 이름
                </p-link>
            </p>
            <p>
                <strong>{{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.DETECTED') }}: </strong>
                <span>2024-01-15 10:13</span>
            </p>
        </div>
        <anomaly-detection-history-detail-trend />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-history-detail {
    @apply bg-white border border-gray-200;
    padding: 1rem;
    border-radius: 0.375rem;
    .info-wrapper {
        @apply flex justify-between text-label-md;
    }
}
</style>
