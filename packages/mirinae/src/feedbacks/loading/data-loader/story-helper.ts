import { faker } from '@faker-js/faker';
import type { ArgTypes } from '@storybook/addons';
import { range } from 'lodash';

import { LOADER_TYPES } from '@/feedbacks/loading/data-loader/config';
import { SPINNER_SIZE } from '@/feedbacks/loading/spinner/type';

export const getDataLoaderArgTypes = (): ArgTypes => ({
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    data: {
        name: 'data',
        type: { name: 'object' },
        description: 'Data to display',
        defaultValue: range(15).map(() => faker.lorem.lines()),
        table: {
            type: {
                summary: 'object, array',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: {
            type: 'object',
        },
    },
    loaderType: {
        name: 'loaderType',
        type: { name: 'string' },
        description: `Loader type. ${Object.values(LOADER_TYPES)} are available.`,
        defaultValue: LOADER_TYPES.spinner,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: LOADER_TYPES.spinner,
            },
        },
        control: {
            type: 'select',
            options: Object.values(LOADER_TYPES),
        },
    },
    spinnerSize: {
        name: 'spinnerSize',
        type: { name: 'string' },
        description: `Spinner loader size. It works only when \`loaderType\` props is ${LOADER_TYPES.spinner}.`,
        defaultValue: SPINNER_SIZE.xl,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SPINNER_SIZE.xl,
            },
        },
        control: {
            type: 'select',
            options: Object.values(SPINNER_SIZE),
        },
    },
    disableEmptyCase: {
        name: 'disableEmptyCase',
        type: { name: 'boolean' },
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
    showDataFromScratch: {
        name: 'showDataFromScratch',
        type: { name: 'boolean' },
        description: 'Whether to show data from scratch or after fetching data at least once.',
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
    minLoadingTime: {
        name: 'minLoadingTime',
        type: { name: 'number' },
        defaultValue: 0,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: {
            type: 'number',
        },
    },
    lazyLoadingTime: {
        name: 'lazyLoadingTime',
        type: { name: 'number' },
        defaultValue: 0,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: {
            type: 'number',
        },
    },
    loaderBackdropOpacity: {
        name: 'loaderBackdropOpacity',
        type: { name: 'number' },
        defaultValue: 0.5,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0.5,
            },
        },
        control: {
            type: 'number',
        },
    },
    loaderBackdropColor: {
        name: 'loaderBackdropColor',
        type: { name: 'string' },
        defaultValue: 'white',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'white',
            },
        },
        control: {
            type: 'color',
        },
    },
    disableTransition: {
        name: 'disableTransition',
        type: { name: 'boolean' },
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
    /* slots */
    loaderSlot: {
        name: 'loader',
        description: 'Slot to replace loader.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
    },
    defaultSlot: {
        name: 'default',
        description: 'Slot to insert data display elements.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
    },
    noDataSlot: {
        name: 'noData',
        description: 'Slot to replace no data display.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
    },
});
