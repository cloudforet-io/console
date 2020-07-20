import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import _ from 'lodash';
import {
    number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import {
    dictIGProps,
    DictIGState, DictIGToolSet, dictValidation,
    toDictItems,
} from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { DictPanelAPI } from '@/lib/api/dict';

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
    'change:key': action('change:key'),
    'change:value': action('change:value'),
    'change:add': action('change:add'),
    'change:delete': action('change:delete'),
};


export const defaultCase = () => ({
    components: { PDictInputGroup, PButton },
    props: getKnobProps(dictIGProps, {
        showValidation: true,
    }, {
        items: true,
        invalidMessages: true,
    }),
    template: `<div class="w-full h-screen flex flex-col pt-10">
        <p-dict-input-group class="bg-white" v-bind="$props"
                            :items.sync="items"
                            :invalid-messages="invalidMessages"
                            v-on="actions"
        >
        </p-dict-input-group>
        <p-button class="my-5" style-type="gray900" @click="allValidation()">Validate</p-button>
        <div class="border border-primary py-3 rounded w-full">
            <pre>{{items}}</pre>
        </div>
    </div>`,
    setup(props, context) {
        const state = reactive({
            items: toDictItems({ key1: 'val1' }),
            newDict: {},
        });
        const vds = dictValidation(computed(() => state.items));

        return {
            ...toRefs(state),
            ...vds,
            actions,
        };
    },
});


export const autoValidation = () => ({
    components: { PDictInputGroup, PButton },
    props: getKnobProps(dictIGProps, {
        showValidation: true,
    }, {
        items: true,
        invalidMessages: true,
    }),
    template: `<div class="w-full h-screen flex flex-col pt-10">
        <p-dict-input-group class="bg-white" v-bind="$props"
                            :items.sync="items"
                            :invalid-messages="invalidMessages"
                            v-on="myActions"
        >
        </p-dict-input-group>
        <div class="border border-primary my-5 py-3 rounded w-full">
            <pre>{{items}}</pre>
        </div>
    </div>`,
    setup(props, context) {
        const state = reactive({
            items: toDictItems({ key1: 'val1' }),
            newDict: {},
        });
        const vds = dictValidation(computed(() => state.items));
        const myActions = {
            ...actions,
            'change:value': _.debounce((idx, pair) => {
                actions['change:value'](idx, pair);
                vds.itemValidation(idx, 'value');
            }, 100),
            'change:key': _.debounce((idx, pair) => {
                actions['change:key'](idx, pair);
                vds.allValidation('key', false);
            }, 100),
            'change:add': (idx, pair) => {
                actions['change:add'](idx, pair);
                vds.itemValidation(idx);
            },
            'change:delete': (idx, pair) => {
                actions['change:delete'](idx, pair);
                vds.allValidation();
            },
        };

        return {
            ...toRefs(state),
            ...vds,
            myActions,
        };
    },
});


export const useToolSet = () => ({
    components: { PDictInputGroup, PButton },
    template: `<div class="w-full h-screen flex flex-col pt-10">
        <p-dict-input-group class="bg-white" v-bind="state"
                            :items.sync="syncState.items"
                            v-on="events"
        >
        </p-dict-input-group>
        <div class="border border-primary py-3 px-3 rounded w-full">
            <p class="mt-3">isAllValid: {{vdState.isAllValid}}</p>
            <p class="mt-3">newDict: </p>
            <pre>{{vdState.newDict}}</pre>
            <p class="mt-3">items: </p>
            <pre>{{syncState.items}}</pre>
        </div>
    </div>`,
    setup(props, context) {
        const ts = new DictIGToolSet({
            showValidation: true,
        });

        return {
            ...ts,
        };
    },
});


