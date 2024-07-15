import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutRawArgTypes = () => {
    const argTypes = getDynamicLayoutArgTypes();

    // argTypes.data.defaultValue = mock.item.data;

    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
        loading: argTypes.loading,
    };
};
