/* eslint-disable import/order */
/* eslint-disable linebreak-style */
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import {
    toRefs, reactive, watch,
} from 'vue';
import { I18nConnector, supportLanguages } from '@/translations';
import PJsonSchemaForm from '@/inputs/forms/json-schema-form/PJsonSchemaForm.vue';

import PButton from '@/inputs/buttons/button/PButton.vue';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';
import PHeading from '@/data-display/heading/PHeading.vue';
import { getJsonSchemaFormArgTypes, getJsonSchemaFormArgs, getJsonSchemaFormParameters } from '@/inputs/forms/json-schema-form/story-helper';
import {
    getDefaultFormData, getDefaultSchema, getJsonInputSchema, getReferenceHandler,
} from '@/inputs/forms/json-schema-form/mock';

import { VALIDATION_MODES } from '@/inputs/forms/json-schema-form/type';
import PTextEditor from '@/inputs/text-editor/PTextEditor.vue';
import {
    getSelectDropdownMenuWithMultiTypes,
} from '@/inputs/dropdown/select-dropdown/mock';
import Fuse from 'fuse.js';

type PJsonSchemaFormPropsAndCustomArgs = ComponentProps<typeof PJsonSchemaForm>;

const meta : Meta<PJsonSchemaFormPropsAndCustomArgs> = {
    title: 'Inputs/Forms/Json Schema Form',
    component: PJsonSchemaForm,
    argTypes: {
        ...getJsonSchemaFormArgTypes(),
    },
    parameters: {
        ...getJsonSchemaFormParameters(),
    },
    args: {
        ...getJsonSchemaFormArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PJsonSchemaForm>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PJsonSchemaForm },
        template: `
            <p-json-schema-form
                :schema="schema"
                :form-data.sync="proxyFormData"
                :language="$i18n.locale"
                :validation-mode="validationMode"
                :reset-on-schema-change="resetOnSchemaChange"
                :custom-error-map="customErrorMap"
                :reference-handler="simpleHandler"
                :use-fixed-menu-style="useFixedMenuStyle"
                :uniform-width="uniformWidth"
            />
        `,
        setup(props) {
            const state = reactive({
                proxyFormData: props.formData,
            });
            const menu = getSelectDropdownMenuWithMultiTypes();
            let allResults = [];
            const simpleHandler = async (inputText) => {
                state.loading = true;
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
                state.loading = false;
                const results = allResults.slice(0, 5);
                return { results, more: allResults.length > results.length };
            };
            watch(() => props.formData, (formData) => {
                state.proxyFormData = formData;
            });
            return {
                ...toRefs(state),
                simpleHandler,
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PJsonSchemaForm, PTextEditor, PHeading },
        i18n: I18nConnector.i18n,
        template: `
            <div class="flex gap-4">
            <div class="bg-blue-100 p-4">
                <p-heading>Json Schema Form</p-heading>
                <p-json-schema-form :schema="schema"
                                    :form-data.sync="formData"
                                    :language="$i18n.locale"
                                    :reference-handler="handler"
                />
            </div>
            <div class="bg-coral-100 p-4">
                <p-heading>Schema</p-heading>
                <p-text-editor :code="JSON.stringify(schema, null, 2)"
                               mode="readOnly"
                               folded
                               style="height: auto"
                />
                <p-heading>Form Data</p-heading>
                <p-text-editor :code="JSON.stringify(formData, null, 2)"
                               mode="readOnly"
                               style="height: auto"
                />
            </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                schema: getDefaultSchema(),
                formData: {},
                handler: getReferenceHandler(),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Language: Story = {
    render: () => ({
        components: { PJsonSchemaForm, PTextEditor, PSelectDropdown },
        template: `
            <div class="flex gap-4">
            <p-json-schema-form
                :schema="schema"
                :form-data="formData"
                :language="language"
            />
            <div>
                <p-select-dropdown class="mb-4"
                                   :selected="language"
                                   :menu="languages"
                />
                <p-text-editor :code="JSON.stringify(schema, null, 2)"
                               mode="readOnly"
                               folded
                />
            </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                schema: getDefaultSchema(),
                formData: getDefaultFormData(),
                language: 'en',
                languages: supportLanguages.map((d) => ({ name: d, label: d })),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const ResetonSchemaChange: Story = {
    render: () => ({
        components: { PJsonSchemaForm, PTextEditor, PButton },
        i18n: I18nConnector.i18n,
        template: `
            <div class="flex gap-4">
            <p-json-schema-form
                :schema="schema"
                :form-data="formData"
                :language="$i18n.locale"
            />
            <div>
                <p-button class="mb-4"
                          @click="resetSchema">Reset Schema</p-button>
                <p-button style-type="highlight"
                          class="mb-4"
                          @click="changeFormData">Change Form Data</p-button>
                <p-text-editor :code="JSON.stringify(schema, null, 2)"
                               mode="readOnly"
                               folded
                />
            </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                schema: getDefaultSchema(),
                formData: {},
            });
            const resetSchema = () => {
                state.schema = getDefaultSchema();
            };
            const changeFormData = () => {
                state.formData = getDefaultFormData();
            };
            return {
                ...toRefs(state),
                resetSchema,
                changeFormData,
            };
        },
    }),
};

export const ValidationMode: Story = {
    render: () => ({
        components: {
            PJsonSchemaForm, PTextEditor, PSelectDropdown, PHeading,
        },
        i18n: I18nConnector.i18n,
        template: `
            <div class="flex gap-4">
            <p-json-schema-form
                :schema="schema"
                :form-data.sync="formData"
                :validation-mode="validationMode"
                :language="$i18n.locale"
            />
            <div>
                <span class="font-lg font-bold mb-2">Validation Mode: </span>
                <p-select-dropdown class="mb-4"
                                   :selected="validationMode" :menu="validationModes" />
                <p-heading>Schema</p-heading>
                <p-text-editor :code="JSON.stringify(schema, null, 2)"
                               mode="readOnly"
                               folded
                />
                <p-heading>Form Data</p-heading>
                <p-text-editor :code="JSON.stringify(formData, null, 2)"
                               mode="readOnly"
                               style="height: auto"
                />
            </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                schema: getDefaultSchema(),
                formData: {},
                validationModes: VALIDATION_MODES.map((d) => ({ name: d, label: d })),
                validationMode: VALIDATION_MODES[0],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const JsonInputMode: Story = {
    render: () => ({
        components: { PJsonSchemaForm, PTextEditor, PHeading },
        i18n: I18nConnector.i18n,
        template: `
            <div class="grid gap-4 grid-cols-12">
            <div class="col-span-6 bg-blue-100 p-4">
                <p-heading>Json Schema Form</p-heading>
                <p-json-schema-form :schema="schema"
                                    :form-data.sync="formData"
                                    :language="$i18n.locale"
                />
            </div>
            <div class="col-span-6 bg-coral-100 p-4">
                <p-heading>Schema</p-heading>
                <p-text-editor :code="JSON.stringify(schema, null, 2)"
                               mode="readOnly"
                               folded
                               style="height: auto"
                />
                <p-heading>Form Data</p-heading>
                <p-text-editor :code="JSON.stringify(formData, null, 2)"
                               mode="readOnly"
                               style="height: auto"
                />
            </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                schema: getJsonInputSchema(),
                formData: {},
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const UniformWidth: Story = {
    render: () => ({
        components: { PJsonSchemaForm, PTextEditor, PHeading },
        i18n: I18nConnector.i18n,
        template: `
            <div class="flex gap-4">
            <div class="bg-blue-100 p-4">
                <p-heading>Json Schema Form</p-heading>
                <p-json-schema-form :schema="schema"
                                    :form-data.sync="formData"
                                    :language="$i18n.locale"
                                    :reference-handler="handler"
                                    uniform-width
                                    style="width: 100%"
                />
            </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                schema: getDefaultSchema(),
                formData: {},
                handler: getReferenceHandler(),
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
