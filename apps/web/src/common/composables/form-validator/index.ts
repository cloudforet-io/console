import type { ComputedRef, UnwrapRef } from 'vue';
import {
    computed, reactive, ref,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { clone } from 'lodash';

type ValidatorResult = boolean|TranslateResult;
// eslint-disable-next-line no-unused-vars
interface Validator { (value?: any): ValidatorResult }
type ValidationResult = boolean;

function useValueValidator<T = any>(
    value: T,
    validator?: Validator,
    immediate = false,
) {
    const valueRef = ref<T>(value);
    const validationStarted = ref(immediate);

    const setValue = (_value: UnwrapRef<T>) => {
        if (!validationStarted.value) validationStarted.value = true;
        valueRef.value = _value;
    };

    const validatorResult = computed<ValidatorResult>(() => {
        if (validator) return validator(valueRef.value);
        return true;
    });

    const validationResult = computed<ValidationResult>(() => {
        const result = validatorResult.value;
        if (typeof result === 'boolean') return result;
        return !result;
    });

    const isInvalid = computed<ValidationResult|undefined>(() => {
        if (!validationStarted.value) return undefined;
        return !validationResult.value;
    });

    const invalidText = computed<TranslateResult>(() => {
        if (!validationStarted.value) return '';

        const result = validatorResult.value;
        if (typeof result === 'boolean') return '';
        return result;
    });

    const reset = () => {
        valueRef.value = value as UnwrapRef<T>;
        validationStarted.value = immediate;
    };

    const resetValidation = () => {
        validationStarted.value = immediate;
    };

    const validate = () => {
        if (!validationStarted.value) validationStarted.value = true;
        if (validator) valueRef.value = clone(valueRef.value);
        return true;
    };

    return {
        value: computed<UnwrapRef<T>>(() => valueRef.value),
        validationResult,
        isInvalid,
        invalidText,
        setValue,
        reset,
        resetValidation,
        validate,
    };
}

type Forms<T> = {
    [K in keyof T]: ComputedRef<T[K]>
};

type Validators<T> = {
    // eslint-disable-next-line no-unused-vars
    [K in keyof T]: Validator
};

type ValueSetters<T> = {
    // eslint-disable-next-line no-unused-vars
    [K in keyof T]: (val: T[K]) => void
};

type InvalidTexts<T> = {
    // eslint-disable-next-line no-unused-vars
    [K in keyof T]: ComputedRef<TranslateResult>
};

type InvalidState<T> = {
    // eslint-disable-next-line no-unused-vars
    [K in keyof T]: ComputedRef<ValidationResult|undefined>
};

type ValidationResults<T> = {
    // eslint-disable-next-line no-unused-vars
    [K in keyof T]: ComputedRef<ValidationResult>
};

type Resets<T> = {
    // eslint-disable-next-line no-unused-vars
    [K in keyof T]: () => void
};

type Validates<T> = {
    // eslint-disable-next-line no-unused-vars
    [K in keyof T]: () => void
};

type ImmediateMap<T> = {
    // eslint-disable-next-line no-unused-vars
    [K in keyof T]: boolean
};

/**
 * @param _forms
 * A set of form input data.
 * e.g. { a: '', b: 0, c: [], d: {} }
 *
 * @param validators
 * A set of validators.
 * e.g. { a: (val) => !!val, b: (val) => val > 0 ? '' : 'Invalid' }
 * Validators can return boolean, string or undefined.
 * When it returns boolean, true means valid, and false means invalid.
 * When it returns string, empty string means valid, and others mean invalid.
 * When it returns undefined, it means validation is not executed.
 *
 * @param [_immediate]
 * Whether to start validation immediately or not.
 * Boolean or a set of booleans.
 * If it is boolean, it starts all validations immediately.
 * If it is object(e.g. { a: true }), only validators whose value for the property is true are executed immediately.
 * Otherwise, it starts validation when value is updated at least once.
 * Default: false
 *
 * @returns {Object} {forms, invalidState, invalidTexts, isAllValid,
 * setForm, resetAll, resetValidations, validateAll, validate}
 * forms: A set of ComputedRef<T> form value.
 * invalidState: A set of ComputedRef invalid state.
 * invalidTexts: A set of ComputedRef invalid text.
 * isAllValid: ComputedRef<boolean>. Is all form values are valid or not.
 * initForm: Function. Initiate form's value by given property name or given form object.
 * setForm: Function. Change form's value by given property name or given form object.
 * resetAll: Function. Reset form values and validation states.
 * resetValidations: Function. Reset validation states.
 * validateAll: Function. Validate all form values. Returns result.
 * validate: Function. Validate form's value by given property name. Returns result.
 *
 * @example
 *
 <template>
 <p-field-group :invalid="invalidState.name" :invalid-text="invalidTexts.name">
 <p-text-input :value="name" @input="handleNameInput" />
 </p-field-group>
 <p-field-group :invalid="invalidState.address" :invalid-text="invalidTexts.address">
 <p-text-input :value="address" @input="handleAddressInput" />
 </p-field-group>
 <p-button :disabled="isAllValid">confirm</p-button>
 <p-button @click="handleReset">reset</p-button>
 </template>

 setup() {
    const {
        forms: { name, address },
        invalidState,
        invalidTexts,
        setForm, isAllValid,
    } = useFormValidator({
        name: 'name',
        address: '',
    }, {
        name: (val: string) => {
            if (!val.trim()) return '이름을 작성하세요';
            return true;
        },
        address: (val: string) => {
            if (val.trim().length < 5) return '주소는 5자 이상 작성하세요';
            return true;
        },
    });

    const handleNameInput = (value) => {
        setForm('name', value);
    };

    const handleAddressInput = () => {
        setForm('address', value);
    };

    const handleReset = () => {
        initForm({
            name: 'name',
            address: '',
        })
    };

    return {
        name,
        address,
        invalidState,
        invalidTexts,
        isAllValid,
        handleNameInput,
        handleAddressInput,
        handleReset,
    };
 }
 */
export function useFormValidator<T extends Record<string, any> = any>(
    _forms: T,
    validators: Partial<Validators<T>>,
    _immediate: Partial<ImmediateMap<T>>|boolean = false,
) {
    const formKeys: Array<keyof T> = Object.keys(_forms);

    const forms = {} as Forms<T>;
    const valueSetters = {} as ValueSetters<T>;
    const invalidTexts = {} as InvalidTexts<T>;
    const invalidState = {} as InvalidState<T>;
    const validationResults = {} as ValidationResults<T>;
    const resets = {} as Resets<T>;
    const resetValidationMap = {} as Resets<T>;
    const validateMap = {} as Validates<T>;

    formKeys.forEach((key) => {
        const validator = validators[key];
        const immediate = typeof _immediate === 'boolean' ? _immediate : _immediate[key];

        const {
            value, setValue, validationResult, isInvalid, invalidText, reset, resetValidation, validate,
        } = useValueValidator(_forms[key], validator, immediate);

        forms[key] = value;
        valueSetters[key] = setValue;
        validationResults[key] = validationResult;
        invalidState[key] = isInvalid;
        invalidTexts[key] = invalidText;
        resets[key] = reset;
        resetValidationMap[key] = resetValidation;
        validateMap[key] = validate;
    });

    const isAllValid = computed<boolean>(() => Object.values(validationResults).every((validationResult) => validationResult.value));

    const setForm = (key: keyof T | T, value?: T[keyof T]) => {
        if (typeof key === 'object') {
            const newForm = key;
            Object.keys(newForm).forEach((k) => {
                const setter = valueSetters[k];
                if (setter) setter(newForm[k]);
            });
        } else {
            const setter = valueSetters[key];
            if (setter) setter(value as unknown as T[keyof T]);
        }
    };

    const initForm = (key?: keyof T | T, value?: T[keyof T]) => {
        if (typeof key === 'object' || key === undefined) {
            const newForm = key ?? _forms;
            Object.keys(newForm).forEach((k) => {
                const setter = valueSetters[k];
                if (setter) {
                    setter(newForm[k]);
                    resetValidationMap[k]();
                }
            });
        } else {
            const setter = valueSetters[key];
            if (setter) {
                setter(value as unknown as T[keyof T]);
                resetValidationMap[key]();
            }
        }
    };

    const resetAll = () => {
        formKeys.forEach((key) => {
            resets[key]();
        });
    };

    const resetValidations = () => {
        formKeys.forEach((key) => {
            resetValidationMap[key]();
        });
    };

    const validateAll = () => {
        formKeys.forEach((key) => {
            validateMap[key]();
        });
    };

    const validate = (key: keyof T) => {
        if (validateMap[key]) validateMap[key]();
    };

    return {
        forms,
        invalidState: reactive(invalidState),
        invalidTexts: reactive(invalidTexts),
        isAllValid,
        initForm,
        setForm,
        resetAll,
        resetValidations,
        validateAll,
        validate,
    };
}
