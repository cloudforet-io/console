import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getAllAvailableIcons, getIconDefaultArgs, getIconsArgTypes } from '@/foundation/icons/story-helper';

import PI from './PI.vue';

type PIPropsAndCustomArgs = ComponentProps<typeof PI>;

const meta : Meta<PIPropsAndCustomArgs> = {
    title: 'Foundation/Graphics/Icons',
    component: PI,
    argTypes: {
        ...getIconsArgTypes(),
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A123491',
        },
    },
    args: {
        ...getIconDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PI>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PI },
        template: `
            <p-i v-bind="$props"></p-i>
        `,
    }),
};

export const AllIcons: Story = {
    render: () => ({
        components: { PI },
        template: `
            <div style="width: 100%; padding: 32px; border: 1px solid #eee; display: grid; row-gap: 1rem; column-gap: 1rem;  grid-template-columns: repeat(auto-fill, minmax(200px,1fr));">
                <div v-for="icon in icons" :key="icon" class="flex flex-col items-center p-4 rounded hover:bg-secondary-2">
                    <p-i :name="icon" class="flex-shrink-0"/>
                    <label class="mt-4 whitespace-no-wrap break-words text-xs text-gray-600" >{{icon}}</label>
                </div>
            </div>
        `,
        setup() {
            return {
                icons: getAllAvailableIcons(),
            };
        },
    }),
};

export const Animation: Story = {
    render: () => ({
        components: { PI },
        template: `
            <div style="padding: 32px; border: 1px solid #eee; display: grid; row-gap: 1rem; column-gap: 1rem;  grid-template-columns: repeat(auto-fill, minmax(100px,1fr));">
                <div v-for="icon in icons" :key="icon" class="flex flex-col items-center p-4 rounded hover:bg-secondary-2">
                    <p-i :name="icon" animation="spin" class="flex-shrink-0"/>
                    <label class="mt-4 whitespace-no-wrap break-words text-xs text-gray-600" >{{icon}}</label>
                </div>
            </div>
        `,
        setup() {
            return {
                icons: [
                    'ic_gear-filled',
                    'ic_refresh',
                    'ic_renew',
                ],
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
    args: {
        name: 'root-account',
    },
};
