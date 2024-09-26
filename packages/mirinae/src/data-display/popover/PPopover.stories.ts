import { reactive, toRefs, watch } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '../../inputs/buttons/button/PButton.vue';
import PTextInput from '../../inputs/input/text-input/PTextInput.vue';
import PPopover from './PPopover.vue';
import { getPopoverArgs, getPopoverParameters, getPopoverArgTypes } from './story-helper';



type PPopoverPropsAndCustomArgs = ComponentProps<typeof PPopover>;

const meta : Meta<PPopoverPropsAndCustomArgs> = {
    title: 'Data Display/Popover',
    component: PPopover,
    argTypes: {
        ...getPopoverArgTypes(),
    },
    parameters: {
        ...getPopoverParameters(),
    },
    args: {
        ...getPopoverArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PPopover>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PPopover, PButton },
        template: `
            <div class="w-full overflow p-8 flex justify-center items-center story-container" style="height: 250px;">
                <p-popover :position="proxyPosition"
                           :isVisible.sync="proxyIsVisible"
                           :tag="tag"
                           :ignore-target-click="ignoreTargetClick"
                           :trigger="trigger"
                           :ignore-outside-click="ignoreOutsideClick"
                           :hide-padding="hidePadding"
                           :hide-close-button="hideCloseButton"
                           :hide-arrow="hideArrow"
                           :width="width"
                >
                    <div v-if="defaultSlot" v-html="defaultSlot" />
                    <p-button v-else @click="handleClick">default</p-button>
                    <template #content>
                        <div v-if="contentRefSlot" v-html="contentRefSlot" />
                        <div v-else>
                            <p>content: {{defaultContentValue}}</p>
                        </div>
                    </template>
                </p-popover>
            </div>
        `,
        setup(props) {
            const state = reactive({
                proxyPosition: props.position,
                proxyIsVisible: props.isVisible,
                defaultContentValue: faker.lorem.sentence(10),
            });

            watch(() => props.isVisible, (newVal) => {
                state.proxyIsVisible = newVal;
            });

            watch(() => props.position, (newVal) => {
                state.proxyPosition = newVal;
            });

            const handleClick = () => {
                /* eslint-disable no-alert */
                alert('default slot clicked');
            };
            return {
                ...toRefs(state),
                handleClick,
            };
        },
    }),
};

export const BasicPopover: Story = {
    render: () => ({
        components: { PPopover, PTextInput, PButton },
        template: `
            <div class="w-full overflow p-8 flex flex-col justify-center" style="height: 500px;">
                <b>click (default)</b>
                <br/>
                <p-popover>
                    <p-button>default</p-button>
                    <template #content>
                        <p>content slot</p>
                    </template>
                </p-popover>
                <br/>
                <br/>
                <b>hover</b>
                <br/>
                <p-popover trigger="hover">
                    <p-button>default</p-button>
                    <template #content>
                        <p>content slot</p>
                    </template>
                </p-popover>
                <br/>
                <br/>
                <b>focus</b>
                <br/>
                <p-popover trigger="focus">
                    <input placeholder="This is basic input"/>
                    <template #content>
                        <p>content slot</p>
                    </template>
                </p-popover>
                <br/>
                <br/>
                <b>focus - binding isVisible</b>
                <br/>
                <p-popover trigger="focus" :is-visible="isFocused">
                    <p-text-input style-type="primary" :outline="true"
                                  placeholder="This is PTextInput Component"
                                  :is-focused.sync="isFocused"
                    />
                    <template #content>
                        <p>content slot</p>
                    </template>
                </p-popover>
            </div>
        `,
        setup() {
            const state = reactive({
                isFocused: false,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const IgnoreOutsideClick: Story = {
    render: () => ({
        components: { PPopover, PTextInput, PButton },
        template: `
            <div class="w-full overflow p-8 flex flex-col gap-4" style="height: 300px;">
                <p-popover ignore-outside-click>
                    <p-button>click me (ignore outside click)</p-button>
                    <template #content>
                        <p>This popover ignores outside click</p>
                    </template>
                </p-popover>
                <div style="height: 100px;"/>
                <p-popover>
                    <p-button>click me (default)</p-button>
                    <template #content>
                        <p>This popover will be closed when you click outside</p>
                    </template>
                </p-popover>
            </div>
        `,
    }),
};

export const HideCloseButton: Story = {
    render: () => ({
        components: { PPopover, PTextInput, PButton },
        template: `
            <div class="w-full overflow p-8 flex flex-col gap-4" style="height: 300px;">
                <p-popover hide-close-button>
                    <p-button>click me (hide close button)</p-button>
                    <template #content>
                        <p>This popover hides close button</p>
                    </template>
                </p-popover>
            </div>
        `,
    }),
};

export const HidePadding: Story = {
    render: () => ({
        components: { PPopover, PTextInput, PButton },
        template: `
            <div class="w-full overflow p-8 flex flex-col gap-4" style="height: 300px;">
                <p-popover hide-padding hide-close-button>
                    <p-button>click me (hide padding)</p-button>
                    <template #content>
                        <p>This popover hides padding and close button</p>
                    </template>
                </p-popover>
            </div>
        `,
    }),
};

export const HideArrow: Story = {
    render: () => ({
        components: { PPopover, PTextInput, PButton },
        template: `
            <div class="w-full overflow p-8 flex flex-col gap-4" style="height: 300px;">
                <p-popover hide-arrow>
                    <p-button>click me (hide arrow)</p-button>
                    <template #content>
                        <p>This popover hides arrow</p>
                    </template>
                </p-popover>
            </div>
        `,
    }),
};

export const Width: Story = {
    render: () => ({
        components: { PPopover, PButton },
        template: `
            <div class="w-full overflow p-8 flex flex-col gap-4" style="height: 300px;">
                <div class="border border-blue-500 w-full relative p-4 popover-story-container">
                    <p class="text-2xl my-4">The div(blue bordered) which contains all these contents has <strong>relative</strong> position.</p>
                    <p-popover width="100%">
                        <p-button>click me</p-button>
                        <template #content>
                            <div>
                                <p>This popover has width 100%</p>
                                <p>Which means it will be the same width as the blue bordered div</p>
                            </div>
                        </template>
                    </p-popover>
                </div>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
