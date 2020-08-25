import VueFormGenerator from 'vue-form-generator/dist/vfg';

import { withKnobs } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';

import PDynamicForm from '@/components/organisms/forms/dynamic-form/PDynamicForm.vue';

export default {
    title: 'organisms/forms/DynamicForm',
    component: PDynamicForm,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: `
            This component shows forms by template form. Template form MUST follow the structure below: \n
            \n\n
            // ~~~
            // You can customize this template form structure by using 'mapper' props.
            // \n\n
            // Example template: \n
            // ~~~
            // `,
            components: { PDynamicForm },
        },
    },
};


// export const defaultCase = () => ({
//     components: { PRadio },
//     props: {
//         hovered: {
//             default: boolean('hovered', false),
//         },
//     },
//     template: `<p-radio v-model="selected"
//                         :hovered="hovered"
//                         @change="onChange"
//                 />`,
//     setup() {
//         return {
//             ...setup(),
//         };
//     },
//
// });
export const defaultCase = () => ({
    components: { PDynamicForm },
    template: `<div style="width: 30rem">
                    <p-dynamic-form
                            :schema="inputSchema"
                            :model="inputModel"
                            :options="inputOptions"
                            :is-valid.sync="isValid"
                    />
        
                    <p style="margin-top: 3rem;">
                        <span>is valid:</span> 
                        <span :style="{color: isValid ? 'blue' : 'red' }" style="font-weight: bold">{{ isValid }}</span>
                    </p>
                </div>
`,
    setup() {
        const state = reactive({
            isValid: false,
            inputModel: {
                name: '',
                priority: 10,
                version: '1.0',
                radio: '',
            },
            inputSchema: {
                fields: [
                    {
                        type: 'input',
                        inputType: 'text',
                        label: 'Name',
                        model: 'name',
                        min: 2,
                        required: true,
                        validator: VueFormGenerator.validators.string.locale({
                            fieldIsRequired: 'should NOT be shorter than 2 characters',
                            textTooSmall: 'should NOT be shorter than 2 characters',
                        }),
                    },
                    {
                        type: 'input',
                        inputType: 'number',
                        label: 'Priority',
                        model: 'priority',
                        min: 1,
                        max: 10,
                        required: true,
                        validator: VueFormGenerator.validators.number.locale({
                            numberTooSmall: 'should be >= 1',
                            numberTooBig: 'should be <= 10',
                        }),
                    },
                    {
                        type: 'select',
                        label: 'Version',
                        model: 'version',
                        values: ['1.1(latest)', '1.0', '0.9'],
                        hideNoneSelectedText: true,
                        required: true,
                        validator: VueFormGenerator.validators.select,
                    },
                    {
                        type: 'radios',
                        label: 'Radio',
                        model: 'radio',
                        values: ['First', 'Second', 'Third'],
                        required: true,
                        validator: VueFormGenerator.validators.required,
                    },
                ],
            },
            inputOptions: {
                validateAfterLoad: true,
                validateAfterChanged: true,
                validateAsync: true,
            },
        });
        return {
            ...toRefs(state),
        };
    },
});


// export const listCase = () => ({
//     components: { PDynamicForm },
//     props: {
//     },
//     template: `<div>
//                     <p-dynamic-form v-for="(fm, idx) in forms" :key="idx"
//                                     :form="fm"
//                                     v-model="values[fm[formKey]]"
//                                     :invalid="invalidState[fm[formKey]]"
//                                     :invalid-text="invalidMsg[fm[formKey]]"
//                                     @change="onChange"
//                     />
//                     <button @click="allValidation">refresh validation</button>
//                 </div>
// `,
//     setup(...args) {
//         const state = reactive(getData(...args));
//         const values = ref({});
//         const {
//             formKey,
//             invalidMsg,
//             invalidState,
//             allValidation,
//         } = setValidation(state.forms, values.value);
//
//         return {
//             ...toRefs(state),
//             values,
//             formKey,
//             invalidMsg,
//             invalidState,
//             allValidation,
//             ...getActions(),
//         };
//     },
// });

// export const realtimeValidate = () => ({
//     components: { PDynamicForm },
//     props: {
//     },
//     template: `<div>
//                     <p-dynamic-form v-for="(fm, idx) in forms" :key="idx"
//                                     :form="fm"
//                                     v-model="values[fm.key]"
//                                     :invalid="invalidState[fm.key]"
//                                     :invalid-text="invalidMsg[fm.key]"
//                                     :validatable="validatable"
//                                     @change="onChange(fm.key, $event)"
//                     />
//                     <button @click="validatable = !validatable">
//                         Turn {{ validatable ? 'off' : 'on'}} validatable
//                     </button>
//                 </div>
// `,
//     setup(...args) {
//         const state = reactive(getData(...args));
//         const values = ref({});
//         const {
//             formKey,
//             invalidMsg,
//             invalidState,
//             fieldValidation,
//         } = setValidation(state.forms, values.value);
//
//         const onChange = (key, val) => {
//             fieldValidation(key, val);
//             getActions().onChange(val);
//         };
//
//         return {
//             ...toRefs(state),
//             values,
//             formKey,
//             invalidMsg,
//             invalidState,
//             onChange,
//         };
//     },
// });
