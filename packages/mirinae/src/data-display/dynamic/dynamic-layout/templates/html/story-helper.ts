import type { ArgTypes, Args } from '@storybook/vue';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutHtmlArgs = (): Args => ({
    name: 'Base Information',
    options: mock.item.options,
    data: mock.item.data,
});

export const getDynamicLayoutHtmlArgTypes = (): ArgTypes => {
    const dynamicLayoutArgTypes = getDynamicLayoutArgTypes();

    const argTypes: ArgTypes = {
        name: dynamicLayoutArgTypes.name,
        options: dynamicLayoutArgTypes.options,
        data: dynamicLayoutArgTypes.data,
        // default
        fetchOptions: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        fieldHandler: { table: { disable: true } },
        slot: { table: { disable: true } },
    };

    return argTypes;
};
