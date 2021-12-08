import {
    computed, ComputedRef, ref, UnwrapRef,
} from '@vue/composition-api';
import { TranslateResult } from 'vue-i18n';
import { clone } from 'lodash';


type ValidatorResult = boolean|undefined|TranslateResult
interface Validator { (value?: any): ValidatorResult }
type ValidateResult = boolean|undefined

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
        if (!validationStarted.value) return undefined;
        if (validator) return validator(valueRef.value);
        return true;
    });

    const isInvalid = computed<ValidateResult>(() => {
        const result = validatorResult.value;

        if (result === undefined) return undefined;
        if (typeof result === 'boolean') return !result;
        return !!result;
    });

    const invalidText = computed<TranslateResult>(() => {
        const result = validatorResult.value;

        if (result === undefined || typeof result === 'boolean') return '';
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
}

type Validators<T> = {
    [K in keyof T]: Validator
}

type ValueSetters<T> = {
    [K in keyof T]: (val: T[K]) => void
}

type InvalidTexts<T> = {
    [K in keyof T]: ComputedRef<TranslateResult>
}

type InvalidState<T> = {
    [K in keyof T]: ComputedRef<ValidateResult>
}

type Resets<T> = {
    [K in keyof T]: () => void
}

type Validates<T> = {
    [K in keyof T]: () => void
}

type ImmediateMap<T> = {
    [K in keyof T]: boolean
}

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
 * setForm: Function. Change form's value by given property name.
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
 </template>

 setup() {
    const {
        forms: { name, address },
        invalidState,
        invalidTexts,
        setForm, isAllValid,
    } = useFormValidator({
        name: '',
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

    return {
        name,
        address,
        invalidState,
        invalidTexts,
        isAllValid,
        handleNameInput,
        handleAddressInput,
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
    const resets = {} as Resets<T>;
    const resetValidationMap = {} as Resets<T>;
    const validateMap = {} as Validates<T>;


    formKeys.forEach((key) => {
        const validator = validators[key];
        const immediate = typeof _immediate === 'boolean' ? _immediate : _immediate[key];

        const {
            value, setValue, isInvalid, invalidText, reset, resetValidation, validate,
        } = useValueValidator(_forms[key], validator, immediate);

        forms[key] = value;
        valueSetters[key] = setValue;
        invalidTexts[key] = invalidText;
        invalidState[key] = isInvalid;
        resets[key] = reset;
        resetValidationMap[key] = resetValidation;
        validateMap[key] = validate;
    });

    const isAllValid = computed<boolean>(() => Object.values(invalidState).every(isInvalid => isInvalid.value === false));

    const setForm = (key: keyof T, value: T[keyof T]) => {
        const setter = valueSetters[key];
        if (setter) setter(value);
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
        invalidState,
        invalidTexts,
        isAllValid,
        setForm,
        resetAll,
        resetValidations,
        validateAll,
        validate,
    };
}
