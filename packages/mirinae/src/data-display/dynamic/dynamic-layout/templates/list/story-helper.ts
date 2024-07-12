import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutListArgTypes = () => {
    const argTypes = getDynamicLayoutArgTypes();

    // argTypes.options.defaultValue = mock.list.options;
    // argTypes.data.defaultValue = mock.list.data;

    delete argTypes.type;
    delete argTypes.typeOptions;
    delete argTypes.fetchOptions;

    return argTypes;
};
