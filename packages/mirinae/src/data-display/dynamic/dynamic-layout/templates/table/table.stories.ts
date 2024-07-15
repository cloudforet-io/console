import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';


import mock from '@/data-display/dynamic/dynamic-layout/mock';
import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getDynamicLayoutTableArgTypes } from '@/data-display/dynamic/dynamic-layout/templates/table/story-helper';
import { I18nConnector } from '@/translations';

type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/- [Table] Table',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutTableArgTypes(),
        type: { table: { disable: true } },
        fetchOptions: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        fieldHandler: { table: { disable: true } },
        slot: { table: { disable: true } },
    },
    args: {
        name: 'Base Information',
        options: mock.table.options,
        data: mock.table.data,
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
        sortBy: undefined,
        sortDesc: undefined,
        pageStart: undefined,
        pageLimit: undefined,
        searchText: '',
    },
};

export default meta;
type Story = StoryObj<typeof PDynamicLayout>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDynamicLayout },
        i18n: I18nConnector.i18n,
        template: `
            <p-dynamic-layout :name="name" type="table"
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
                                }"
                                :fetch-options="{
                                    sortBy,
                                    sortDesc,
                                    pageStart,
                                    pageLimit,
                                    searchText
                                }"
                                class="w-full"
                                @fetch="onFetch"
                                @select="onSelect"
                                @export="onExport"
                                @click-settings="onClickSettings"
                                @click-row="onClickRow"
                >
            </p-dynamic-layout>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
