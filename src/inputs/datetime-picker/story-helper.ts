import { ArgTypes } from '@storybook/addons';
import { FLATPICKR_MODE, STYLE_TYPE } from '@/inputs/datetime-picker/type';

export const argTypes: ArgTypes = {
    selectedDates: {
        name: 'selectedDates',
        type: { name: 'array' },
        description: 'Array of selected dates, consisting of ISOString.',
        defaultValue: [],
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
    },
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Style type of datetime picker.',
        defaultValue: STYLE_TYPE.default,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: STYLE_TYPE.default,
            },
        },
        control: {
            type: 'select',
            options: Object.keys(STYLE_TYPE),
        },
    },
    timezone: {
        name: 'timezone',
        type: { name: 'string' },
        description: 'Timezone. It specifies the timezone of selected dates.',
        defaultValue: 'UTC',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'UTC',
            },
        },
    },
    /* [Flatpickr] */
    mode: {
        name: 'mode',
        type: { name: 'string' },
        description: '<b>[Flatpickr]</b> Mode of datetime picker(according to Flatpickr\'s spec)',
        defaultValue: 'single',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'single',
            },
        },
        control: {
            type: 'select',
            options: Object.keys(FLATPICKR_MODE),
        },
    },
    enableTime: {
        name: 'enableTime',
        type: { name: 'boolean' },
        description: '<b>[Flatpickr]</b> Whether to show time picker or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    minDate: {
        name: 'minDate',
        type: { name: 'string' },
        description: '<b>[Flatpickr]</b> Specifies the minimum/earliest date. (ex. "2021-09" or "2021-09-30")',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
    },
    maxDate: {
        name: 'maxDate',
        type: { name: 'string' },
        description: '<b>[Flatpickr]</b> Specifies the maximum/latest date. (ex. "2021-10" or "2021-10-31")',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
    },
    //
    'v-model': {
        name: 'v-model',
        type: { name: 'array' },
        description: 'Two way binding for `selectedDates` props with `update:selectedDates` event.',
        defaultValue: [],
        table: {
            type: {
                summary: 'array',
            },
            category: 'model',
            defaultValue: {
                summary: '[]',
            },
        },
        control: null,
    },
};
