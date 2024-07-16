import { faker } from '@faker-js/faker';
import { range } from 'lodash';

import { LOADER_TYPES } from '@/feedbacks/loading/data-loader/config';
import { SPINNER_SIZE } from '@/feedbacks/loading/spinner/type';

export const getDataLoaderDefaultArgs = () => ({
    loading: true,
    data: range(15).map(() => faker.lorem.lines()),
    loaderType: LOADER_TYPES.spinner,
    spinnerSize: SPINNER_SIZE.xl,
    disableEmptyCase: false,
    showDataFromScratch: false,
    minLoadingTime: 0,
    lazyLoadingTime: 0,
    loaderBackdropOpacity: 0.5,
    loaderBackdropColor: 'white',
    disableTransition: false,
    defaultSlot: undefined,
});

export const getDataLoaderArgTypes = () => ({
    loading: {
        name: 'loading',
        type: 'boolean',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    data: {
        name: 'data',
        type: 'object',
        description: 'Data to display',
        table: {
            type: {
                summary: 'object, array',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: 'object',
    },
    loaderType: {
        name: 'loaderType',
        type: 'string',
        description: `Loader type. ${Object.values(LOADER_TYPES)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: LOADER_TYPES.spinner,
            },
        },
        control: 'select',
        options: Object.values(LOADER_TYPES),
    },
    spinnerSize: {
        name: 'spinnerSize',
        type: 'string',
        description: `Spinner loader size. It works only when \`loaderType\` props is ${LOADER_TYPES.spinner}.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SPINNER_SIZE.xl,
            },
        },
        control: 'select',
        options: Object.values(SPINNER_SIZE),
    },
    disableEmptyCase: {
        name: 'disableEmptyCase',
        type: 'boolean',
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
    showDataFromScratch: {
        name: 'showDataFromScratch',
        type: 'boolean',
        description: 'Whether to show data from scratch or after fetching data at least once.',
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
    minLoadingTime: {
        name: 'minLoadingTime',
        type: 'number',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: 'number',
    },
    lazyLoadingTime: {
        name: 'lazyLoadingTime',
        type: 'number',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: 'number',
    },
    loaderBackdropOpacity: {
        name: 'loaderBackdropOpacity',
        type: 'number',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0.5,
            },
        },
        control: 'number',
    },
    loaderBackdropColor: {
        name: 'loaderBackdropColor',
        type: 'string',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'white',
            },
        },
        control: 'color',
    },
    disableTransition: {
        name: 'disableTransition',
        type: 'boolean',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    /* slots */
    loaderSlot: {
        name: 'loader',
        description: 'Slot to replace loader.',
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
