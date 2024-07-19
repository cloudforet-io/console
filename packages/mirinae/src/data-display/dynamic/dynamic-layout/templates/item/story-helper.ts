import type { ArgTypes, Args } from '@storybook/vue';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutItemArgs = (): Args => ({
    name: 'Base Information',
    options: mock.item.options,
    data: mock.item.data,
    loading: false,
    timezone: 'UTC',
});

export const getDynamicLayoutItemArgTypes = (): ArgTypes => {
    const dynamicLayoutArgTypes = getDynamicLayoutArgTypes();

    const data = dynamicLayoutArgTypes.data;
    const options = dynamicLayoutArgTypes.options;

    const argTypes: ArgTypes = {
        name: dynamicLayoutArgTypes.name,
        data,
        options,
        loading: dynamicLayoutArgTypes.loading,
        timezone: dynamicLayoutArgTypes.timezone,
        slot: { table: { disable: true } },
        type: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        fetchOptions: { table: { disable: true } },
        fieldHandler: { table: { disable: true } },
    };

    return argTypes;
};
