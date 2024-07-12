import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import { I18nConnector } from '@/translations';

import mock from '@/data-display/dynamic/dynamic-layout/mock';

import { getDynamicLayoutArgTypes } from './story-helper';

import PDynamicLayout from './PDynamicLayout.vue';

type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/0. Playground',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutArgTypes(),
        // 'item-content': { table: { disable: true } },
    },
    args: {
        name: 'Base Information',
        options: mock.item.options,
        data: mock.item.data,
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
        sortBy: false,
        sortDesc: undefined,
        pageStart: undefined,
        pageLimit: undefined,
        searchText: ''
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
            <p-dynamic-layout :name="name" :type="type"
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
                                    valueHandlerMap,
                                    language,
                                    popupVisible
                                }"
                                :fetch-options="{
                                    sortBy,
                                    sortDesc,
                                    pageStart,
                                    pageLimit,
                                    queryTags,
                                    searchText
                                }"
                                class="w-full"
                                @fetch="onFetch"
                                @select="onSelect"
                                @export="onExport"
                                @click-settings="onClickSettings"
                                @click-row="onClickRow"
                                @update-popup-visible="onUpdatePopupVisible"
            >
            </p-dynamic-layout>
        `,
    }),
};

export const Playground: Story = {
    ...Template
}