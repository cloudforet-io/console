import type { ArgTypes } from '@storybook/addons';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutMarkdownArgTypes = (): ArgTypes => {
    const argTypes = getDynamicLayoutArgTypes();

    argTypes.options.defaultValue = mock.markdown.options;
    argTypes.data.defaultValue = mock.markdown.data;

    argTypes.language.control = {
        type: 'select',
        options: ['en', 'ko', 'ch'],
    };

    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
        language: argTypes.language,
    };
};
