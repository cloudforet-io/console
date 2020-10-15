import {
    toRefs, reactive, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';

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

const actions = {
    change: action('change'),
};


export const defaultCase = () => ({
    components: { PDictInputGroup, PButton },
    props: {
        disabled: {
            default: boolean('disabled', false),
        },
        showHeader: {
            default: boolean('showHeader', true),
        },
    },
    template: `<div class="w-full h-screen flex flex-col pt-10">
        <p-dict-input-group ref="dictRef" 
                            class="bg-white" 
                            v-bind="$props"
                            :dict="dict"
                            :show-validation="showValidation"
                            v-on="actions"
        >
        </p-dict-input-group>
        <p-button class="my-5" style-type="gray900" @click="validate">Validate</p-button>
        <div class="border border-primary py-3 rounded w-full">
            <pre>{{dict}}</pre>
        </div>
    </div>`,
    setup(props, context) {
        const state = reactive({
            dict: { key1: 'val1' },
            showValidation: false,
            dictRef: null,
        });

        return {
            ...toRefs(state),
            actions,
            validate() {
                state.showValidation = true;
                if (state.dictRef.allValidation()) state.dict = state.dictRef.getDict();
            },
        };
    },
});
