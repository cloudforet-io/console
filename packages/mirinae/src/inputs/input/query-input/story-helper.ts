import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { getKeyItemSets, getValueHandlerMap } from '@/inputs/dropdown/filterable-query-dropdown/mock';
import { getSelectDropdownArgTypes, getSelectDropdownArgs } from '@/inputs/dropdown/select-dropdown/story-helper';
import { getTextInputArgTypes, getTextInputArgs } from '@/inputs/input/text-input/story-helper';

export const getQueryInputArgs = (): Args => {
    const textInputArgs = getTextInputArgs();
    const filterableDropdownArgs = getSelectDropdownArgs();
    const keyItemSets = getKeyItemSets(5, 1);

    return {
        value: textInputArgs.value,
        size: textInputArgs.size,
        disabled: textInputArgs.disabled,
        block: textInputArgs.block,
        invalid: textInputArgs.invalid,
        placeholder: textInputArgs.placeholder,
        multiInput: textInputArgs.multiInput,
        selected: textInputArgs.selected,
        keyItemSets,
        valueHandlerMap: getValueHandlerMap(keyItemSets),
        visibleMenu: textInputArgs.visibleMenu,
        useFixedMenuStyle: textInputArgs.useFixedMenuStyle,
        appearanceType: filterableDropdownArgs.appearanceType,
    };
};

export const getQueryInputParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'figma url',
    },
});

export const getQueryInputArgTypes = (): ArgTypes => {
    const textInputArgTypes = getTextInputArgTypes();
    const filterableDropdownArgTypes = getSelectDropdownArgTypes();

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
            type: { name: 'array' } as SBType,
            description: 'Query key list.',
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
            type: { name: 'object' } as SBType,
            description: 'Query value handlers.',
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
        // default
        'update:visible-menu': { table: { disable: true } },
        'update:selected': { table: { disable: true } },
        update: { table: { disable: true } },
    };
};
