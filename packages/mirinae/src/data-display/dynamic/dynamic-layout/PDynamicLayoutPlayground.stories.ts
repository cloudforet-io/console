import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { I18nConnector } from '@/translations';


import PDynamicLayout from './PDynamicLayout.vue';
import { getDynamicLayoutArgTypes, getDynamicLayoutArgs } from './story-helper';


type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/0. Playground',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutArgTypes(),
    },
    args: {
        ...getDynamicLayoutArgs(),
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
    ...Template,
};
