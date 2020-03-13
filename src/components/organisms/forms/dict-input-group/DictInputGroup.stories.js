import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';

export default {
    title: 'organisms/forms/DictInputGroup',
    component: PDictInputGroup,
    parameters: {
        info: {
            summary: '',
            components: { PDictInputGroup },
        },
        knobs: { escapeHTML: false },
    },
};

const getProps = () => ({
    dict: {
        default: object('dict', {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3',
        }),
    },
    disabled: {
        default: boolean('disabled', false),
    },
    showEmptyInput: {
        default: boolean('showEmptyInput', false),
    },
    enableValidation: {
        default: boolean('enableValidation', false),
    },
});

const getState = (props, context) => {
    const state = reactive({
        result: {},
    });

    return state;
};

export const defaultCase = () => ({
    components: { PDictInputGroup },
    props: getProps(),
    template: `<div style="width: 80vw; background-color: white;">
        <p-dict-input-group v-bind="$props"
                            @validate="onValidate"
        >
        </p-dict-input-group>
        <br><br>
        <div style="margin: 1rem 0; padding: 1rem; border-radius: 5px; background-color: slateblue;">
            <strong>new dict:</strong>
            <br><br>
            <pre>{{result}}</pre>
        </div>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
            onValidate(isValid, newDict) {
                action('validate')(isValid, newDict);
                if (isValid) state.result = { ...newDict };
            },
        };
    },
});
