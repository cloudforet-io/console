<template>
    <div>
        <p-field-group v-for="(tp, idx) in templates" :key="idx"
                       :label="tp[map.label]"
                       :required="tp[map.required]"
                       :invalid-text="invalidMsg[tp[map.key]]"
                       :invalid="invalidState[tp[map.key]]"
        >
            <slot>
                <p-text-input v-if="getFormType(tp[map.type]) === 'input'"
                              v-model="proxyValues[tp[map.key]]"
                              :type="getInputType(tp[map.type])"
                />
            </slot>
        </p-field-group>
    </div>
</template>

<script>
import _ from 'lodash';
import {
    ref, computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    formValidation, makeProxy, requiredValidation,
} from '@/lib/compostion-util';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';

export const map = {
    key: 'key',
    label: 'name',
    required: 'is_required',
    placeholder: 'example',
    type: 'type',
    default: 'default',
};

const setFormTypes = () => reactive({
    getFormType(type) {
        switch (type) {
        case 'bool': return 'radio';
        case 'enum': return 'dropdown';
        default: return 'input';
        }
    },
    getInputType(type) {
        switch (type) {
        case 'str': return 'text';
        default: return type;
        }
    },
});


const setValidation = (props) => {
    const getValidation = () => {
        const vd = {};
        props.templates.forEach((tp) => {
            if (tp[map.required]) {
                const key = tp[map.key];
                if (vd[key]) vd[key].push(requiredValidation());
                else vd[key] = [requiredValidation()];
            }
        });
        return vd;
    };

    const {
        allValidation,
        invalidMsg,
        invalidState,
    } = formValidation(props.values, getValidation());

    console.log(invalidState, invalidMsg);

    watch(() => props.validate, async (val) => {
        const result = await allValidation();
    });

    return {
        invalidMsg,
        invalidState,
    };
};

export default {
    name: 'PDynamicForm',
    events: ['update:values'],
    components: {
        PFieldGroup,
        PTextInput,
    },
    props: {
        templates: Array,
        validate: {
            type: Boolean,
            default: false,
        },
        values: Object,
    },
    setup(props, { emit }) {
        const proxyValues = makeProxy('values', props, emit);

        const formTypeState = setFormTypes();
        const validationStates = setValidation(props);

        return {
            map,
            proxyValues,
            ...toRefs(formTypeState),
            ...validationStates,
        };
    },
};
</script>

<style lang="scss" scoped>

</style>
