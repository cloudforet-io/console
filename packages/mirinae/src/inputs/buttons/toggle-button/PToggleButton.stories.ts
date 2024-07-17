import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getToggleButtonArgs, getToggleButtonParameters, getToggleButtonArgTypes } from '@/inputs/buttons/toggle-button/story-helper';

import PToggleButton from './PToggleButton.vue';

type PToggleButtonPropsAndCustomArgs = ComponentProps<typeof PToggleButton>;

const meta : Meta<PToggleButtonPropsAndCustomArgs> = {
    title: 'Inputs/Buttons/Toggle Button',
    component: PToggleButton,
    argTypes: {
        ...getToggleButtonArgTypes(),
    },
    parameters: {
        ...getToggleButtonParameters(),
    },
    args: {
        ...getToggleButtonArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PToggleButton>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PToggleButton },
        template: `
            <div class="flex items-center justify-center">
                <p-toggle-button
                    :value="value"
                    :style-type="styleType"
                    :disabled="disabled"
                    :show-state-text="showStateText"
                    :true-state-text="trueStateText"
                    :false-state-text="falseStateText"
                    :read-only="readOnly"
                    :spacing="spacing"
                    :position="position"
                />
            </div>
        `,
    }),
};

export const ToggleButtonBasic: Story = {
    render: () => ({
        components: { PToggleButton },
        template: `
            <div class="flex items-center justify-center">
                <p-toggle-button
                    :value="true"
                    class="mr-8"
                />
            </div>
        `,
    }),
};

export const ShowTextNexttoToggleButton: Story = {
    render: () => ({
        components: { PToggleButton },
        template: `
            <div class="flex items-center justify-center">
                <p-toggle-button
                    :value="true"
                    show-state-text
                    class="mr-8"
                />
            </div>
        `,
    }),
};

export const ToggleButtonStateTextPosition: Story = {
    render: () => ({
        components: { PToggleButton },
        template: `
            <div class="flex flex-col gap-4 items-center justify-center">
                <p-toggle-button
                    :value="true"
                    show-state-text
                    class="mr-8"
                />
                <p-toggle-button
                    :value="true"
                    show-state-text
                    position="left"
                    class="mr-8"
                />
            </div>
        `,
    }),
};


export const ToggleButtonSpacing: Story = {
    render: () => ({
        components: { PToggleButton },
        template: `
            <div class="flex flex-col gap-4 items-center justify-center">
                <p-toggle-button
                    :value="true"
                    show-state-text
                    spacing="sm"
                    class="mr-8"
                />
                <p-toggle-button
                    :value="true"
                    show-state-text
                    spacing="md"
                    class="mr-8"
                />
                <p-toggle-button
                    :value="true"
                    show-state-text
                    spacing="space-between"
                    class="w-1/6"
                />
            </div>
        `,
    }),
};

export const ToggleButtonDisabeld: Story = {
    render: () => ({
        components: { PToggleButton },
        template: `
            <div class="flex flex-col items-center gap-6">
                <div class="flex">
                    <p-toggle-button
                        class="mr-8"
                        :value="false"
                        :disabled="true"
                    />
                    <p-toggle-button
                        show-state-text
                        :value="false"
                        :disabled="true"
                    />
                </div>
                <div class="flex">
                    <p-toggle-button
                        class="mr-8"
                        :value="true"
                        :disabled="true"
                    />
                    <p-toggle-button
                        show-state-text
                        :value="true"
                        :disabled="true"
                    />
                </div>
            </div>
        `,
    }),
};

export const ToggleButtonReadOnly: Story = {
    render: () => ({
        components: { PToggleButton },
        template: `
            <div class="flex flex-col items-center gap-6">
                <div class="flex">
                    <p-toggle-button
                        show-state-text
                        :value="false"
                        read-only
                    />
                </div>
                <div class="flex">
                    <p-toggle-button
                        show-state-text
                        :value="true"
                        read-only
                    />
                </div>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
