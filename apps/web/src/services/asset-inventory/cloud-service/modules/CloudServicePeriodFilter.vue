<script lang="ts" setup>

import { PTag } from '@spaceone/design-system';
import dayjs from 'dayjs';
import {
    computed, reactive,
} from 'vue';

import { useCloudServicePageStore } from '@/services/asset-inventory/store/cloud-service-page-store';
import type { Period } from '@/services/cost-explorer/type';

interface Props {
    period?: Period;
    readOnly?: boolean;
}

withDefaults(defineProps<Props>(), {
    period: undefined,
    readOnly: false,
});

const cloudServicePageStore = useCloudServicePageStore();
const cloudServicePageState = cloudServicePageStore.$state;

const state = reactive({
    periodText: computed<string>(() => {
        if (cloudServicePageState.period?.start) {
            const start = dayjs.utc(cloudServicePageState.period.start);
            const end = dayjs.utc(cloudServicePageState.period.end);
            if (start.isSame(end)) return dayjs.utc(cloudServicePageState.period.start).format('MMM D, YYYY');
            return `${start.format('MMM D, YYYY')} ~ ${end.format('MMM D, YYYY')}`;
        }
        return '';
    }),
});

const handleDeletePeriod = () => {
    cloudServicePageStore.$patch({ period: undefined });
};

</script>

<template>
    <p-tag v-if="state.periodText"
           class="period"
           :deletable="!readOnly"
           @delete="handleDeletePeriod"
    >
        <span class="text">UTC</span>
        {{ state.periodText }}
    </p-tag>
</template>

<style lang="postcss" scoped>
.period {
    font-size: 0.875rem;
    line-height: 1.5;
    .text {
        @apply text-gray-500 mr-2;
    }
}
</style>
