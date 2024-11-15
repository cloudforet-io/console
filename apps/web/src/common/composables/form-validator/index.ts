import type { ComputedRef, UnwrapRef, Ref } from 'vue';
import {
    computed, reactive, ref, isRef, isReadonly, readonly,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { clone } from 'lodash';

type ValidatorResult = boolean|TranslateResult;
export interface Validator<T> { (value: T): ValidatorResult }
type ValidationResult = boolean;

export function useFieldValidator<T = any>(
    value: T|Ref<T>,
    validator?: Validator<T>,
    immediate = false,
    setter?: (val: T) => void, // setter is used to set value for readonly ref
) {
    const valueRef = isRef(value) ? value : ref<T>(value);
    const validationStarted = ref(immediate);

    const setValue = (_value: T) => {
        if (!validationStarted.value) validationStarted.value = true;
        if (isReadonly(valueRef)) {
            if (setter) setter(_value);
        } else valueRef.value = _value;
    };

    const validatorResult = computed<ValidatorResult>(() => {
        if (validator) return validator(valueRef.value as T);
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
        if (isReadonly(valueRef)) {
            if (setter) setter(valueRef.value as T);
        } else valueRef.value = value as UnwrapRef<T>;
        validationStarted.value = immediate;
    };

    const resetValidation = () => {
        validationStarted.value = immediate;
    };

    const validate = () => {
        if (!validationStarted.value) validationStarted.value = true;
        if (validator) {
            if (isReadonly(valueRef)) {
                if (setter) setter(clone(valueRef.value as T));
            } else valueRef.value = clone(valueRef.value);
        }
        return true;
    };

    return {
        value: isReadonly(valueRef) ? valueRef as Readonly<Ref<T>> : readonly(valueRef) as Readonly<Ref<T>>,
        validationResult,
        isInvalid,
        invalidText,
        setValue,
        reset,
        resetValidation,
        validate,
    };
}

type UnwrapRefFormValue<T> = T extends Ref<infer V> ? V : T;

type Forms<T> = {
    [K in keyof T]: Readonly<Ref<UnwrapRefFormValue<T[K]>>>
};

type Validators<T> = {
    [K in keyof T]: Validator<UnwrapRefFormValue<T[K]>>
        | ReturnType<typeof useFieldValidator<UnwrapRefFormValue<T[K]>>>
};

type ValueSetters<T> = {
    [K in keyof T]: (val: UnwrapRefFormValue<T[K]>) => void
};

type InvalidTexts<T> = {
    [K in keyof T]: ComputedRef<TranslateResult>
};

type InvalidState<T> = {
    [K in keyof T]: ComputedRef<ValidationResult|undefined>
};

type ValidationResults<T> = {
    [K in keyof T]: ComputedRef<ValidationResult>
};

type Resets<T> = {
    [K in keyof T]: () => void
};

type Validates<T> = {
    [K in keyof T]: () => void
};

type ImmediateMap<T> = {
    [K in keyof T]: boolean
};

/**
 * @param _forms
 * A set of form input data.
 * e.g. { a: '', b: 0, c: ref([]), d: computed(() => state.value) }
 * Each form value can be a primitive value, ref, or computed value.
 *
 * @param validators
 * A set of validator function or useFieldValidator result.
 * e.g. { a: (val) => !!val, b: (val) => val > 0 ? '' : 'Invalid', c: useFieldValidator([], (val) => !!val) }
 * Validator functions can return boolean, string or undefined.
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
 * @param _valueSetters
 * @params [_valueSetters]
 * A set of value setters.
 * e.g. { a: (val) => { state.a = val; } }
 * Default: {}
 * If the form value is readonly, it is required to set value by using setter.
 * If the form value is not readonly, it is not required to set value by using setter.
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
 */
export function useFormValidator<T extends Record<string, any> = any>(
    _forms: T,
    validators: Partial<Validators<T>>,
    _immediate: Partial<ImmediateMap<T>>|boolean = false,
    _valueSetters: Partial<ValueSetters<T>> = {},
) {
    const formKeys: Array<keyof T> = Object.keys(_forms);

    const forms = {} as Forms<T>;
    const valueSetters = { ..._valueSetters } as ValueSetters<T>;
    const invalidTexts = {} as InvalidTexts<T>;
    const invalidState = {} as InvalidState<T>;
    const validationResults = {} as ValidationResults<T>;
    const resets = {} as Resets<T>;
    const resetValidationMap = {} as Resets<T>;
    const validateMap = {} as Validates<T>;

    formKeys.forEach((key: keyof T) => {
        const validator = validators[key];
        const immediate = typeof _immediate === 'boolean' ? _immediate : _immediate[key];
        if (validator) {
            const {
                value, setValue, validationResult, isInvalid, invalidText, reset, resetValidation, validate,
            } = typeof validator === 'function' ? useFieldValidator<T[keyof T]>(_forms[key], validator, immediate) : validator;
            forms[key] = value as Forms<T>[keyof T];
            valueSetters[key] = setValue;
            validationResults[key] = validationResult;
            invalidState[key] = isInvalid;
            invalidTexts[key] = invalidText;
            resets[key] = reset;
            resetValidationMap[key] = resetValidation;
            validateMap[key] = validate;
        }
    });

    const isAllValid = computed<boolean>(() => Object.values(validationResults).every((validationResult) => validationResult.value));

    const setForm = (key: keyof T | Partial<T>, value?: T[keyof T]) => {
        if (typeof key === 'object') { // if key is an object, that means, it is batch update
            const newForm: Partial<T> = key;
            Object.keys(newForm).forEach((k: keyof T) => {
                const setter = valueSetters[k];
                if (setter) setter(newForm[k] as UnwrapRefFormValue<T[keyof T]>);
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

    const resetValidation = (key: keyof T) => {
        if (resetValidationMap[key]) resetValidationMap[key]();
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
        resetValidation,
        resetValidations,
        validateAll,
        validate,
    };
}
