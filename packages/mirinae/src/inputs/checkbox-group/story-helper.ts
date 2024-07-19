import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { DIRECTION } from '@/inputs/radio-group/type';

export const getCheckboxGroupArgs = (): Args => ({
    direction: DIRECTION.horizontal,
});

export const getCheckboxGroupParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A162064',
    },
});

export const getCheckboxGroupArgTypes = (): ArgTypes => ({
    direction: {
        name: 'direction',
        type: { name: 'string' },
        description: 'Checkbox alignment direction',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: DIRECTION.horizontal,
            },
        },
        control: 'select',
        options: Object.values(DIRECTION),
    },
    // default
    default: { table: { disable: true } },
});
