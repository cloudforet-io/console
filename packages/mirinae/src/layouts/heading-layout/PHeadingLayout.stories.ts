import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PHeading from '@/data-display/heading/PHeading.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';

import PHeadingLayout from './PHeadingLayout.vue';
import { getHeadingLayoutArgTypes, getHeadingLayoutArgs, getHeadingLayoutParameters } from './story-helper';

type PHeadingLayoutPropsAndCustomArgs = ComponentProps<typeof PHeadingLayout>;

const meta : Meta<PHeadingLayoutPropsAndCustomArgs> = {
    title: 'Layouts/Heading Layout',
    component: PHeadingLayout,
    argTypes: {
        ...getHeadingLayoutArgTypes(),
    },
    parameters: {
        ...getHeadingLayoutParameters(),
    },
    args: {
        ...getHeadingLayoutArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PHeadingLayout>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PHeadingLayout, PHeading, PButton },
        template: `
            <div style="width: 100%;">
                <p-heading-layout>
                    <template #heading>
                        <p-heading>Heading</p-heading>
                    </template>
                    <template #extra>
                        <p-button>Extra</p-button>
                    </template>
                </p-heading-layout>
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: {
            PHeadingLayout, PHeading, PButton, PSelectDropdown,
        },
        template: `
            <div style="width: 100%;">
                <p class="mt-4 mb-2">width: 100%</p>
                <div style="width: 100%; height: auto; border: 1px dashed grey">
                    <p-heading-layout>
                        <template #heading>
                            <p-heading>Heading</p-heading>
                        </template>
                        <template #extra>
                            <p-button style-type="tertiary">Button</p-button>
                        </template>
                    </p-heading-layout>
                </div>
                <p class="mt-4 mb-2">width: 100%, long text</p>
                <div style="width: 100%; height: auto; border: 1px dashed grey">
                    <p-heading-layout>
                        <template #heading>
                            <p-heading>{{ faker.lorem.paragraph(3) }}</p-heading>
                        </template>
                        <template #extra>
                            <p-button style-type="tertiary">Button</p-button>
                        </template>
                    </p-heading-layout>
                </div>
                <p class="mt-4 mb-2">width: 100%, long text, several elements</p>
                <div style="width: 100%; height: auto; border: 1px dashed grey">
                    <p-heading-layout>
                        <template #heading>
                            <p-heading>{{ faker.lorem.paragraph(3) }}</p-heading>
                        </template>
                        <template #extra>
                            <p-select-dropdown style-type="transparent" />
                            <p-button style-type="tertiary">Button1</p-button>
                            <p-button style-type="secondary">Button2</p-button>
                            <p-select-dropdown style-type="tertiary-icon-button" />
                        </template>
                    </p-heading-layout>
                </div>
                <p class="mt-4 mb-2">width: 400px</p>
                <div style="width: 400px; height: auto; border: 1px dashed grey">
                    <p-heading-layout>
                        <template #heading>
                            <p-heading>Heading</p-heading>
                        </template>
                        <template #extra>
                            <p-button style-type="tertiary">Button</p-button>
                        </template>
                    </p-heading-layout>
                </div>
            </div>
        `,
        setup() {
            return {
                faker,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="width: 100%; height: auto;" />',
    })],
};

export const Playground: Story = {
    ...Template,
};
