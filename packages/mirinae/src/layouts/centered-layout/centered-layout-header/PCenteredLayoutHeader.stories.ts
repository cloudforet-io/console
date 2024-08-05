import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getCenteredLayoutHeaderArgTypes, getCenteredLayoutHeaderParameters, getCenteredLayoutHeaderArgs } from '@/layouts/centered-layout/centered-layout-header/story-helper';


import PCenteredLayoutHeader from './PCenteredLayoutHeader.vue';

type PCenteredLayoutHeaderPropsAndCustomArgs = ComponentProps<typeof PCenteredLayoutHeader>;

const meta : Meta<PCenteredLayoutHeaderPropsAndCustomArgs> = {
    title: 'Layouts/Centered Layout/Centered Layout Header',
    component: PCenteredLayoutHeader,
    argTypes: {
        ...getCenteredLayoutHeaderArgTypes(),
    },
    parameters: {
        ...getCenteredLayoutHeaderParameters(),
    },
    args: {
        ...getCenteredLayoutHeaderArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PCenteredLayoutHeader>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: {
            PCenteredLayoutHeader,
        },
        template: `
        <div>
            <p-centered-layout-header :title="title"
                :description="description"
                :show-step="showStep"
                :current-step="currentStep"
                :total-steps="totalSteps"
                :show-close-button="showCloseButton"
            >
            </p-centered-layout-header>
        </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: {
            PCenteredLayoutHeader,
        },
        template: `
            <div>
                <p-centered-layout-header title="Title" description="Description"
                    :show-step="true"
                    :current-step="1"
                    :total-steps="3"
                    :show-close-button="true"
                >
                </p-centered-layout-header>
            </div>
        `,
    }),
};


export const NoStep: Story = {
    render: () => ({
        components: {
            PCenteredLayoutHeader,
        },
        template: `
            <div>
                <p-centered-layout-header title="Title" description="Description"
                    :show-close-button="true"
                >
                </p-centered-layout-header>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
