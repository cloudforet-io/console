import { ArgTypes } from '@storybook/addons';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';
import mock from '@/data-display/dynamic/dynamic-layout/mock';

export const getDynamicLayoutListArgTypes = (): ArgTypes => {
    const argTypes = getDynamicLayoutArgTypes();

    argTypes.options.defaultValue = mock.list.options;
    argTypes.data.defaultValue = mock.list.data;

    delete argTypes.type;
    delete argTypes.typeOptions;
    delete argTypes.fetchOptions;

    return argTypes;
};
