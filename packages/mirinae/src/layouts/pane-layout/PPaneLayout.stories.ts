import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PPaneLayout from './PPaneLayout.vue';
import { getPPaneLayoutParameters } from './story-helper';


type PPaneLayoutPropsAndCustomArgs = ComponentProps<typeof PPaneLayout>;

const meta : Meta<PPaneLayoutPropsAndCustomArgs> = {
    title: 'Layouts/Pane Layout',
    component: PPaneLayout,
    parameters: {
        ...getPPaneLayoutParameters(),
    },
};

export default meta;
type Story = StoryObj<typeof PPaneLayout>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PPaneLayout },
        template: `
            <p-pane-layout v-bind="$props" style="height: 100px; width: 200px; display: flex; justify-content: center; align-items: center;">
                <h3 style="">This is default slot</h3>
            </p-pane-layout>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
