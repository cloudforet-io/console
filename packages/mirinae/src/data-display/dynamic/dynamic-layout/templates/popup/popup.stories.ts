import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getDynamicLayoutPopupArgTypes, getDynamicLayoutArgs } from '@/data-display/dynamic/dynamic-layout/templates/popup/story-helper';
import { I18nConnector } from '@/translations';

type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/- Popup',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutPopupArgTypes(),
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
            <p-dynamic-layout :name="name" type="popup"
                                :options="options"
                                :data="data"
                                :type-options="{
                                    popupVisible
                                }"
                                :fetch-options="{
                                }"
                                class="w-full"
            />
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
