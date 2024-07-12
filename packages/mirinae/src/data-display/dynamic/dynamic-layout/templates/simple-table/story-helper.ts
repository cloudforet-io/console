import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutSimpleTableArgTypes = () => {
    const argTypes = getDynamicLayoutArgTypes();

    // argTypes.data.defaultValue = mock.table.data;
    // argTypes.options.defaultValue = mock.simpleTable.options;

    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
        loading: argTypes.loading,
        timezone: argTypes.timezone,
        colCopy: argTypes.colCopy,
    };
};
