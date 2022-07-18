import type { ArgTypes } from '@storybook/addons';

import { DATA_TYPE, SELECT_MODE, STYLE_TYPE } from '@/inputs/datetime-picker/type';

export const getDatetimePickerArtTypes = (): ArgTypes => ({
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
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Whether to apply invalid style or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
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
    selectMode: {
        name: 'selectMode',
        type: { name: 'string' },
        description: 'Select mode of datetime picker.',
        defaultValue: SELECT_MODE.single,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SELECT_MODE.single,
            },
        },
        control: {
            type: 'select',
            options: Object.values(SELECT_MODE),
        },
    },
    dataType: {
        name: 'dataType',
        type: { name: 'string' },
        description: 'data types of datetime picker.',
        defaultValue: DATA_TYPE.yearToDate,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: DATA_TYPE.yearToDate,
            },
        },
        control: {
            type: 'select',
            options: Object.values(DATA_TYPE),
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
