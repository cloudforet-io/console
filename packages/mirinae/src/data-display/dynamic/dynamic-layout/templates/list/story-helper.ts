import type { ArgTypes, Args } from '@storybook/vue';

import mock, { getQueryTags } from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutListArgs = (): Args => ({
    name: 'Base Information',
    options: mock.list.options,
    data: mock.list.data,
    fieldHandler: undefined,
    loading: false,
    totalCount: 0,
    timezone: 'UTC',
    language: 'en',
    colCopy: false,
    excelVisible: false,
    settingsVisible: false,
    selectable: false,
    multiSelect: true,
    invalid: false,
    selectIndex: [],
    keyItemSets: [],
    valueHandlerMap: {},
    popupVisible: false,
    sortBy: undefined,
    sortDesc: undefined,
    pageStart: undefined,
    pageLimit: undefined,
    queryTags: getQueryTags(),
    searchText: '',
});

export const getDynamicLayoutListArgTypes = () => {
    const dynamicLayoutArgTypes = getDynamicLayoutArgTypes();

    const argTypes: ArgTypes = {
        ...dynamicLayoutArgTypes,
        type: { table: { disable: true } },
        fetchOptions: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        slot: { table: { disable: true } },
    };

    delete argTypes.type;
    delete argTypes.typeOptions;
    delete argTypes.fetchOptions;

    return argTypes;
};
