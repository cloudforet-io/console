import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import { I18nConnector } from '@/translations';

import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';

import { getDynamicLayoutListArgTypes } from '@/data-display/dynamic/dynamic-layout/templates/list/story-helper';

import mock, { getQueryTags } from '@/data-display/dynamic/dynamic-layout/mock';

type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/- List',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutListArgTypes(),
        // 'item-content': { table: { disable: true } },
    },
    args: {
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
        control: 'object',
        searchText: '',
    }
}

export default meta;
type Story = StoryObj<typeof PDynamicLayout>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDynamicLayout },
        i18n: I18nConnector.i18n,
        template: `
          <p-dynamic-layout :name="name" type="list"
                              :options="options"
                              :data="data"
                              :type-options="{
                                  loading,
                                  totalCount,
                                  timezone,
                                  selectIndex,
                                  selectable,
                                  multiSelect,
                                  invalid,
                                  colCopy,
                                  excelVisible,
                                  settingsVisible,
                                  keyItemSets,
                                  valueHandlerMap
                              }"
                              :fetch-options="{
                                  sortBy,
                                  sortDesc,
                                  pageStart,
                                  pageLimit,
                                  queryTags
                              }"
                               style="max-height: inherit; width: 90%;"
                                @fetch="onFetch"
                                @select="onSelect"
                                @export="onExport"
                                @click-settings="onClickSettings"
                >
            </p-dynamic-layout>
        `,
    }),
};

export const Playground: Story = {
    ...Template
}