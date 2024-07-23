import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getCenteredLayoutArgs, getCenteredLayoutParameters, getCenteredLayoutArgTypes } from '@/layouts/centered-layout/story-helper';

import PCenteredLayout from './PCenteredLayout.vue';

type PCenteredLayoutPropsAndCustomArgs = ComponentProps<typeof PCenteredLayout>;

const meta : Meta<PCenteredLayoutPropsAndCustomArgs> = {
    title: 'Layouts/Centered Layout',
    component: PCenteredLayout,
    argTypes: {
        ...getCenteredLayoutArgTypes(),
    },
    parameters: {
        ...getCenteredLayoutParameters(),
    },
    args: {
        ...getCenteredLayoutArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PCenteredLayout>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: {
            PCenteredLayout,
        },
        template: `
            <div class="w-full h-full fixed">
                <p-centered-layout>
                    <template>
                        <div class="flex justify-center items-center font-bold text-lg">
                            <div v-html="defaultSlot"></div>
                        </div>
                    </template>
                </p-centered-layout>
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: {
            PCenteredLayout,
        },
        template: `
            <div class="w-full h-full fixed">
                <p-centered-layout>
                    <template>
                        <div class="font-bold text-lg" style="width: 300px;">
                            {{ faker.lorem.paragraph(100) }}
                        </div>
                    </template>
                </p-centered-layout>
            </div>
        `,
        setup() {
            return {
                faker,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 500px;" />',
    })],
};

export const WithTopContentsSlot: Story = {
    render: () => ({
        components: { PCenteredLayout },
        template: `
            <div class="w-full h-full fixed">
                <p-centered-layout>
                    <template #top-contents>
                        <img src="images/SpaceONE_logoTypeA.svg">
                    </template>
                    <template>
                        <div class="flex justify-center items-center font-bold text-lg">
                            <span>This is contents</span>
                        </div>
                    </template>
                </p-centered-layout>
            </div>
        `,
    }),
    decorators: [() => ({
        template: '<story style="height: 500px;" />',
    })],
};

export const Playground: Story = {
    ...Template,
    decorators: [() => ({
        template: '<story style="height: 500px;" />',
    })],
};
