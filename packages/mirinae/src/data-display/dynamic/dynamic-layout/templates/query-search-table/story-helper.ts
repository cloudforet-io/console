import type { ArgTypes, Args } from '@storybook/vue';

import mock, { getQueryTags } from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutQuerySearchTableArgs = (): Args => ({
    name: 'Base Information',
    options: mock.querySearchTable.options,
    data: mock.querySearchTable.data,
    loading: false,
    totalCount: 0,
    timezone: 'UTC',
    selectIndex: [],
    selectable: false,
    multiSelect: true,
    invalid: false,
    colCopy: false,
    excelVisible: false,
    settingsVisible: false,
    keyItemSets: [],
    valueHandlerMap: {},
    sortBy: undefined,
    sortDesc: undefined,
    pageStart: undefined,
    pageLimit: undefined,
    queryTags: getQueryTags(),
});

export const getDynamicLayoutQuerySearchTableArgTypes = (): ArgTypes => {
    const dynamicLayoutArgTypes = getDynamicLayoutArgTypes();

    const argTypes: ArgTypes = {
        name: dynamicLayoutArgTypes.name,
        options: dynamicLayoutArgTypes.options,
        data: dynamicLayoutArgTypes.data,
        loading: dynamicLayoutArgTypes.loading,
        totalCount: dynamicLayoutArgTypes.totalCount,
        timezone: dynamicLayoutArgTypes.timezone,
        selectIndex: dynamicLayoutArgTypes.selectIndex,
        selectable: dynamicLayoutArgTypes.selectable,
        multiSelect: dynamicLayoutArgTypes.multiSelect,
        invalid: dynamicLayoutArgTypes.invalid,
        colCopy: dynamicLayoutArgTypes.colCopy,
        excelVisible: dynamicLayoutArgTypes.excelVisible,
        settingsVisible: dynamicLayoutArgTypes.settingsVisible,
        keyItemSets: dynamicLayoutArgTypes.keyItemSets,
        valueHandlerMap: dynamicLayoutArgTypes.valueHandlerMap,
        sortBy: dynamicLayoutArgTypes.sortBy,
        sortDesc: dynamicLayoutArgTypes.sortDesc,
        pageStart: dynamicLayoutArgTypes.pageStart,
        pageLimit: dynamicLayoutArgTypes.pageLimit,
        queryTags: dynamicLayoutArgTypes.queryTags,
        onFetch: dynamicLayoutArgTypes.onFetch,
        onSelect: dynamicLayoutArgTypes.onSelect,
        onExport: dynamicLayoutArgTypes.onExport,
        onClickSettings: dynamicLayoutArgTypes.onClickSettings,
        onClickRow: dynamicLayoutArgTypes.onClickRow,
        // default
        slot: { table: { disable: true } },
        type: { table: { disable: true } },
        fetchOptions: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        fieldHandler: { table: { disable: true } },
    };

    return argTypes;
};
