import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getButtonArgs, getButtonParameters, getButtonArgTypes } from '@/controls/buttons/button/story-helper';
import { BUTTON_STYLE, BUTTON_SIZE } from '@/controls/buttons/button/type';

import PButton from './PButton.vue';

type PButtonPropsAndCustomArgs = ComponentProps<typeof PButton>;

const meta : Meta<PButtonPropsAndCustomArgs> = {
    title: 'Controls/Buttons/Button',
    component: PButton,
    argTypes: {
        ...getButtonArgTypes(),
    },
    parameters: {
        ...getButtonParameters(),
    },
    args: {
        ...getButtonArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PButton>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PButton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; height:150px;">
                <p-button
                    @click="handleClick"
                    :href="href"
                    :styleType="styleType"
                    :size="size"
                    :disabled="disabled"
                    :readonly="readonly"
                    :loading="loading"
                    :block="block"
                    :icon-left="iconLeft"
                    :icon-right="iconRight"
                    :active="active"
                >
                    {{$props.default}}
                </p-button>
            </div>`,
    }),
};

export const Sizes: Story = {
    render: () => ({
        components: { PButton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; margin-top: 50px; background-color: white">
                <p-button v-for="size in buttonSizes" style-type="primary" style="margin-right: 20px" :size="size">
                    <div>{{ size }}</div>
                </p-button>
            </div>`,
        setup() {
            const state = reactive({
                buttonSizes: Object.values(BUTTON_SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 150px;" />',
    })],
};

export const WithIcon: Story = {
    render: () => ({
        components: { PButton },
        template: `
            <div>
                <div style="display:flex; align-items:center; justify-content:center; background-color: white">
                    <p-button v-for="size in buttonSizes" style-type="primary" style="margin-right: 20px" :size="size" icon-left="ic_plus_bold">
                        <div>{{ size }}</div>
                    </p-button>
                </div>
                <div style="display:flex; align-items:center; justify-content:center; margin-top: 50px; background-color: white">
                    <p-button v-for="size in buttonSizes" style-type="primary" style="margin-right: 20px" :size="size" icon-right="ic_plus_bold">
                        <div>{{ size }}</div>
                    </p-button>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                buttonSizes: Object.values(BUTTON_SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 150px;" />',
    })],
};

export const StyleTypes: Story = {
    render: () => ({
        components: { PButton },
        template: `
            <div style="display: flex; flex-direction: column; align-items: center; margin-top: 50px; background-color: white">
                <div style="display:flex">
                    <p-button v-for="styleType in buttonStyles.slice(0, 4)" :style-type="styleType" style="margin-right: 20px">
                        <div>{{ styleType }}</div>
                    </p-button>
                </div>
                <div style="display:flex; margin-top: 20px">
                    <p-button v-for="styleType in buttonStyles.slice(4, 7)" :style-type="styleType" style="margin-right: 20px">
                        <div>{{ styleType }}</div>
                    </p-button>
                </div>
                <div style="display:flex; margin-top: 20px">
                    <p-button v-for="styleType in buttonStyles.slice(7)" :style-type="styleType" style="margin-right: 20px">
                        <div>{{ styleType }}</div>
                    </p-button>
                </div>
            </div>`,
        setup() {
            const state = reactive({
                buttonStyles: Object.values(BUTTON_STYLE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 250px;" />',
    })],
};

export const Disabled: Story = {
    render: () => ({
        components: { PButton },
        template: `
            <div style="display: flex; flex-direction: column; align-items: center; background-color: white">
                <div style="display:flex">
                    <p-button v-for="styleType in buttonStyles.slice(0, 4)" :style-type="styleType" disabled style="margin-right: 20px">
                        <div>{{ styleType }}</div>
                    </p-button>
                </div>
                <div style="display:flex; margin-top: 20px">
                    <p-button v-for="styleType in buttonStyles.slice(4, 7)" :style-type="styleType" disabled style="margin-right: 20px">
                        <div>{{ styleType }}</div>
                    </p-button>
                </div>
                <div style="display:flex; margin-top: 20px">
                    <p-button v-for="styleType in buttonStyles.slice(7)" :style-type="styleType" disabled style="margin-right: 20px">
                        <div>{{ styleType }}</div>
                    </p-button>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                buttonStyles: Object.values(BUTTON_STYLE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 150px;" />',
    })],
};

export const Loading: Story = {
    render: () => ({
        components: { PButton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; margin-top: 50px; background-color: white; gap: 1rem;">
                <p-button
                    styleType="primary"
                    :loading="true"
                >
                    <div class="loading-btn">
                        Loading (primary)
                    </div>
                </p-button>
                <p-button
                    styleType="tertiary"
                    :loading="true"
                >
                    <div class="loading-btn">
                        Loading (tertiary)
                    </div>
                </p-button>
            </div>
        `,
    }),
    decorators: [() => ({
        template: '<story style="height: 150px;" />',
    })],
};

export const Block: Story = {
    render: () => ({
        components: { PButton },
        template: `
            <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 50px; background-color: white">
                <p-button
                    styleType="primary"
                    :block="true"
                >
                    <div>Block</div>
                </p-button>
                <p-button
                    styleType="primary"
                    :block="true"
                    size="lg"
                >
                    <div>Block, size: lg</div>
                </p-button>
                <p-button
                    styleType="primary"
                    :block="true"
                    size="sm"
                >
                    <div>Block, size: sm</div>
                </p-button>
            </div>
        `,
    }),
    decorators: [() => ({
        template: '<story style="height: 200px;" />',
    })],
};

export const Readonly: Story = {
    render: () => ({
        components: { PButton },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; margin-top: 50px; background-color: white">
                <p-button
                    styleType="primary"
                    :readonly="true"
                >
                        Readonly
                </p-button>
                <p-button
                    styleType="secondary"
                    :readonly="true"
                    class="mx-2"
                >
                    Readonly
                </p-button>
            </div>
        `,
    }),
    decorators: [() => ({
        template: '<story style="height: 150px;" />',
    })],
};

export const Active: Story = {
    render: () => ({
        components: { PButton },
        template: `
            <div style="display: flex; flex-direction: column; align-items: center; background-color: white">
                <div style="display:flex">
                    <p-button v-for="styleType in buttonStyles.slice(0, 4)" :style-type="styleType" active style="margin-right: 20px">
                        <div>{{ styleType }}</div>
                    </p-button>
                </div>
                <div style="display:flex; margin-top: 20px">
                    <p-button v-for="styleType in buttonStyles.slice(4, 7)" :style-type="styleType" active style="margin-right: 20px">
                        <div>{{ styleType }}</div>
                    </p-button>
                </div>
                <div style="display:flex; margin-top: 20px">
                    <p-button v-for="styleType in buttonStyles.slice(7)" :style-type="styleType" active style="margin-right: 20px">
                        <div>{{ styleType }}</div>
                    </p-button>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                buttonStyles: Object.values(BUTTON_STYLE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 150px;" />',
    })],
};

export const Playground: Story = {
    ...Template,
    decorators: [() => ({
        template: '<story style="height: 150px;" />',
    })],
};
