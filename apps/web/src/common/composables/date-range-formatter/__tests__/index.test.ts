import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
} from 'vue';

import { shallowMount, createLocalVue } from '@vue/test-utils';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { describe, expect, it } from 'vitest';

import { useDateRangeFormatter } from '@/common/composables/date-range-formatter';

import type { DateRange } from '@/services/dashboards/config';

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

    // it('Should be displayed in the format of "Jan 11, 2023" when the start and end dates are in the same year and month, and end month is this month.', async () => {
    //     await wrapper.setProps({
    //         dateRange: {
    //             start: '2023-09',
    //             end: '2023-09',
    //         },
    //     });
    //     const dateEl = wrapper.find('#date');
    //     expect(dateEl.text()).toBe('Sep 11, 2023');
    // });

    it('Should be displayed in the format of "Jan ~ Feb 2023" when the start and end dates are in the same year but different months.', async () => {
        await wrapper.setProps({
            dateRange: {
                start: '2023-01-01',
                end: '2023-02-28',
            },
        });
        const dateEl = wrapper.find('#date');
        expect(dateEl.text()).toBe('Jan ~ Feb 2023');
    });

    it('Should be displayed in the format of "Jan 2023 ~ Feb 2024" when the start and end dates are in different years.', async () => {
        await wrapper.setProps({
            dateRange: {
                start: '2023-01-01',
                end: '2024-02-28',
            },
        });
        const dateEl = wrapper.find('#date');
        expect(dateEl.text()).toBe('Jan 2023 ~ Feb 2024');
    });
});
