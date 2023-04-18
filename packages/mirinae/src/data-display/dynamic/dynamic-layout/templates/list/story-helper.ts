import type { ArgTypes } from '@storybook/addons';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutListArgTypes = (): ArgTypes => {
    const argTypes = getDynamicLayoutArgTypes();

    argTypes.options.defaultValue = mock.list.options;
    argTypes.data.defaultValue = mock.list.data;

    delete argTypes.type;
    delete argTypes.typeOptions;
    delete argTypes.fetchOptions;

    return argTypes;
};
