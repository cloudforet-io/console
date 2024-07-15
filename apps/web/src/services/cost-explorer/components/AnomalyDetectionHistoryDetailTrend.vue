<script setup lang="ts">
</script>

<template>
    <div class="anomaly-detection-history-detail-trend">
        <div class="chart" />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-history-detail-trend {
    @apply flex border border-gray-200;
    margin-top: 1rem;
    margin-bottom: 1rem;
    gap: 2.5rem;
    border-radius: 0.375rem;
    .chart {
        height: 31.5rem;
    }
}
</style>
