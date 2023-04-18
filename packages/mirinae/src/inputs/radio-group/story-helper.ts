import type { ArgTypes } from '@storybook/addons';

import { DIRECTION } from '@/inputs/radio-group/type';

export const getRadioGroupArgTypes = (): ArgTypes => ({
    direction: {
        name: 'direction',
        type: { name: 'string' },
        description: 'Radios alignment direction',
        defaultValue: DIRECTION.horizontal,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: DIRECTION.horizontal,
            },
        },
        control: {
            type: 'select',
            options: Object.values(DIRECTION),
        },
    },
});
