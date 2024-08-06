import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PTextInput from '@/inputs/input/text-input/PTextInput.vue';

import PFieldGroup from './PFieldGroup.vue';
import { getPFieldGroupArgs, getPFieldGroupArgTypes, getPFieldGroupParameters } from './story-helper';

type PFieldGroupPropsAndCustomArgs = ComponentProps<typeof PFieldGroup>;

const meta : Meta<PFieldGroupPropsAndCustomArgs> = {
    title: 'Inputs/Forms/Field Group',
    component: PFieldGroup,
    argTypes: {
        ...getPFieldGroupArgTypes(),
    },
    parameters: {
        ...getPFieldGroupParameters(),
    },
    args: {
        ...getPFieldGroupArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PFieldGroup>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PFieldGroup, PTextInput },
        template: `
            <p-field-group :invalid="invalid" :invalid-text="invalidText"
                            :valid="valid" :valid-text="validText"
                            :help-text="helpText" :required="required"
                            :label="label"
                            :style-type="styleType"
            >
                <template v-if="labelSlot" #label>
                    <div v-html="labelSlot"/>
                </template>
                <template v-if="labelExtraSlot" #label-extra>
                    <div v-html="labelExtraSlot"/>
                </template>
                <template v-if="validSlot" #valid>
                    <div v-html="validSlot"/>
                </template>
                <template v-if="invalidSlot" #invalid>
                    <div v-html="invalidSlot"/>
                </template>
                <template v-if="help" #help>
                    <div v-html="help"/>
                </template>
                <template #default="{invalid}">
                    <div v-if="$props.default" v-html="$props.default"/>
                    <p-text-input v-else placeholder="Input" :invalid="invalid" v-model="value"/>
                </template>
            </p-field-group>
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

export const Invalid: Story = {
    render: () => ({
        components: { PFieldGroup, PTextInput },
        template: `
            <p-field-group label="Name" invalid invalid-text="name is required field.">
                <template #default="{invalid}">
                    <p-text-input placeholder="Name" :invalid="invalid" value=""/>
                </template>
            </p-field-group>
        `,
    }),
};

export const Valid: Story = {
    render: () => ({
        components: { PFieldGroup, PTextInput },
        template: `
            <p-field-group label="Name" valid valid-text="this is an appropriate name.">
                <template #default="{valid}">
                    <p-text-input placeholder="Name" :valid="valid" value="Wanjin"/>
                </template>
            </p-field-group>
        `,
    }),
};

export const Required: Story = {
    render: () => ({
        components: { PFieldGroup, PTextInput },
        template: `
            <p-field-group label="Name" required>
                <p-text-input value="Wanjin"/>
            </p-field-group>
        `,
    }),
};

export const HelpText: Story = {
    render: () => ({
        components: { PFieldGroup, PTextInput },
        template: `
            <p-field-group label="Name" help-text="Please enter 3 or more and 10 or less alphabets.">
                <p-text-input value="Wanjin"/>
            </p-field-group>
        `,
    }),
};

export const StyleType: Story = {
    render: () => ({
        components: { PFieldGroup, PTextInput },
        template: `
            <div>
                <p-field-group label="Primary" style-type="primary">
                    <p-text-input value="Wanjin"/>
                </p-field-group>
                <p-field-group label="Secondary" style-type="secondary">
                    <p-text-input value="Wanjin"/>
                </p-field-group>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
