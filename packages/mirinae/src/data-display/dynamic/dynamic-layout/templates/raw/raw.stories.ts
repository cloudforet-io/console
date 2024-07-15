import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';



import mock from '@/data-display/dynamic/dynamic-layout/mock';
import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getDynamicLayoutRawArgTypes } from '@/data-display/dynamic/dynamic-layout/templates/raw/story-helper';
import { I18nConnector } from '@/translations';

type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/- Raw',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutRawArgTypes(),
        type: { table: { disable: true } },
        fetchOptions: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        fieldHandler: { table: { disable: true } },
        slot: { table: { disable: true } },
    },
    args: {
        name: 'Base Information',
        options: mock.list.options,
        data: mock.list.data,
        loading: false,
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
          <p-dynamic-layout :name="name" type="raw"
                              :options="options"
                              :data="data"
                              :type-options="{
                                  loading,
                              }"
                              :fetch-options="{
                              }"
                               class="w-full"
                >
            </p-dynamic-layout>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
