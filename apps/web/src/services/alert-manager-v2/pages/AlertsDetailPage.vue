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
            <div class="flex w-8/12 flex-col gap-4">
                <alert-detail-summary />

                <alert-detail-info-table />
                <alert-detail-tabs />
            </div>
            <alert-detail-note class="w-4/12" />
        </div>
    </div>
</template>
