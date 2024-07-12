import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutHtmlArgTypes = () => {
    const argTypes = getDynamicLayoutArgTypes();
    
    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
    };
};
