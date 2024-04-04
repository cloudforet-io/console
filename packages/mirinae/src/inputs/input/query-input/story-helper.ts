import type { ArgTypes } from '@storybook/addons';

import { getKeyItemSets, getValueHandlerMap } from '@/inputs/dropdown/filterable-query-dropdown/mock';
import { getSelectDropdownArgTypes } from '@/inputs/dropdown/select-dropdown/story-helper';
import { getTextInputArgTypes } from '@/inputs/input/text-input/story-helper';

export const getQueryInputArgTypes = (): ArgTypes => {
    const textInputArgTypes = getTextInputArgTypes();
    const filterableDropdownArgTypes = getSelectDropdownArgTypes();
    const keyItemSets = getKeyItemSets(5, 1);
    return {
        value: textInputArgTypes.value,
        size: textInputArgTypes.size,
        disabled: textInputArgTypes.disabled,
        block: textInputArgTypes.block,
        invalid: textInputArgTypes.invalid,
        placeholder: textInputArgTypes.placeholder,
        multiInput: textInputArgTypes.multiInput,
        selected: textInputArgTypes.selected,
        keyItemSets: {
            name: 'keyItemSets',
            type: { name: 'array' },
            description: 'Query key list.',
            defaultValue: keyItemSets,
            table: {
                type: {
                    summary: 'array',
                },
                category: 'props',
                defaultValue: {
                    summary: '[]',
                },
            },
        },
        valueHandlerMap: {
            name: 'valueHandlerMap',
            type: { name: 'object' },
            description: 'Query value handlers.',
            defaultValue: getValueHandlerMap(keyItemSets),
            table: {
                type: {
                    summary: 'object',
                },
                category: 'props',
                defaultValue: {
                    summary: '{}',
                },
            },
        },
        visibleMenu: textInputArgTypes.visibleMenu,
        useFixedMenuStyle: textInputArgTypes.useFixedMenuStyle,
        appearanceType: filterableDropdownArgTypes.appearanceType,
    };
};
