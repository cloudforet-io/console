<template>
    <div>
        <p-field-group :label="formData.label"
                       :required="formData.required"
                       :invalid-text="invalidText"
                       :invalid="typeof invalid === 'boolean' ? invalid : false"
        >
            <slot>
                <div class="form-container">
                    <p-text-input v-if="formType === 'input'"
                                  v-model="proxyValue"
                                  :class="{'is-invalid': typeof invalid === 'boolean' ? invalid : false}"
                                  :type="inputType"
                                  :placeholder="formData.placeholder"
                                  class="form"
                                  @input="onChange"
                    />
                    <template v-else-if="formType === 'radio'">
                        <span v-for="(bool) in [true, false]" :key="bool">
                            <p-radio v-model="proxyValue"
                                     :value="bool"
                                     @change="onChange"
                            />
                            {{ bool }}
                        </span>
                    </template>
                    <p-dropdown-menu-btn v-else-if="formType === 'dropdown'"
                                         :menu="setDropdownMenu(formData.menu)"
                                         block
                                         class="form"
                                         @select="onClickMenu"
                    >
                        {{ value || formData.placeholder }}
                    </p-dropdown-menu-btn>
                    <p-tags-input v-else-if="formType === 'tags'"
                                  :tags.sync="proxyValue"
                                  :placeholder="formData.placeholder"
                                  :focus="false"
                                  class="form"
                                  @change="onChange"
                    />
                </div>
            </slot>
        </p-field-group>
    </div>
</template>

<script lang="ts">
import _ from 'lodash';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import {
    formValidation, requiredValidation,
} from '@/lib/compostion-util';


import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';

const PTextInput = () => import('@/components/atoms/inputs/PTextInput.vue');
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
    const setDropdownMenu = menu => menu.map(item => ({ type: 'item', label: item, name: item }));

    return reactive({
        formData,
        formType,
        inputType,
        setDropdownMenu,
    });
};

const setValueState = (props, emit, formState) => {
    const proxyValue = computed({
        get: () => props.value,
        set: (val) => {
            emit('input', val); // for v-model
        },
    });

    const setDefaultValue = () => {
        if (formState.formData.default !== undefined) {
            proxyValue.value = formState.formData.default;
        }
    };

    setDefaultValue();

    return reactive({
        proxyValue,
    });
};

const setChangeActions = (valueState, emit) => ({
    onChange: (e) => { emit('change', e); },
    onClickMenu(name) {
        valueState.proxyValue = name;
        emit('change', name);
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
        vd[form[formKey]] = form[map.required] ? [requiredValidation()] : [];
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

export default {
    name: 'PDynamicForm',
    components: {
        PFieldGroup,
        PTextInput,
        PRadio,
        PDropdownMenuBtn,
        PTagsInput,
    },
    model: {
        prop: 'value',
        event: 'input',
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
        const changeActions = setChangeActions(valueState, emit);
        return {
            map,
            ...toRefs(formState),
            ...toRefs(valueState),
            ...changeActions,
        };
    },
};
</script>

<style lang="postcss" scoped>
.form-container {
    display: flex;
    width: 100%;
    .form {
        width: 100%;
    }
}
</style>
