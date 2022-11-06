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
        /* sync */
        period: {
            type: Object as () => Period|undefined,
            default: undefined,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            periodText: computed<string>(() => {
                if (props.period?.start) {
                    const start = dayjs.utc(props.period.start);
                    const end = dayjs.utc(props.period.end);
                    if (start.isSame(end)) return dayjs.utc(props.period.start).format('MMM D, YYYY');
                    return `${start.format('MMM D, YYYY')} ~ ${end.format('MMM D, YYYY')}`;
                }
                return '';
            }),
        });

        const handleDeletePeriod = () => {
            emit('update:period', undefined);
            emit('delete-period');
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
