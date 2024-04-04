import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
} from 'vue';

import { shallowMount, createLocalVue } from '@vue/test-utils';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { describe, expect, it } from 'vitest';

import type { DateRange } from '@/schema/dashboard/_types/dashboard-type';

import { useDateRangeFormatter } from '@/common/composables/date-range-formatter';

const localVue = createLocalVue();
dayjs.extend(utc);

describe('Date Range Formatter Composable', () => {
    const mockComponent = defineComponent({
        props: {
            dateRange: {
                type: Object as PropType<DateRange>,
                default: () => ({}),
            },
        },
        setup(props) {
            const [formattedDateRange] = useDateRangeFormatter({
                start: computed(() => props.dateRange?.start),
                end: computed(() => props.dateRange?.end),
            });


            return {
                formattedDateRange,
            };
        },
        template: `
            <div id="date">
                {{ formattedDateRange }}
            </div>`,
    });

    const wrapper = shallowMount(mockComponent as any, { localVue });

    // HACK: This test is not working.
    it('Should be displayed in the format of "Jan, 2023" when the start and end dates are in the same year and month.', async () => {
        await wrapper.setProps({
            dateRange: {
                start: '2023-01-01',
                end: '2023-01-31',
            },
        });
        const dateEl = wrapper.find('#date');
        expect(dateEl.text()).toBe('Jan, 2023');
    });

    it('Should be displayed in the format of "Sep 11, YYYY" when the start and end dates are in the same year and month, and end month is this month.', async () => {
        const _currentDate = dayjs.utc().set('date', 11);
        console.log(_currentDate.format('YYYY-MM-DD'));
        await wrapper.setProps({
            dateRange: {
                start: _currentDate.format('YYYY-MM-DD'),
                end: _currentDate.format('YYYY-MM-DD'),
            },
        });
        const dateEl = wrapper.find('#date');
        expect(dateEl.text()).toBe(`${_currentDate.format('MMM')} 11, ${_currentDate.format('YYYY')}`);
    });

    it('Should be displayed in the format of "Jan ~ Feb, 2023" when the start and end dates are in the same year but different months.', async () => {
        await wrapper.setProps({
            dateRange: {
                start: '2023-01-01',
                end: '2023-02-28',
            },
        });
        const dateEl = wrapper.find('#date');
        expect(dateEl.text()).toBe('Jan ~ Feb, 2023');
    });

    it('Should be displayed in the format of "Jan 2023 ~ Feb 28, YYYY" when the start and end dates are in different years.', async () => {
        const _currentMonthEndDate = dayjs.utc().endOf('month');
        await wrapper.setProps({
            dateRange: {
                start: '2022-01-01',
                end: _currentMonthEndDate.format('YYYY-MM-DD'),
            },
        });
        const dateEl = wrapper.find('#date');
        expect(dateEl.text()).toBe(`Jan 2022 ~ ${_currentMonthEndDate.format('MMM D, YYYY')}`);
    });
});
