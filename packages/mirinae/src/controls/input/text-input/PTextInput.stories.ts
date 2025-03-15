import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import Fuse from 'fuse.js';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import PCodeEditor from '@/controls/code-editor/PCodeEditor.vue';
import PFieldGroup from '@/controls/forms/field-group/PFieldGroup.vue';
import { getTextInputMenu, getTextInputMenuWithMultiTypes } from '@/controls/input/text-input/mock';
import {
    getTextInputArgs,
    getTextInputArgTypes,
    getTextInputParameters,
} from '@/controls/input/text-input/story-helper';
import { INPUT_SIZE } from '@/controls/input/text-input/type';

import PTextInput from './PTextInput.vue';


type PTextInputPropsAndCustomArgs = ComponentProps<typeof PTextInput>;

const meta : Meta<PTextInputPropsAndCustomArgs> = {
    title: 'Controls/Input/Text Input',
    component: PTextInput,
    argTypes: {
        ...getTextInputArgTypes(),
    },
    parameters: {
        ...getTextInputParameters(),
    },
    args: {
        ...getTextInputArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTextInput>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTextInput },
        template: `
            <p-text-input
                        v-bind="inputAttrs"
                        :value="value"
                        :size="size"
                        :type="type"
                        :invalid="invalid"
                        :is-focused="isFocused"
                        :disabled="disabled" :block="block"
                        :menu="menu" :use-fixed-menu-style="useFixedMenuStyle"
                        :loading="loading"
                        :show-password="showPassword"
                        :appearance-type="appearanceType"
                        :page-size="pageSize"
                        :hide-spin-button="hideSpinButton"
            >
                <template v-if="inputRightSlot" #input-right>
                    <span v-html="inputRightSlot"></span>
                </template>
                <template v-if="rightEdgeSlot" #right-edge>
                    <span v-html="rightEdgeSlot"></span>
                </template>
            </p-text-input>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <p-text-input v-model="value" />
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

export const Autocomplete: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <div style="width: 90%">
                <p class="text-label-lg font-bold my-3">With single input</p>
                <p-text-input :menu="menu" :selected.sync="selected" use-auto-complete use-fixed-menu-style />
                <br/>
                <br/>
                <p class="text-label-lg font-bold my-3">With multi input</p>
                <p-text-input :menu="menu" :selected.sync="selected" multi-input use-auto-complete use-fixed-menu-style />
                <br/>
                <br/>
                <div class="flex mt-4">
                    <div class="mr-4 p-4 bg-blue-100 w-full max-h-64 overflow-y-auto">
                        <p class="font-lg font-bold">menu: </p>
                        <pre>{{menu}}</pre>
                    </div>
                    <div class="p-4 bg-blue-200 w-full max-h-64 overflow-y-auto">
                        <p class="font-lg font-bold">selected: </p>
                        <pre>{{selected}}</pre>
                    </div>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                menu: getTextInputMenu(),
                selected: [],
            });
            return toRefs(state);
        },
    }),
};

export const MultiInputDuplicateChecks: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <div style="width: 80%">
                <p-text-input :selected.sync="selected" multi-input use-fixed-menu-style @update="handleUpdate" />
                <div class="flex mt-4">
                    <div class="p-4 w-full max-h-64 overflow-y-auto" :class="isValid ? 'bg-green-200' : 'bg-coral-200'">
                        <p class="font-lg font-bold">isValid: </p>
                        <pre>{{isValid}}</pre>
                    </div>
                    <div class="p-4 bg-blue-200 w-full max-h-64 overflow-y-auto">
                        <p class="font-lg font-bold">selected: </p>
                        <pre>{{selected}}</pre>
                    </div>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                selected: [{ name: 'a', label: 'A' }, { name: 'b', label: 'B' }, { name: 'a', label: 'A' }, { name: 'bb', label: 'B' }],
                isValid: false,
            });
            const handleUpdate = (_, isValid) => {
                state.isValid = isValid;
            };
            return {
                ...toRefs(state),
                handleUpdate,
            };
        },
    }),
};

export const AutocompletewithPageSize: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">With page size 5</p>
                <p-text-input :menu="menu" :selected.sync="selected" use-auto-complete :page-size="5" use-fixed-menu-style />
                <br/>
                <br/>
                <p class="text-label-lg font-bold my-3">With multi input, page size 5</p>
                <p-text-input :menu="menu" :selected.sync="selected" use-auto-complete multi-input :page-size="5" use-fixed-menu-style />
                <br/>
                <br/>
                <p class="text-label-lg font-bold my-3">With custom handler, page size 5</p>
                <p-text-input :selected.sync="selected" :handler="simpleHandler" use-auto-complete :page-size="5" use-fixed-menu-style />
                <br/>
                <br/>
                <p class="text-label-lg font-bold my-3">With custom handler, multi input, page size 5</p>
                <p-text-input :selected.sync="selected" :handler="simpleHandler" use-auto-complete multi-input :page-size="5" use-fixed-menu-style />
                <br/>
                <br/>
                <div class="p-4 bg-blue-200 w-full max-h-64 overflow-y-auto">
                    <p class="font-lg font-bold">selected: </p>
                    <pre>{{selected}}</pre>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                menu: getTextInputMenu(),
                selected: [],
            });
            const menu = getTextInputMenuWithMultiTypes();
            let allResults = [];
            const simpleHandler = async (inputText) => {
                allResults = await new Promise((resolve) => {
                    setTimeout(() => {
                        let filtered;
                        const trimmed = inputText.trim();
                        if (trimmed) {
                            filtered = new Fuse(menu, {
                                keys: ['label'],
                                distance: 100,
                                threshold: 0.1,
                                ignoreLocation: true,
                            }).search(trimmed);
                        } else {
                            filtered = [...menu];
                        }
                        resolve(filtered);
                    }, 500);
                });
                const results = allResults.slice(0, 5);
                return { results, more: allResults.length > results.length };
            };
            return {
                ...toRefs(state),
                simpleHandler,
            };
        },
    }),
};

export const Placeholder: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <p-text-input v-model="value" class="test" placeholder="Placeholder" />
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

export const NumberType: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <p-text-input v-model="value" type="number" :min="0" :max="100" />
        `,
        setup() {
            const state = reactive({
                value: 99,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const PasswordType: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">With 'password' input type</p>
                <p-text-input value="password" type="password" />
                <br/>
                <p class="text-label-lg font-bold my-3">With 'password' input type, with 'masking' appearance type</p>
                <p-text-input value="password" type="password" appearance-type="masking" />
                <br/>
                <p class="text-label-lg font-bold my-3">With 'password' input type, with 'masking' appearance type, with \`skipMaskToggleTabIndex\` true</p>
                <p-text-input value="password" type="password" appearance-type="masking" skip-mask-toggle-tab-index />
                <br/>
                <p class="text-label-lg font-bold my-3">With 'password' input type, with 'masking' appearance type, with \`showPassword\` false</p>
                <p-text-input value="password" type="password" appearance-type="masking" :show-password="false" />
                <br/>
            </div>
        `,
        setup() {
            const state = reactive({
                value: 'password',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const AppearanceType: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Single input with 'basic', 'badge', 'stack' appearance type</p>
                <p-text-input value="hello" appearance-type="basic" />
                <br/>
                <p class="text-label-lg font-bold my-3">Single input with 'masking' appearance type, 'password' input type</p>
                <p-text-input value="password" appearance-type="masking" type="password" />
                <br/>
                <br/>
                <hr/>
                <br/>
                <p class="text-label-lg font-bold my-3">Multi input with 'badge' appearance type</p>
                <p-text-input :menu="menu" :selected="selected" multi-input use-auto-complete appearance-type="badge" />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi input with 'stack' appearance type</p>
                <p-text-input :menu="menu" :selected="selected" multi-input use-auto-complete appearance-type="stack" />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi input with 'basic', 'masking' appearance type - it doesn't work</p>
                <p-text-input :menu="menu" :selected="selected" multi-input appearance-type="masking" />
                <br/>
            </div>
        `,
        setup() {
            const items = getTextInputMenu();
            const state = reactive({
                menu: items,
                selected: items.slice(0, 3),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Disabled: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <p-text-input v-model="value" disabled />
        `,
        setup() {
            const state = reactive({
                value: 'value',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Readonly: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <div>
                <p class="text-label-lg font-bold my-3">Single input with 'basic', 'badge', 'stack' appearance type</p>
                <p-text-input value="hello" appearance-type="basic" readonly />
                <br/>
                <p class="text-label-lg font-bold my-3">Single input with 'masking' appearance type, 'password' input type</p>
                <p-text-input value="password" appearance-type="masking" type="password" readonly />
                <br/>
                <br/>
                <hr/>
                <br/>
                <p class="text-label-lg font-bold my-3">Multi input with 'badge' appearance type</p>
                <p-text-input :menu="menu" :selected="selected" multi-input use-auto-complete appearance-type="badge" readonly />
                <br/>
                <p class="text-label-lg font-bold my-3">Multi input with 'stack' appearance type</p>
                <p-text-input :menu="menu" :selected="selected" multi-input use-auto-complete appearance-type="stack" readonly />
                <br/>
            </div>
        `,
        setup() {
            const items = getTextInputMenu();
            const state = reactive({
                menu: items,
                selected: items.slice(0, 3),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};


export const BlockAndMultiInput: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <div>
                <p-text-input :selected.sync="entered" block multi-input />
                <p class="my-4 font-lg font-bold">selected: </p>
                <pre>{{entered}}</pre>
            </div>
        `,
        setup() {
            const state = reactive({
                entered: [{
                    value: 'value1',
                    label: 'Value 1',
                }, {
                    value: 'value2',
                    label: 'Value 2',
                    invalid: true,
                }],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Invalid: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <p-text-input v-model="value" invalid />
        `,
        setup() {
            const state = reactive({
                value: 'value',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Form: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <form>
                <p>Save ID/PW to browser and check autocomplete case.</p>
                <br/><br/>
                <p-text-input v-model="id" placeholder="ID" autocomplete="username" />
                <br/><br/>
                <p-text-input v-model="pw" type="password" placeholder="PW" autocomplete="current-password" />
            </form>
        `,
        setup() {
            const state = reactive({
                id: '',
                pw: '',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Slots: Story = {
    render: () => ({
        components: { PTextInput, PButton },
        template: `
            <div>
                <p class="text-lg font-bold mb-4">input-right slot</p>
                <p-text-input type="number" multi-input v-model="value" >
                    <template #input-right>%</template>
                </p-text-input>
                <p class="text-lg font-bold my-4">right-edge slot</p>
                <p-text-input multi-input v-model="value2" >
                    <template #right-edge><p-button size="sm">Click me!</p-button></template>
                </p-text-input>
                <p class="text-lg font-bold my-4">default slot</p>
                <p-text-input multi-input v-model="value2" >
                    <input style="background-color: lavenderblush; padding: 0 0.25rem;" v-model="value3" />
                </p-text-input>
            </div>
            <!-- <div> -->
        `,
        setup() {
            const state = reactive({
                value: 70,
                value2: 'wanzargen',
                value3: 'yuda',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
    args: {
        value: 100,
        inputRightSlot: '%',
    },
};

export const InputAttributes: Story = {
    render: () => ({
        components: {
            PTextInput, PCodeEditor, PButton, PFieldGroup,
        },
        template: `
            <div>
                <p-text-input v-bind="attributes" />
                <p-field-group label="Attributes" class="mt-4" required
                    :invalid="!!errorMessage"
                    :invalid-text="errorMessage"
                >
                    <p-code-editor :code="JSON.stringify(attributes, null, 2)"
                                   @update:code="handleUpdateCode"
                    />
                </p-field-group>
            </div>
        `,
        setup() {
            const state = reactive({
                attributes: { type: 'number', min: 0, max: 10 },
                errorMessage: '',
            });
            const handleUpdateCode = (code) => {
                try {
                    state.attributes = JSON.parse(code);
                    state.errorMessage = '';
                } catch (e) {
                    state.errorMessage = (e as any).message;
                }
            };
            return {
                ...toRefs(state),
                handleUpdateCode,
            };
        },
    }),
};

export const Size: Story = {
    render: () => ({
        components: { PTextInput },
        template: `
            <div  style="display:flex; flex-direction: column; row-gap: 1.5rem;">
                <p-text-input v-for="size in sizes" :key="size" :size="size" v-model="value" :placeholder="size" />
            </div>
        `,
        setup() {
            const state = reactive({
                value: '',
                sizes: Object.values(INPUT_SIZE),
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
