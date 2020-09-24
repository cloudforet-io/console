<template>
    <nav class="p-date-pagination">
        <div class="date-text-lap">
            <div class="date-text">
                {{ dateText }}
            </div>
        </div>
        <p-icon-button class="text"
                       name="ic_arrow_left"
                       @click="onClickPrev"
        />
        <p-icon-button class="text"
                       name="ic_arrow_right"
                       :disabled="nextButtonDisabled"
                       @click="onClickNext"
        />
    </nav>
</template>

<script lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import { DatePaginationProps } from '@/components/organisms/date-pagination/type';

import { getTimezone } from '@/lib/util';

dayjs.extend(isSameOrAfter);

export default {
    name: 'PDatePagination',
    components: { PIconButton },
    props: {
        date: {
            type: Object,
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
    },
    setup(props: DatePaginationProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            dateText: computed(() => {
                const weekStart = props.date.startOf('week').format('M');
                const weekEnd = props.date.endOf('week').format('M');
                if (props.type === 'week') {
                    if (weekStart !== weekEnd) {
                        return `${weekStart + vm.$t('PWR_SCHED.MONTH')} - ${weekEnd + vm.$t('PWR_SCHED.MONTH')} ${props.date.format('YYYY') + vm.$t('PWR_SCHED.YEAR')}`;
                    }
                    return `${props.date.format('M') + vm.$t('PWR_SCHED.MONTH')} ${props.date.format('YYYY') + vm.$t('PWR_SCHED.YEAR')}`;
                }
                return props.date.format('YYYY-MM');
            }),
            nextButtonDisabled: computed(() => {
                if (props.allowFuture) {
                    return false;
                }
                const now = dayjs().tz(getTimezone());
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
};
</script>

<style lang="postcss">
.p-date-pagination {
    @apply min-w-12;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;

    .date-text-lap {
        @apply min-h-8 min-w-12 items-center justify-center inline-flex cursor-default;
        .date-text {
            line-height: 1.2rem;
            font-size: 0.875rem;
        }

        @screen lg {
            @apply min-w-16;
        }
    }
}
</style>
