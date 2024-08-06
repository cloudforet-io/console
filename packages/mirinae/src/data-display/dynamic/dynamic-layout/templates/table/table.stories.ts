import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getDynamicLayoutTableArgTypes, getDynamicLayoutTableArgs } from '@/data-display/dynamic/dynamic-layout/templates/table/story-helper';
import { I18nConnector } from '@/translations';

type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/- [Table] Table',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutTableArgTypes(),
    },
    args: {
        ...getDynamicLayoutTableArgs(),
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
