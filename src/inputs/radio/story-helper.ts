import { argTypes as selectArgTypes } from '@/states/select-state/story-helper';

const getArgTypes = () => {
    const argTypes = { ...selectArgTypes };
    delete argTypes.multiSelectable;

    argTypes.selected = {
        ...selectArgTypes.selected,
        defaultValue: undefined,
        table: {
            ...selectArgTypes.selected.table,
            defaultValue: {
                summary: 'undefined',
            },
        },
    };
    return argTypes;
};
export const argTypes = getArgTypes();
