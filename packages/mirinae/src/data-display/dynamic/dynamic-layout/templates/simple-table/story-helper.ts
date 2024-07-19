import type { ArgTypes, Args } from '@storybook/vue';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutSimpleTableArgs = (): Args => ({
    name: 'Base Information',
    options: mock.simpleTable.options,
    data: mock.table.data,
    loading: false,
    timezone: 'UTC',
    colCopy: false,
});

export const getDynamicLayoutSimpleTableArgTypes = (): ArgTypes => {
    const dynamicLayoutArgTypes = getDynamicLayoutArgTypes();

    const argTypes: ArgTypes = {
        name: dynamicLayoutArgTypes.name,
        options: dynamicLayoutArgTypes.options,
        data: dynamicLayoutArgTypes.data,
        loading: dynamicLayoutArgTypes.loading,
        timezone: dynamicLayoutArgTypes.timezone,
        colCopy: dynamicLayoutArgTypes.colCopy,
        // default
        slot: { table: { disable: true } },
        type: { table: { disable: true } },
        fetchOptions: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        fieldHandler: { table: { disable: true } },
    };

    return argTypes;
};
