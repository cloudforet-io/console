<script setup lang="ts">
import { defineProps } from 'vue';

import AlertDetailInfoTable from '@/services/alert-manager-v2/components/AlertDetailInfoTable.vue';
import AlertDetailNote from '@/services/alert-manager-v2/components/AlertDetailNote.vue';
import AlertDetailSummary from '@/services/alert-manager-v2/components/AlertDetailSummary.vue';
import AlertDetailTabs from '@/services/alert-manager-v2/components/AlertDetailTabs.vue';
import AlertsDetailHeader from '@/services/alert-manager-v2/components/AlertsDetailHeader.vue';

interface Props {
    alertId: string;
}

const props = withDefaults(defineProps<Props>(), {
    alertId: '',
});
</script>

<template>
    <div class="alerts-detail-page">
        <alerts-detail-header :alert-id="props.alertId" />
        <div class="flex gap-4 items-start">
            <div class="flex flex-col gap-4">
                <alert-detail-summary :id="props.alertId" />

                <alert-detail-info-table :id="props.alertId" />
                <alert-detail-tabs :id="props.alertId" />
                <alert-detail-tabs :id="props.alertId"
                                   class="timeline-and-event"
                />
            </div>
            <alert-detail-note :id="props.alertId"
                               class="note"
            />
        </div>
    </div>
</template>
