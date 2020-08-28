<template>
    <nav class="p-date-pagination">
        <p-icon-button class="text"
                       name="ic_arrow_left"
                       @click="onClickPrevMonth"
        />
        <div class="date-text-lap">
            <div class="date-text">
                {{ dateText }}
            </div>
        </div>

        <p-icon-button class="text"
                       name="ic_arrow_right"
                       :disabled="nextButtonDisabled"
                       @click="onClickNextMonth"
        />
    </nav>
</template>

<script lang="ts">
import moment from 'moment';

import {
    reactive, toRefs, computed,
} from '@vue/composition-api';

import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';

import { getTimezone } from '@/lib/util';

export default {
    name: 'PDatePagination',
    components: { PIconButton },
    props: {
        date: {
            type: Object,
            default: moment().tz(getTimezone()),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            dateText: computed(() => props.date.format('YYYY-MM')),
            nextButtonDisabled: computed(() => {
                const currentMonth = moment().format('YYYY-MM');
                return currentMonth === state.dateText;
            }),
        });

        const onClickPrevMonth = () => {
            const prevMonthMoment = moment(props.date.format()).subtract(1, 'months').endOf('month');
            emit('update:date', prevMonthMoment);
        };
        const onClickNextMonth = () => {
            const nextMonthMoment = moment(props.date.format()).add(1, 'months').endOf('month');
            emit('update:date', nextMonthMoment);
        };

        return {
            ...toRefs(state),
            onClickPrevMonth,
            onClickNextMonth,
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
