<script setup lang="ts">
import {
    defineProps, onMounted,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import AlertDetailInfoTable from '@/services/alert-manager/v2/components/AlertDetailInfoTable.vue';
import AlertDetailNote from '@/services/alert-manager/v2/components/AlertDetailNote.vue';
import AlertDetailSummary from '@/services/alert-manager/v2/components/AlertDetailSummary.vue';
import AlertDetailTabs from '@/services/alert-manager/v2/components/AlertDetailTabs.vue';
import AlertsDetailHeader from '@/services/alert-manager/v2/components/AlertsDetailHeader.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';

interface Props {
    alertId: string;
}

const props = withDefaults(defineProps<Props>(), {
    alertId: '',
});

const router = useRouter();

onMounted(() => {
    if (!props.alertId) {
        router.push({ name: ALERT_MANAGER_ROUTE.ALERTS._NAME }).catch(() => {});
    }
});
</script>

<template>
    <div class="alerts-detail-page">
        <alerts-detail-header />
        <div class="content flex gap-4 items-start">
            <div class="section flex w-8/12 flex-col gap-4">
                <alert-detail-summary />
                <alert-detail-info-table />
                <alert-detail-tabs />
            </div>
            <alert-detail-note class="section w-4/12" />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.alerts-detail-page {
    @screen tablet {
        .content {
            flex-direction: column;
        }
        .section {
            width: 100%;
        }
    }
}
</style>
