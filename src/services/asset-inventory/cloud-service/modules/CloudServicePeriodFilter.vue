<template>
    <p-tag v-if="periodText"
           class="period"
           :deletable="!readOnly"
           @delete="handleDeletePeriod"
    >
        <span class="text">UTC</span>
        {{ periodText }}
    </p-tag>
</template>

<script lang="ts">
import {
    computed, defineComponent,
    reactive, toRefs,
} from 'vue';

import { PTag } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { useCloudServicePageStore } from '@/services/asset-inventory/store/cloud-service-page-store';
import type { Period } from '@/services/cost-explorer/type';


interface Props {
    period?: Period;
    readOnly?: boolean;
}

export default defineComponent<Props>({
    name: 'CloudServicePeriodFilter',
    components: {
        PTag,
    },
    props: {
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
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

        return {
            ...toRefs(state),
            handleDeletePeriod,
        };
    },
});
</script>

<style lang="postcss" scoped>
.period {
    font-size: 0.875rem;
    line-height: 1.5;
    .text {
        @apply text-gray-500 mr-2;
    }
}
</style>
