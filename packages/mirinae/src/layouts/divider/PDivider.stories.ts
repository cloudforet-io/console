import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getDividerArgTypes, getDividerArgs, getDividerParameters } from '@/layouts/divider/story-helper';


import PDivider from './PDivider.vue';

type PDividerPropsAndCustomArgs = ComponentProps<typeof PDivider>;

const meta : Meta<PDividerPropsAndCustomArgs> = {
    title: 'Layouts/Divider',
    component: PDivider,
    argTypes: {
        ...getDividerArgTypes(),
    },
    parameters: {
        ...getDividerParameters(),
    },
    args: {
        ...getDividerArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PDivider>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDivider },
        template: `
            <div style="width: 50vw; height: 50vh; border: 1px dashed #415ee1">
                <h1>The hr tags defines a thematic horizontal break in an HTML page</h1>
                <p-divider :vertical="vertical" />
                <div class="grid grid-cols-2">
                    <div class="col-span-1">
                        <p>split</p>
                        <p-divider :vertical="vertical" style="margin-top:8px; margin-bottom:8px"/>
                        <p>split</p>
                    </div>
                    <div class="col-span-1">
                        <p>split</p>
                        <p-divider :vertical="vertical" style="margin-top:8px; margin-bottom:8px"/>
                        <p>split</p>
                    </div>
                </div>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
