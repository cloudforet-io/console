import type { ArgTypes } from '@storybook/addons';
import dayjs from 'dayjs';


export const getDatePaginationArgTypes = (): ArgTypes => ({
    date: {
        name: 'date',
        type: { name: 'object' },
        description: 'Current date',
        defaultValue: dayjs(),
    },
    type: {
        name: 'type',
        type: { name: 'string' },
        description: 'Date type',
        defaultValue: 'month',
        control: {
            type: 'select',
            options: ['month', 'week'],
        },
    },
    allowFuture: {
        name: 'allowFuture',
        type: { name: 'boolean' },
        description: 'Decide whether to allow the future',
        defaultValue: false,
    },
    timezone: {
        name: 'timezone',
        type: { name: 'string' },
        description: 'Timezone',
        defaultValue: 'UTC',
        control: {
            type: 'select',
            options: ['UTC', 'Asia/Seoul'],
        },
    },
});
