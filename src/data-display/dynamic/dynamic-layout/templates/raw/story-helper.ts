import { ArgTypes } from '@storybook/addons';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';
import mock from '@/data-display/dynamic/dynamic-layout/mock';

export const getDynamicLayoutRawArgTypes = (): ArgTypes => {
    const argTypes = getDynamicLayoutArgTypes();

    argTypes.data.defaultValue = mock.item.data;

    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
        loading: argTypes.loading,
    };
};
