import type { ArgTypes, Args } from '@storybook/vue';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutMarkdownArgs = (): Args => ({
    name: 'Base Information',
    options: mock.markdown.options,
    data: mock.markdown.data,
    language: 'en',
});

export const getDynamicLayoutMarkdownArgTypes = (): ArgTypes => {
    const dynamicLayoutArgTypes = getDynamicLayoutArgTypes();

    const language = {
        ...dynamicLayoutArgTypes.language,
        control: 'select',
        options: ['en', 'ko', 'ch'],
    };

    const argTypes: ArgTypes = {
        name: dynamicLayoutArgTypes.name,
        options: dynamicLayoutArgTypes.options,
        data: dynamicLayoutArgTypes.data,
        language,
        // default
        slot: { table: { disable: true } },
        type: { table: { disable: true } },
        fetchOptions: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        fieldHandler: { table: { disable: true } },
    };

    return argTypes;
};
