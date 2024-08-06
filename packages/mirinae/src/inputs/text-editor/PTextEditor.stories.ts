import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/inputs/buttons/button/PButton.vue';
import { getJsonObject } from '@/inputs/text-editor/mock';
import {
    getTextEditorArgs, getTextEditorParameters, getTextEditorArgTypes, sampleCode,
} from '@/inputs/text-editor/story-helper';

import PTextEditor from './PTextEditor.vue';

type PTextEditorPropsAndCustomArgs = ComponentProps<typeof PTextEditor>;

const meta : Meta<PTextEditorPropsAndCustomArgs> = {
    title: 'Inputs/Text Editor',
    component: PTextEditor,
    argTypes: {
        ...getTextEditorArgTypes(),
    },
    parameters: {
        ...getTextEditorParameters(),
    },
    args: {
        ...getTextEditorArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTextEditor>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTextEditor },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-text-editor :code="code"
                    :folded="folded"
                    :read-only="readOnly" :loading="loading"
                    :highlight-lines="highlightLines"
                    :disable-auto-reformat="disableAutoReformat"
                />
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PTextEditor },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-text-editor :code="sampleCode" folded />
            </div>
        `,
        setup() {
            const state = reactive({
                sampleCode,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Loading: Story = {
    render: () => ({
        components: { PTextEditor, PButton },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-text-editor :loading="loading" :code="sampleCode" folded />
                <p-button class="mt-4" @click="changeCode">Load Code!</p-button>
            </div>
        `,
        setup() {
            const state = reactive({
                sampleCode: undefined,
                loading: false,
            });
            const changeCode = async () => {
                state.loading = true;
                state.sampleCode = await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(getJsonObject());
                    }, 1500);
                });
                state.loading = false;
            };
            return {
                ...toRefs(state),
                changeCode,
            };
        },
    }),
};

export const HighlightLines: Story = {
    render: () => ({
        components: { PTextEditor },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-text-editor :code="sampleCode" folded :highlight-lines="[2,3,4]" />
            </div>
        `,
        setup() {
            const state = reactive({
                sampleCode: getJsonObject(),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const ChangeCode: Story = {
    render: () => ({
        components: { PTextEditor },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-text-editor :code="sampleCode" folded />
                <button @click="handleChangeCode">Change Code!</button>
            </div>
        `,
        setup() {
            const state = reactive({
                sampleCode: getJsonObject(),
            });
            const handleChangeCode = () => {
                state.sampleCode = JSON.stringify(getJsonObject(), null, 2);
            };
            return {
                ...toRefs(state),
                handleChangeCode,
            };
        },
    }),
};

export const AutoReformatonCodeChangeStringOnly: Story = {
    render: () => ({
        components: { PTextEditor, PButton },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-text-editor :code="sampleCode" folded :disable-auto-reformat="disableAutoReformat" class="mb-4" />
                <p-button @click="handleChangeCode(false)">Change Code & Reformat (default)</p-button>
                <p-button style-type="highlight" @click="handleChangeCode(true)">Change Code & Do not Reformat Automatically</p-button>
            <p class="text-red-600 font-bold mt-4">This feature works only when the code prop's type is string</p>
            </div>
            <!--<div>-->
        `,
        setup() {
            const state = reactive({
                sampleCode,
                disableAutoReformat: false,
            });
            const handleChangeCode = (disableAutoReformat) => {
                state.disableAutoReformat = disableAutoReformat;
                state.sampleCode = JSON.stringify(getJsonObject(), null, 0);
            };
            return {
                ...toRefs(state),
                handleChangeCode,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
