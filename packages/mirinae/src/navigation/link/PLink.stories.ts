import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import {
    getLinkArgs, getLinkParameters, getLinkArgTypes, router,
} from '@/navigation/link/story-helper';


import PLink from './PLink.vue';

type PLinkPropsAndCustomArgs = ComponentProps<typeof PLink>;

const meta : Meta<PLinkPropsAndCustomArgs> = {
    title: 'Navigation/Link',
    component: PLink,
    argTypes: {
        ...getLinkArgTypes(),
    },
    parameters: {
        ...getLinkParameters(),
    },
    args: {
        ...getLinkArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PLink>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PLink },
        router,
        template: `
            <div class="flex justify-center">
                <p-link
                    :text="text"
                    :disabled="disabled"
                    :highlight="highlight"
                    :size="size"
                    :icon-left="iconLeft"
                    :action-icon="actionIcon"
                    :new-tab="newTab"
                    :href="href"
                    :to="to"
                    :line-height="lineHeight"
                >
                    <span v-if="defaultSlot" v-html="defaultSlot"/>
                </p-link>
            </div>
        `,
    }),
};

export const BasicLink: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <div>
                <div class="text-center flex gap-12 mb-6">
                    <p-link href="https://www.google.com" highlight>Link</p-link>
                    <p-link text="Link" href="https://www.google.com" highlight action-icon="internal-link" />
                    <p-link text="Link" href="https://www.google.com" highlight action-icon="internal-link" new-tab />
                    <p-link text="Link" href="https://www.google.com" highlight action-icon="external-link" />
                </div>
                <div class="text-center flex gap-12">
                    <p-link href="https://www.google.com">Link</p-link>
                    <p-link text="Link" href="https://www.google.com" action-icon="internal-link" />
                    <p-link text="Link" href="https://www.google.com" action-icon="internal-link" new-tab />
                    <p-link text="Link" href="https://www.google.com" action-icon="external-link" />
                </div>
            </div>
        `,
    }),
};

export const LinkSize: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <div>
                <div class="text-center flex gap-12 mb-6">
                    <p-link href="https://www.google.com" size="sm" text="sm" />
                    <p-link href="https://www.google.com" size="md" text="md" />
                    <p-link href="https://www.google.com" size="lg" text="lg" />
                </div>
                <div class="text-center flex gap-12">
                    <p-link href="https://www.google.com" action-icon="external-link" size="sm" text="sm" />
                    <p-link href="https://www.google.com" action-icon="external-link" size="md" text="md" />
                    <p-link href="https://www.google.com" action-icon="external-link" size="lg" text="lg" />
                </div>
            </div>
        `,
    }),
};

export const IconLeft: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <div class="grid gap-6">
                <p-link icon-left="ic_service_plugin" href="https://www.google.com" text="icon left" />
            </div>
        `,
    }),
};

export const ActionIcon: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <div>
                <p-link action-icon="none" href="https://www.google.com" text="none" />
                <br/><br/>
                <p-link action-icon="internal-link" href="https://www.google.com" text="internal link" />
                <br/><br/>
                <p-link action-icon="external-link" href="https://www.google.com" text="external link" />
            </div>
        `,
    }),
};

export const NewTab: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <div>
                <p-link action-icon="internal-link" href="https://www.google.com" text="internal link (new tab X)" />
                <br/><br/>
                <p-link action-icon="internal-link" new-tab href="https://www.google.com" text="internal link (new tab O)" />
            </div>
        `,
    }),
};

export const Disabled: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <p-link disabled href="https://www.google.com">This is <strong>disabled</strong> link</p-link>
        `,
    }),
};

export const Highlight: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <p-link highlight href="https://www.google.com">This is <strong>highlighted</strong> link</p-link>
        `,
    }),
};

export const UsingVueRouterLocation: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <p-link :to="{path: ''}" href="https://www.google.com">This is an link <strong>with vue router location</strong></p-link>
        `,
    }),
};

export const UseAnchorScroll: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <div>
                <p-link class='block' highlight href="#first" use-anchor-scroll>First Section</p-link>
                <p-link class='block' highlight href="#second"  use-anchor-scroll>Second Section</p-link>
                <h1 id="first" class="py-8"># First Section</h1>
                <h1 id="second" class="py-8"># Second Section</h1>
            </div>
        `,
    }),
};

export const LineHeight: Story = {
    render: () => ({
        components: { PLink },
        router,
        template: `
            <div>
                <span class="block border border-gray-300 overflow-clip"><p-link href="https://www.google.com">Without line height</p-link></span><br/>
                <span class="border border-gray-300"><p-link line-height="1.5" href="https://www.google.com">With line height 1.5</p-link></span><br/>
                <span class="border border-gray-300"><p-link line-height="2" href="https://www.google.com">With line height 2</p-link></span><br/>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
