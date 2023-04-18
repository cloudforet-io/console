import type { ArgTypes } from '@storybook/addons';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutSimpleTableArgTypes = (): ArgTypes => {
    const argTypes = getDynamicLayoutArgTypes();

    argTypes.data.defaultValue = mock.table.data;
    argTypes.options.defaultValue = mock.table.options;

    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
        loading: argTypes.loading,
        timezone: argTypes.timezone,
        colCopy: argTypes.colCopy,
    };
};
