import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import { dictIGProps, DictIGState } from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';

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


const getState = (props, context) => {
    const state = reactive({
        result: {},
        proxyDict: computed({
            get: () => props.dict,
            set: (val) => { context.emit('update:dict', val); },
        }),
    });

    return state;
};

export const defaultCase = () => ({
    components: { PDictInputGroup },
    props: getKnobProps(dictIGProps, {
        dict: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3',
        },
    }),
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


export const useState = () => ({
    components: { PDictInputGroup },
    template: `<div style="width: 80vw; background-color: white;">
        <p-dict-input-group v-bind="dictIG.state"
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
        const dictIG = new DictIGState({
            enableValidation: true,
        });
        const result = ref({});
        return {
            dictIG,
            result,
            onValidate(isValid, newDict) {
                action('validate')(isValid, newDict);
                if (isValid) result.value = { ...newDict };
            },
        };
    },
});


export const useToolSet = () => ({
    components: { PDictInputGroup },
    template: `<div style="width: 80vw; background-color: white;">
        <p-dict-input-group v-bind="ts.state"
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
        const ts = new DictIGState({
            enableValidation: true,
        });
        const result = ref({});
        return {
            ts,
            result,
            onValidate(isValid, newDict) {
                action('validate')(isValid, newDict);
                if (isValid) result.value = { ...newDict };
            },
        };
    },
});
