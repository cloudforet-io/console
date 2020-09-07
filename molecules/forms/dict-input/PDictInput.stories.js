import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import PDictInput from '@/components/molecules/forms/dict-input/PDictInput.vue';

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

const actions = {
    'change:key': action('change:key'),
    'change:value': action('change:value'),
    'blur:key': action('blur:key'),
    'blur:value': action('blur:value'),
    'focus:key': action('focus:key'),
    'focus:value': action('focus:value'),
};

export const defaultCase = () => ({
    components: { PDictInput },
    props: {
        name: 'Key!!',
        value: 'Value!!',
        keyInvalidText: 'Key is invalid',
        valueInvalidText: 'Value is invalid',
    },
    template: `
        <div style="width: 80vw;">
            <p-dict-input  v-bind="$props" v-on="actions"></p-dict-input>
        </div>`,
    setup() {
        return {
            actions,
        };
    },
});

// export const useState = () => ({
//     components: { PDictInput },
//     template: `
//     <div style="width: 80vw;">
//         <p-dict-input  v-bind="dictInput.state"
//                        v-bind.sync="dictInput.syncState"
//                        v-on="actions"></p-dict-input>
//     </div>`,
//     setup() {
//         const dictInput = new DictInputState();
//
//         return {
//             dictInput,
//             actions,
//         };
//     },
// });
