import type { ArgTypes, Args, Parameters } from '@storybook/types';

export const getPFieldGroupArgs = (): Args => ({
    label: 'Label',
    helpText: 'help text.',
    invalidText: 'invalid text.',
    validText: 'valid text.',
    invalid: false,
    valid: false,
    required: false,
    styleType: 'primary',
    labelSlot: null,
    labelExtraSlot: null,
    validSlot: null,
    invalidSlot: null,
    help: null,
    default: null,
});

export const getPFieldGroupParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5339%3A10120',
    },
});

export const getPFieldGroupArgTypes = (): ArgTypes => ({
    label: {
        name: 'label',
        type: 'string',
        description: 'Label of field',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    helpText: {
        name: 'helpText',
        type: 'string',
        description: 'Help text of field',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    invalidText: {
        name: 'invalidText',
        type: 'string',
        description: 'Invalid text of field',
        defaultValue: 'invalid text.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    validText: {
        name: 'validText',
        type: 'string',
        description: 'Valid text of field',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    invalid: {
        name: 'invalid',
        type: 'boolean',
        description: 'Props for show invalid text and invalid style',
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
    valid: {
        name: 'valid',
        type: 'boolean',
        description: 'Props for show valid text',
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
    required: {
        name: 'required',
        type: 'boolean',
        description: 'Props for hide optional mark',
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
    styleType: {
        name: 'styleType',
        type: 'string',
        description: 'Style type for field group',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'select',
        options: ['primary', 'secondary'],
    },
    labelSlot: {
        name: 'label',
        description: 'Slot for label',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    labelExtraSlot: {
        name: 'label-extra',
        description: 'Slot for add something into right area of label',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    validSlot: {
        name: 'valid',
        description: 'Slot for valid text',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    invalidSlot: {
        name: 'invalid',
        description: 'Slot for invalid text',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    help: {
        name: 'help',
        description: 'Slot for help text',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    default: {
        name: 'default',
        description: 'Slot for input form',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    onClickLabel: {
        name: 'click-label',
        description: 'Event triggered by clicking label',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
    // default
    'label-extra': { table: { disable: true } },
    'click-field-title': { table: { disable: true } },
});
