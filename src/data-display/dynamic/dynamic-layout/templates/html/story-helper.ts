import type { ArgTypes } from '@storybook/addons';

import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutHtmlArgTypes = (): ArgTypes => {
    const argTypes = getDynamicLayoutArgTypes();
    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
    };
};
