<template>
    <div class="alert-history-widget grid grid-cols-12">
        <span class="title-wrapper col-span-12">
            <span class="title">
                {{ $t('MONITORING.ALERT.DASHBOARD.ALERT_HISTORY') }}
            </span>
        </span>
        <div class="summary-wrapper col-span-3">
            <p-card style="width: 209px;">
                <template #header>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-900">Created</span>
                        <span class="text-alert">1 <p-i name="ic_decrease" height="12px" width="12px" /></span>
                    </div>
                </template>
                <div class="flex justify-between items-center">
                    <span>8.5</span><span>145</span>
                </div>
                <div class="flex justify-between items-center text-gray text-xs mt-1">
                    <span>Dail Average</span><span class="text-right">Monthly Total</span>
                </div>
            </p-card>
        </div>
        <div class="chart-wrapper col-span-9">
            chart wrapper
        </div>
    </div>
</template>

<script lang="ts">
import {
    PCard, PI,
} from '@spaceone/design-system';

export default {
    name: 'AlertHistoryWidget',
    components: {
        PCard,
        PI,
    },
};
</script>

<style lang="postcss" scoped>
.alert-history-widget {
    @apply bg-white border border-gray-200 rounded-md;
    padding: 1rem;

    .title-wrapper {
        padding-bottom: 1rem;

        .title {
            @apply text-gray-900;
            font-size: 1rem;
            line-height: 1.6;
            font-weight: bold;
        }
    }
}
</style>
