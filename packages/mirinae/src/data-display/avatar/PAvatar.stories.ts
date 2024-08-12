import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getAvatarArgTypes, getAvatarParameters, getAvatarArgs } from '@/data-display/avatar/story-helper';
import { AVATAR_SIZE, AVATAR_COLOR } from '@/data-display/avatar/type';

import PAvatar from './PAvatar.vue';

type PAvatarPropsAndCustomArgs = ComponentProps<typeof PAvatar>;

const meta : Meta<PAvatarPropsAndCustomArgs> = {
    title: 'Data Display/Avatar',
    component: PAvatar,
    argTypes: {
        ...getAvatarArgTypes(),
    },
    parameters: {
        ...getAvatarParameters(),
    },
    args: {
        ...getAvatarArgs(),
    },
};


export default meta;
type Story = StoryObj<typeof PAvatar>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PAvatar },
        template: `
            <div class="flex justify-center">
                <p-avatar
                    :icon="icon"
                    :color="color"
                    :size="size"
                    :imgSrc="imgSrc"
                >{{$props.default}}</p-avatar>
            </div>
        `,
    }),
};

export const Size: Story = {
    render: () => ({
        components: { PAvatar },
        setup() {
            return {
                sizes: Object.values(AVATAR_SIZE),
            };
        },
        template: `
            <div class="w-full h-full flex justify-center items-center gap-x-8">
                <p-avatar
                    v-for="size in sizes"
                    :key="\`sizes-\${size}\`"
                    :size="size"
                />
            </div>`,
    }),
};

export const Color: Story = {
    render: () => ({
        components: { PAvatar },
        setup() {
            return {
                colors: Object.keys(AVATAR_COLOR),
            };
        },
        template: `
            <div class="w-full h-full flex justify-center items-center gap-x-8">
                <p-avatar
                    v-for="color in colors"
                    :key="\`colors-\${color}\`"
                    :color="color"
                />
            </div>`,
    }),
};

export const Playground: Story = {
    ...Template,
};
