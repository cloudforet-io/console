<template>
    <div>
        <p-field-group :label="formData.label"
                       :required="formData.required"
                       :invalid-text="invalidText"
                       :invalid="typeof invalid === 'boolean' ? invalid : false"
        >
            <slot>
                <div v-if="formType === 'input'">
                    <p-text-input v-model="proxyValue"
                                  :type="inputType"
                                  :placeholder="formData.placeholder"
                    />
                </div>
                <div v-else-if="formType === 'radio'">
                    <span v-for="(bool) in [true, false]" :key="bool">
                        <p-radio v-model="proxyValue"
                                 :value="bool"
                        />
                        {{ bool }}
                    </span>
                </div>
                <div v-else-if="formType === 'dropdown'">
                    <p-dropdown-menu-btn :menu="setDropdownMenu(formData.menu)"
                                         @clickMenuEvent="onClickMenu"
                    >
                        {{ value || formData.placeholder }}
                    </p-dropdown-menu-btn>
                </div>
                <div v-else-if="formType === 'tags'">
                    <p-tags-input :tags.sync="proxyValue"
                                  :placeholder="formData.placeholder"
                                  :focus="false"
                    />
                </div>
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

const PTextInput = () => import('@/components/atoms/inputs/TextInput.vue');
const PRadio = () => import('@/components/molecules/forms/radio/Radio.vue');
const PDropdownMenuBtn = () => import('@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue');
const PTagsInput = () => import('@/components/organisms/forms/tags-input/TagsInput.vue');

export const map = {
    key: 'key',
    label: 'name',
    required: 'is_required',
    placeholder: 'example',
    type: 'type',
    default: 'default',
    menu: 'enums',
};

const setFormState = (props) => {
    const formData = computed(() => _.mapValues(map, val => props.form[val]));
    const formType = computed(() => {
        if (formData.value.menu) return 'dropdown';
        switch (formData.value.type) {
        case 'bool': return 'radio';
        case 'list': return 'tags';
        default: return 'input';
        }
    });
    const inputType = computed(() => {
        switch (formData.value.type) {
        case 'str': return 'text';
        default: return 'number';
        }
    });

    return reactive({
        formData,
        formType,
        inputType,
    });
};

const setValueState = (props, emit, formState) => {
    const proxyValue = computed({
        get: () => props.value,
        set: (val) => {
            emit('change', val); // for v-model
        },
    });

    const setDefaultValue = () => {
        if (formState.formData.default !== undefined) {
            proxyValue.value = formState.formData.default;
            return;
        }
        if (formState.formType === 'tags' && !proxyValue.value) proxyValue.value = [];
    };

    setDefaultValue();

    return reactive({
        proxyValue,
    });
};

const setDropdownState = valueState => reactive({
    setDropdownMenu(menu) {
        return menu.map(item => ({ type: 'item', label: item, name: item }));
    },
    onClickMenu(name) {
        valueState.proxyValue = name;
    },
});

/**
 *
 * @param forms {Array<Object>}
 * @param values {Array<Object>}
 * @returns {{fieldValidation: *, invalidMsg: *, invalidState: *}}
 */
export const setValidation = (forms, values) => {
    const formKey = map.key;
    const vd = {};

    forms.forEach((form) => {
        if (form[map.required]) {
            vd[form[formKey]] = [requiredValidation()];
        }
    });

    const {
        allValidation,
        fieldValidation,
        invalidMsg,
        invalidState,
        isAllValid,
    } = formValidation(values, vd);

    return {
        formKey,
        allValidation,
        fieldValidation,
        invalidMsg,
        invalidState,
        isAllValid,
    };
};

export const dynamicFormList = (forms, values) => {

};

export default {
    name: 'PDynamicForm',
    events: ['update:value'],
    components: {
        PFieldGroup,
        PTextInput,
        PRadio,
        PDropdownMenuBtn,
        PTagsInput,
    },
    model: {
        prop: 'value',
        event: 'change',
    },
    props: {
        form: Object,
        value: {
            default: undefined,
        },
        invalidText: {
            type: String,
            default: '',
        },
        invalid: {
            type: Boolean,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const formState = setFormState(props);
        const valueState = setValueState(props, emit, formState);
        const dropdownState = setDropdownState(valueState);
        return {
            map,
            ...toRefs(formState),
            ...toRefs(valueState),
            ...toRefs(dropdownState),
        };
    },
};
</script>

<style lang="scss" scoped>

</style>
