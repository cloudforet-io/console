import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutPopupArgTypes = () => {
    const argTypes = getDynamicLayoutArgTypes();

    // argTypes.options.defaultValue = mock.popup.options;
    // argTypes.data.defaultValue = mock.popup.data;

    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
        popupVisible: argTypes.popupVisible,
    };
};
