import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutMarkdownArgTypes = () => {
    const argTypes = getDynamicLayoutArgTypes();

    // argTypes.options.defaultValue = mock.markdown.options;
    // argTypes.data.defaultValue = mock.markdown.data;

    // argTypes.language.control = {
    //     type: 'select',
    //     options: ['en', 'ko', 'ch'],
    // };

    const language = {
        ...argTypes.language,
        control: 'select',
        options: ['en', 'ko', 'ch'],
    };

    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
        language,
    };
};
