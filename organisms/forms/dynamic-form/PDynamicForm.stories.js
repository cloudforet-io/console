import { withKnobs, text } from '@storybook/addon-knobs/vue';
import {
    ref, toRefs, reactive, watch,
} from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import { forEach } from 'lodash';
import PDynamicForm, { map, setValidation } from '@/components/organisms/forms/dynamic-form/PDynamicForm.vue';

const getObjToStr = (obj) => {
    let res = '';
    forEach(obj, (v, k) => {
        res += `${k}: '${v}',\n`;
    });
    return res;
};


const getActions = () => ({
    onChange: action('onChange'),
});
const getData = (props, context) => {
    const state = reactive({
        form: {
            key: 'option1',
            name: 'Option Name 1',
            type: 'bool',
            default: false,
            is_required: true,
        },
        forms: [
            {
                key: 'option1',
                name: 'Option Name 1',
                type: 'bool',
                default: false,
                is_required: true,
            },
            {
                key: 'option2',
                name: 'Option Name 2',
                type: 'str',
                example: 'option2',
                is_required: true,
            },
            {
                key: 'option3',
                name: 'Option Name 3',
                type: 'str',
                is_required: true,
                example: 'Select',
                enum: [
                    'ENUM1', 'ENUM2', 'ENUM3', 'ENUM4',
                ],
            },
            {
                key: 'option4',
                name: 'Option Name 4',
                type: 'list',
                example: 'option4',
                is_required: true,
            },

        ],
        value: '',
        invalid: false,
        invalidText: '',
        validatable: false,
    });

    return {
        ...toRefs(state),
    };
};

export default {
    title: 'organisms/forms/DynamicForm',
    component: PDynamicForm,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: `
            This component shows forms by template form. Template form MUST follow the structure below: \n
            \n\n
            ~~~
            ${getObjToStr(map)}
            ~~~
            You can customize this template form structure by using 'mapper' props.
            \n\n
            Example template: \n
            ~~~
            ${getObjToStr(getData().form.value)}  
            ~~~
            `,
            components: { PDynamicForm },
        },
    },
};


export const defaultCase = () => ({
    components: { PDynamicForm },
    props: {
    },
    template: `<div>
                    <p-dynamic-form :form="form" 
                                    v-model="value"
                                    :invalid="invalid"
                                    :invalid-text="invalidText"
                                    @change="onChange"
                    />
                </div>
`,
    setup(...args) {
        const state = reactive(getData(...args));
        return {
            ...toRefs(state),
            ...getActions(),
        };
    },
});


export const listCase = () => ({
    components: { PDynamicForm },
    props: {
    },
    template: `<div>
                    <p-dynamic-form v-for="(fm, idx) in forms" :key="idx"
                                    :form="fm"
                                    v-model="values[fm[formKey]]"
                                    :invalid="invalidState[fm[formKey]]"
                                    :invalid-text="invalidMsg[fm[formKey]]"
                                    @change="onChange"
                    />
                    <button @click="allValidation">refresh validation</button>
                </div>
`,
    setup(...args) {
        const state = reactive(getData(...args));
        const values = ref({});
        const {
            formKey,
            invalidMsg,
            invalidState,
            allValidation,
        } = setValidation(state.forms, values.value);

        return {
            ...toRefs(state),
            values,
            formKey,
            invalidMsg,
            invalidState,
            allValidation,
            ...getActions(),
        };
    },
});

export const realtimeValidate = () => ({
    components: { PDynamicForm },
    props: {
    },
    template: `<div>
                    <p-dynamic-form v-for="(fm, idx) in forms" :key="idx"
                                    :form="fm"
                                    v-model="values[fm.key]"
                                    :invalid="invalidState[fm.key]"
                                    :invalid-text="invalidMsg[fm.key]"
                                    :validatable="validatable"
                                    @change="onChange(fm.key, $event)"
                    />
                    <button @click="validatable = !validatable">
                        Turn {{ validatable ? 'off' : 'on'}} validatable
                    </button>
                </div>
`,
    setup(...args) {
        const state = reactive(getData(...args));
        const values = ref({});
        const {
            formKey,
            invalidMsg,
            invalidState,
            fieldValidation,
        } = setValidation(state.forms, values.value);

        const onChange = (key, val) => {
            fieldValidation(key, val);
            getActions().onChange(val);
        };

        return {
            ...toRefs(state),
            values,
            formKey,
            invalidMsg,
            invalidState,
            onChange,
        };
    },
});
