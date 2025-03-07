<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PHeading, PButton, PHeadingLayout } from '@cloudforet/mirinae';

import AnomalyDetectionConfigurationTable
    from '@/services/cost-explorer/components/AnomalyDetectionConfigurationTable.vue';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';

const router = useRouter();
</script>

<template>
    <div class="anomaly-detection-configuration-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.TITLE')" />
            </template>
            <template #extra>
                <p-button icon-left="ic_plus"
                          @click="router.push({ name: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME})"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <anomaly-detection-configuration-table />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-page {
    @apply flex flex-col;
}
</style>
