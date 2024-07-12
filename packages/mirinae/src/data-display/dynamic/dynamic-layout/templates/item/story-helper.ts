import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutItemArgTypes = () => {
    const argTypes = getDynamicLayoutArgTypes();

    const data = argTypes.data;
    // data.defaultValue = mock.item.data;

    const options = argTypes.options;
    // options.defaultValue = mock.item.options;

    return {
        name: argTypes.name,
        data,
        options,
        loading: argTypes.loading,
        timezone: argTypes.timezone,
    };
};
