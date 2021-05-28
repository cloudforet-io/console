import { argTypes as selectArgTypes } from '@/states/select-state/story-helper';

const getArgTypes = () => {
    const argTypes = { ...selectArgTypes };
    delete argTypes.multiSelectable;
    return argTypes;
};
export const argTypes = getArgTypes();
