<script setup lang="ts">
import {
    PHeading, PBadge, PI,
} from '@cloudforet/mirinae';

import AnomalyDetectionHistoryDetail from '@/services/cost-explorer/components/AnomalyDetectionHistoryDetail.vue';
import {
    getNotifyLevelBadgeInfo,
} from '@/services/cost-explorer/composables/anomaly-detection-handler';
import { NOTIFY_LEVEL_MAP } from '@/services/cost-explorer/constants/anomaly-detection-constant';
</script>

<template>
    <div class="anomaly-detection-history-detail-page">
        <p-heading title="detail page"
                   show-back-button
                   class="heading"
                   @click-back-button="$router.go(-1)"
        >
            <template #title-left-extra>
                <p-badge :style-type="getNotifyLevelBadgeInfo('critical')"
                         badge-type="solid-outline"
                >
                    <p-i name="ic_error-filled"
                         height="1rem"
                         width="1rem"
                         :color="NOTIFY_LEVEL_MAP['CRITICAL'].color"
                         class="icon"
                    />
                    <span>critical</span>
                </p-badge>
            </template>
        </p-heading>
        <anomaly-detection-history-detail />
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-history-detail-page {
    .heading {
        .icon {
            margin-right: 0.25rem;
        }
    }
}
</style>
