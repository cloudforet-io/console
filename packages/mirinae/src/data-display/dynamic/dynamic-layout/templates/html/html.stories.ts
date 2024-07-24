import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getDynamicLayoutHtmlArgTypes, getDynamicLayoutHtmlArgs } from '@/data-display/dynamic/dynamic-layout/templates/html/story-helper';
import { I18nConnector } from '@/translations';

type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/- Html',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutHtmlArgTypes(),
    },
    args: {
        ...getDynamicLayoutHtmlArgs(),
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
            <p-dynamic-layout :name="name" type="html"
                                :options="options"
                                :data="data"
                                :type-options="{
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
    args: {
        type: 'html',
        data: mock.html.data,
        options: mock.html.options,
    },
    argTypes: {
        data: {
            name: 'data',
            type: { name: 'string' },
            control: 'text',
        },
    },
};
