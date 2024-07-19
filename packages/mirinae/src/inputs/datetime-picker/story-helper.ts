import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { DATA_TYPE, SELECT_MODE, STYLE_TYPE } from '@/inputs/datetime-picker/type';

export const getDatetimePickerArgs = (): Args => ({
    selectedDates: [],
    styleType: STYLE_TYPE.default,
    invalid: false,
    minDate: undefined,
    maxDate: undefined,
    selectMode: SELECT_MODE.single,
    dataType: DATA_TYPE.yearToDate,
    'v-model': [],
});

export const getDatetimePickerParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/adutzilcHKkGuDjayFO7YS/Console-Basic?node-id=18277%3A382149',
    },
});

export const getDatetimePickerArgTypes = (): ArgTypes => ({
    selectedDates: {
        name: 'selectedDates',
        type: { name: 'array' } as SBType,
        description: 'Array of selected dates, consisting of ISOString.',
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
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: STYLE_TYPE.default,
            },
        },
        control: 'select',
        options: Object.keys(STYLE_TYPE),
    },
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Whether to apply invalid style or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    minDate: {
        name: 'minDate',
        type: { name: 'string' },
        description: '<b>[Flatpickr]</b> Specifies the minimum/earliest date. (ex. "2021-09" or "2021-09-30")',
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
    selectMode: {
        name: 'selectMode',
        type: { name: 'string' },
        description: 'Select mode of datetime picker.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SELECT_MODE.single,
            },
        },
        control: 'select',
        options: Object.values(SELECT_MODE),
    },
    dataType: {
        name: 'dataType',
        type: { name: 'string' },
        description: 'data types of datetime picker.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: DATA_TYPE.yearToDate,
            },
        },
        control: 'select',
        options: Object.values(DATA_TYPE),
    },
    //
    'v-model': {
        name: 'v-model',
        type: { name: 'array' } as SBType,
        description: 'Two way binding for `selectedDates` props with `update:selectedDates` event.',
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
    // events
    onClose: {
        name: 'close',
        description: 'Event emitted when calendar is start closing.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    onUpdateSelectedDates: {
        name: 'update:selectedDates',
        description: 'Event emitted when date was selected. works with `selectedDates` props sync.',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
