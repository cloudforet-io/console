<template>
    <div class="dashboard-refresher">
        <span class="label">{{ $t('DASHBOARDS.DETAIL.REFRESH') }}: {{ interval }}</span><p-icon-button class="icon-button"
                                                                                                       name="ic_renew"
                                                                                                       style-type="tertiary"
                                                                                                       shape="square"
                                                                                                       :animation="loading ? 'reserve-spin' : undefined"
                                                                                                       @click="handleRefresh"
        />
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from 'vue';

import { PIconButton } from '@spaceone/design-system';

import type { RefreshInterval } from '@/services/dashboards/config';
import { refreshInterval, refreshIntervalMap } from '@/services/dashboards/config';

interface Props {
    interval: RefreshInterval;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    interval: refreshInterval[0],
    loading: false,
});
const emit = defineEmits(['refresh']);

let intervalFunction;

const executeInterval = () => {
    if (refreshInterval.includes(props.interval)) {
        intervalFunction = setInterval(() => {
            if (props.loading) {
                clearInterval(intervalFunction);
            } else {
                emit('refresh');
            }
        }, refreshIntervalMap[props.interval]);
    }
};

watch(() => props.loading, (loading) => {
    if (loading) {
        clearInterval(intervalFunction);
    } else {
        executeInterval();
    }
});

executeInterval();

const handleRefresh = () => {
    emit('refresh');
};

</script>

<style scoped lang="postcss">
.dashboard-refresher {
    @apply inline-flex items-center;

    .label {
        @apply text-gray-500 mr-3;
        font-size: 0.875rem;
    }
}

</style>
