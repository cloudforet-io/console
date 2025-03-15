<template>
    <nav class="p-date-pagination">
        <div class="date-text-wrapper">
            <div class="date-text">
                {{ dateText }}
            </div>
        </div>
        <p-icon-button class="text"
                       name="ic_chevron-left"
                       color="inherit transparent"
                       @click="onClickPrev"
        />
        <p-icon-button class="text"
                       name="ic_chevron-right"
                       color="inherit transparent"
                       :disabled="disableNextButton || nextButtonDisabled"
                       @click="onClickNext"
        />
    </nav>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    reactive, toRefs, computed,
    defineComponent,
} from 'vue';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';


import PIconButton from '@/controls/buttons/icon-button/PIconButton.vue';

dayjs.extend(isSameOrAfter);

export default defineComponent({
    name: 'PDatePagination',
    components: { PIconButton },
    props: {
        date: {
            type: Object as PropType<Dayjs>,
            default: () => dayjs(),
        },
        type: {
            type: String,
            default: 'month',
        },
        allowFuture: {
            type: Boolean,
            default: false,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        disableNextButton: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            dateText: computed(() => {
                const weekStart = props.date.startOf('week').format('MM');
                const weekEnd = props.date.endOf('week').format('MM');
                if (props.type === 'week') {
                    if (weekStart !== weekEnd) {
                        return `${weekStart} - ${weekEnd}, ${props.date.format('YYYY')}`;
                    }
                    return `${props.date.format('MM')}, ${props.date.format('YYYY')}`;
                }
                return props.date.format('YYYY-MM');
            }),
            nextButtonDisabled: computed(() => {
                if (props.allowFuture) {
                    return false;
                }
                const now = dayjs().tz(props.timezone);
                if (props.type === 'month') {
                    return now.format('YYYY-MM') === state.dateText;
                }
                const weekStart = now.startOf('week');
                return props.date.isSameOrAfter(weekStart, 'day');
            }),
        });

        const onClickPrev = () => {
            let prevDate: Dayjs;
            if (props.type === 'month') {
                prevDate = props.date.subtract(1, 'month').endOf('month');
            } else {
                prevDate = props.date.subtract(1, 'week').endOf('week');
            }
            emit('update:date', prevDate);
        };
        const onClickNext = () => {
            let nextDate: Dayjs;
            if (props.type === 'month') {
                nextDate = props.date.add(1, 'month').endOf('month');
            } else {
                nextDate = props.date.add(1, 'week').endOf('week');
            }
            emit('update:date', nextDate);
        };

        return {
            ...toRefs(state),
            onClickPrev,
            onClickNext,
        };
    },
});
</script>

<style lang="postcss">
.p-date-pagination {
    @apply min-w-12;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;

    .date-text-wrapper {
        @apply min-h-8 min-w-12 items-center justify-center inline-flex cursor-default;
        .date-text {
            line-height: 1rem;
            font-size: 1rem;
            margin-right: 1rem;
        }

        @apply lg:min-w-16;
    }
}
</style>
