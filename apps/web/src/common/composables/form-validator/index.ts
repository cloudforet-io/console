import type { ComputedRef, UnwrapRef, Ref } from 'vue';
import {
    computed, reactive, ref, readonly,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

type ValidatorResult = boolean | TranslateResult;

export interface ValidatorFn<T> {
    (value: UnwrapRef<T>): ValidatorResult
}

type ValidationResult = boolean;


type NotRef<T> = T extends Ref<any> ? never : T;

const IDENTIFIER = Symbol('useFieldValidator');
export function useFieldValidator<T>(
    value: NotRef<T>,
    validator?: ValidatorFn<T>,
    immediate = false,
) {
    const valueRef = ref<T>(value);
    const validationStarted = ref(immediate);

    const trigger = ref(0);

    const setValue = (_value: UnwrapRef<T>) => {
        if (!validationStarted.value) validationStarted.value = true;
        valueRef.value = _value;
    };

    const validatorResult = computed<ValidatorResult>(() => {
        if (validator) {
            // eslint-disable-next-line no-unused-expressions
            trigger.value; // trigger dependency
            return validator(valueRef.value);
        }
        return true;
    });

    const validationResult = computed<ValidationResult>(() => {
        const result = validatorResult.value;
        if (typeof result === 'boolean') return result;
        return !result;
    });

    const isInvalid = computed<ValidationResult | undefined>(() => {
        if (!validationStarted.value) return undefined;
        return !validationResult.value;
    });

    const invalidText = computed<TranslateResult>(() => {
        if (!validationStarted.value) return '';

        const result = validatorResult.value;
        if (typeof result === 'boolean') return '';
        return result;
    });

    const resetValidation = () => {
        validationStarted.value = immediate;
    };

    const reset = () => {
        valueRef.value = value as UnwrapRef<T>; // do not use setValue to avoid validation
        resetValidation();
    };

    const validate = () => {
        if (!validationStarted.value) validationStarted.value = true;
        trigger.value++;
        return validationResult.value;
    };

    return {
        [IDENTIFIER]: true,
        value: readonly(valueRef) as Readonly<Ref<T>>,
        validationResult,
        isInvalid,
        invalidText,
        setValue,
        reset,
        resetValidation,
        validate,
    };
}

type FieldValidator<T> = ReturnType<typeof useFieldValidator<T>>;
type ExtractFromFieldValidator<T> = T extends FieldValidator<infer U> ? U : never;
type RawForms<T> = {
    [K in keyof T]: T[K] | ExtractFromFieldValidator<T[K]>;
};
type FormRefs<T> = {
    [K in keyof T]:Readonly<Ref<T[K] | ExtractFromFieldValidator<T[K]>>>
};

type FieldValue<T, K extends keyof T> = UnwrapRef<T[K]> | UnwrapRef<ExtractFromFieldValidator<T[K]>>;
type ValueSetters<T> = {
    [K in keyof T]: ((_value: UnwrapRef<T[K]>) => void) | FieldValidator<ExtractFromFieldValidator<T[K]>>['setValue']
};

type InvalidTexts<T> = {
    [K in keyof T]: ComputedRef<TranslateResult>
};

type InvalidState<T> = {
    [K in keyof T]: ComputedRef<ValidationResult | undefined>
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

function isUseFieldValidatorReturn<T>(
    obj: any,
): obj is FieldValidator<T> {
    return (
        obj
        && typeof obj === 'object'
        && (obj as FieldValidator<T>)[IDENTIFIER] === true
    );
}
/*
 * @template T - Form data type.
 *
 * @param {T?} _forms - A set of form input data.
 * Form value can be any value or `useFieldValidator` result.
 * e.g.:
 * ```ts
 * { a: '', b: 0, c: useFieldValidator([], (val) => !!val.length) }
 * ```
 *
 * @param {ValidatorFn<T[keyof T]>} validators - It is a map of form key and validator function.
 * Only when the form value is not `useFieldValidator` result, the validator function is used.
 * e.g.
 * ```ts
 * { a: (val) => !!val, b: (val) => val > 0 ? '' : 'Invalid' }
 * ```
 * Validator functions can return `boolean`, string or `undefined`.
 * When it returns `boolean`, `true` means valid, and `false` means invalid.
 * When it returns `string`, empty string means valid, and others mean invalid.
 * When it returns `undefined`, it means validation is not started.
 *
 * @param {boolean | Partial<ImmediateMap<T>>} _immediate - Whether to start validation immediately or not.
 * If it is `boolean`, it starts all validations immediately.
 * If it is `object`(e.g. `{ a: true }`), only validators whose value for the property is `true` are executed immediately.
 * Otherwise, it starts validation when value is updated at least once.
 * Default: `false`
 *
 */
export function useFormValidator<T extends Record<string, any|FieldValidator<any>> = Record<string, any|FieldValidator<any>>>(
    formsOrFieldValidators: T,
    validators: Partial<{[K in keyof T]: ValidatorFn<T[K]>}> = {},
    _immediate: Partial<ImmediateMap<T>> | boolean = false,
) {
    const _allKeys: (keyof T)[] = [];

    const forms = {} as FormRefs<T>;
    const valueSetters = {} as ValueSetters<T>;

    const invalidTexts = {} as InvalidTexts<FormRefs<T>>;
    const invalidState = {} as InvalidState<FormRefs<T>>;
    const validationResults = {} as ValidationResults<FormRefs<T>>;
    const resets = {} as Resets<FormRefs<T>>;
    const resetValidationMap = {} as Resets<FormRefs<T>>;
    const validateMap = {} as Validates<FormRefs<T>>;

    Object.entries(formsOrFieldValidators).forEach(([key, valueOrFieldValidator]: [key: keyof T, valueOrFieldValidator: any]) => {
        _allKeys.push(key);
        let fieldValidator: FieldValidator<ExtractFromFieldValidator<T[keyof T]>> | FieldValidator<T[keyof T]>;
        if (isUseFieldValidatorReturn<ExtractFromFieldValidator<T[keyof T]>>(valueOrFieldValidator)) {
            fieldValidator = valueOrFieldValidator;
        } else {
            const value = valueOrFieldValidator;
            const validator = validators[key];
            const immediate: boolean = typeof _immediate === 'boolean' ? _immediate : !!_immediate[key as keyof T];
            fieldValidator = useFieldValidator(value, validator, immediate);
        }

        const {
            value, setValue, validationResult, isInvalid, invalidText, reset, resetValidation, validate,
        } = fieldValidator;
        forms[key] = value;
        valueSetters[key] = setValue;
        validationResults[key] = validationResult;
        invalidState[key] = isInvalid;
        invalidTexts[key] = invalidText;
        resets[key] = reset;
        resetValidationMap[key] = resetValidation;
        validateMap[key] = validate;
    });

    const results = Object.values(validationResults);
    const isAllValid = computed<boolean>(() => {
        if (results.length === 0) return true;
        return results.every((r) => r.value);
    });

    const setForm = <K extends keyof T = keyof T>(key: K | Partial<RawForms<T>>, value?: FieldValue<T, K>) => {
        if (typeof key === 'object') { // if key is an object, update forms by the object
            const newForm = key;
            Object.keys(newForm).forEach((k) => {
                const setter = valueSetters[k];
                if (setter) setter(newForm[k] as UnwrapRef<T[K]>); // as UnwrapRef<T[K]> is needed to avoid type error
            });
        } else {
            const setter = valueSetters[key];
            if (setter) setter(value as UnwrapRef<T[K]>); // as UnwrapRef<T[K]> is needed to avoid type error
        }
    };

    const resetAll = () => {
        _allKeys.forEach((key) => {
            resets[key]();
        });
    };

    // TODO: Remove in the future.
    /*
    * @willBeDeprecated Use resetAll() instead.
    */
    const initForm = () => {
        resetAll();
    };

    const resetValidation = (key: keyof T) => {
        if (resetValidationMap[key]) resetValidationMap[key]();
    };

    const resetValidations = () => {
        _allKeys.forEach((key) => {
            resetValidationMap[key]();
        });
    };

    const validateAll = () => {
        _allKeys.forEach((key) => {
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
