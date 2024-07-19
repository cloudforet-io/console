import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';
import dayjs from 'dayjs';

export const getDatePaginationParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=10%3A210565',
    },
});

export const getDatePaginationArgs = (): Args => ({
    date: dayjs(),
    allowFuture: false,
    timezone: 'UTC',
    disableNextButton: false,
});

export const getDatePaginationArgTypes = (): ArgTypes => ({
    date: {
        name: 'date',
        type: { name: 'object' } as SBType,
        description: 'Current date',
    },
    type: {
        name: 'type',
        type: { name: 'string' },
        description: 'Date type',
        defaultValue: 'month',
        control: 'select',
        options: ['month', 'week'],
    },
    allowFuture: {
        name: 'allowFuture',
        type: { name: 'boolean' },
        description: 'Decide whether to allow the future',
    },
    timezone: {
        name: 'timezone',
        type: { name: 'string' },
        description: 'Timezone',
        control: 'select',
        options: ['UTC', 'Asia/Seoul'],
    },
    disableNextButton: {
        name: 'disableNextButton',
        type: { name: 'boolean' },
        description: 'Decide whether to disable the next button',
    },
});
