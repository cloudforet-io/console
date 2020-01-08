import { withKnobs, text } from '@storybook/addon-knobs/vue';
import {
    ref, toRefs, reactive, watch,
} from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import { action } from '@storybook/addon-actions';
import _ from 'lodash';
import PDynamicForm, { map } from './DynamicForm';

const getObjToStr = (obj) => {
    let res = '';
    _.forEach(obj, (v, k) => {
        res += `${k}: '${v}',\n`;
    });
    return res;
};


const getActions = () => ({});
const getData = (props, context) => {
    const state = reactive({
        templates: [
            {
                key: 'option1',
                name: 'Option Name 1',
                type: 'str',
                is_required: true,
            },
            {
                key: 'option2',
                name: 'Option Name 2',
                type: 'str',
            },
        ],
        values: {},
        validate: false,
    });

    const refreshValidation = () => {
        console.log('refresh validation');
        state.validate = true;
    };

    return {
        ...toRefs(state),
        refreshValidation,
    };
};

export default {
    title: 'organisms/forms/DynamicForm',
    component: PDynamicForm,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: `
            This component shows forms by data template. Data template MUST follow the structure below: \n
            \n\n
            ~~~
            ${getObjToStr(map)}
            ~~~
            You can customize this template structure by using 'mapper' props.
            \n\n
            Example template: \n
            ~~~
            ${getObjToStr(getData().templates.value)}  
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
                    <p-dynamic-form :templates="templates" 
                                    :values.sync="values"
                                    :validate="validate"
                    />
                    <button @click="refreshValidation">refresh validation</button>
                </div>
`,
    setup(...args) {
        // const state = reactive(getData(...args));
        return {
            // ...toRefs(state),
            ...getData(...args),
            ...getActions(),
        };
    },
});
