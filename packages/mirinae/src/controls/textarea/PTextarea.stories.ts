import { reactive, toRefs, computed } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';


import PSelectDropdown from '@/controls/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/controls/forms/field-group/PFieldGroup.vue';
import { getTextareaArgs, getTextareaParameters, getTextareaArgTypes } from '@/controls/textarea/story-helper';
import { useProxyValue } from '@/hooks';

import PTextarea from './PTextarea.vue';

type PTextareaPropsAndCustomArgs = ComponentProps<typeof PTextarea>;

const meta : Meta<PTextareaPropsAndCustomArgs> = {
    title: 'Controls/Textarea',
    component: PTextarea,
    argTypes: {
        ...getTextareaArgTypes(),
    },
    parameters: {
        ...getTextareaParameters(),
    },
    args: {
        ...getTextareaArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTextarea>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTextarea },
        template: `
        <div class="h-full w-full overflow p-8">
            <p-textarea
                v-model="value"
                :placeholder="placeholder"
                :autofocus="autofocus"
                :readonly="readonly"
                :disabled="disabled"
                :invalid="invalid"
                :resize="resize"
            />
        </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyValue: useProxyValue('value', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PTextarea },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-textarea :value="value" placeholder="placeholder" />
            </div>
        `,
        setup() {
            const state = reactive({
                value: faker.lorem.sentence(30),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Placeholder: Story = {
    render: () => ({
        components: { PTextarea },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-textarea :value="value" placeholder="placeholder" />
            </div>
        `,
        setup() {
            const state = reactive({
                value: '',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Disabled: Story = {
    render: () => ({
        components: { PTextarea },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-textarea :value="value" disabled />
            </div>
        `,
        setup() {
            const state = reactive({
                value: faker.lorem.sentence(30),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Readonly: Story = {
    render: () => ({
        components: { PTextarea },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-textarea :value="value" readonly />
            </div>
        `,
        setup() {
            const state = reactive({
                value: faker.lorem.sentence(30),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Invalid: Story = {
    render: () => ({
        components: { PTextarea, PFieldGroup },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-field-group
                    label="Invalid style example"
                    help-text="The value must be between 2 and 50 characters."
                    :invalid-text="invalidText"
                >
                    <p-textarea v-model="value" :invalid="!!invalidText" />
                </p-field-group>
            </div>
        `,
        setup() {
            const state = reactive({
                value: '',
                invalidText: computed(() => {
                    if (state.value.length < 2) {
                        return 'The value must be at least 2 characters.';
                    } if (state.value.length > 50) {
                        return 'The value must be within 50 characters.';
                    }
                    return '';
                }),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Resize: Story = {
    render: () => ({
        components: { PTextarea, PSelectDropdown },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-select-dropdown :menu="resizeMenu" 
                                   :selected="selected"
                                   @update:selected="selected = $event"
                />
                <br/>
                <br/>
                <p-textarea :value="value" :resize="selected[0].name" />
            </div>
        `,
        setup() {
            const state = reactive({
                value: faker.lorem.sentence(30),
                resizeMenu: [
                    { name: 'none', label: 'none' },
                    { name: 'both', label: 'both' },
                    { name: 'horizontal', label: 'horizontal' },
                    { name: 'vertical', label: 'vertical' },
                    { name: 'block', label: 'block' },
                    { name: 'inline', label: 'inline' },
                ],
                selected: [{ name: 'block', label: 'block' }],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
