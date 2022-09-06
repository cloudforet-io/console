import type { ArgTypes } from '@storybook/addons';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import { getDynamicLayoutArgTypes } from '@/data-display/dynamic/dynamic-layout/story-helper';

export const getDynamicLayoutTableArgTypes = (): ArgTypes => {
    const argTypes = getDynamicLayoutArgTypes();

    argTypes.data.defaultValue = mock.table.data;
    argTypes.options.defaultValue = mock.table.options;

    return {
        name: argTypes.name,
        options: argTypes.options,
        data: argTypes.data,
        loading: argTypes.loading,
        totalCount: argTypes.totalCount,
        timezone: argTypes.timezone,
        selectIndex: argTypes.selectIndex,
        selectable: argTypes.selectable,
        multiSelect: argTypes.multiSelect,
        invalid: argTypes.invalid,
        colCopy: argTypes.colCopy,
        excelVisible: argTypes.excelVisible,
        settingsVisible: argTypes.settingsVisible,
        sortBy: argTypes.sortBy,
        sortDesc: argTypes.sortDesc,
        pageStart: argTypes.pageStart,
        pageLimit: argTypes.pageLimit,
        searchText: argTypes.searchText,
        onFetch: argTypes.onFetch,
        onSelect: argTypes.onSelect,
        onExport: argTypes.onExport,
        onClickSettings: argTypes.onClickSettings,
        onClickRow: argTypes.onClickRow,
    };
};
