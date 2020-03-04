import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PDictInput from '@/components/molecules/forms/dict-input/DictInput.vue';

export default {
    title: 'molecules/forms/DictInput',
    component: PDictInput,
    parameters: {
        info: {
            summary: '',
            components: { PDictInput },
        },
        knobs: { escapeHTML: false },
    },
};

/**
 * propName: {
 *      default: object('propName', {}),
 * }
 */
const getProps = () => ({
    name: {
        default: text('name', 'key!!'),
    },
    value: {
        default: text('value', 'value!!'),
    },
    keyInvalid: {
        default: boolean('keyInvalid', false),
    },
    valueInvalid: {
        default: boolean('valueInvalid', false),
    },
    keyInvalidText: {
        default: text('keyInvalidText', 'key invalid text'),
    },
    valueInvalidText: {
        default: text('valueInvalidText', 'value invalid text'),
    },
    disabled: {
        default: boolean('disabled', false),
    },
});

const getState = (props, context) => {
    const state = reactive({
        actions: {
            'change:key': action('change:key'),
            'change:value': action('change:value'),
            'blur:key': action('blur:key'),
            'blur:value': action('blur:value'),
            'focus:key': action('focus:key'),
            'focus:value': action('focus:value'),
        },
    });

    return state;
};

export const defaultCase = () => ({
    components: { PDictInput },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <p-dict-input  v-bind="$props" v-on="actions"></p-dict-input>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
