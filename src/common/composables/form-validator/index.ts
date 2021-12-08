import {
    computed, ComputedRef, ref, UnwrapRef,
} from '@vue/composition-api';
import { TranslateResult } from 'vue-i18n';


type ValidatorResult = boolean|undefined|TranslateResult
interface Validator { (value?: any): ValidatorResult }
type ValidateResult = boolean|undefined

const defaultValidator = () => undefined;

function useValueValidator<T = any>(
    value: T,
    validator: Validator = defaultValidator,
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

    return {
        value: computed<UnwrapRef<T>>(() => valueRef.value),
        isInvalid,
        invalidText,
        setValue,
        reset,
        resetValidation,
    };
}


/**
 * @param _forms: set of form input data. object.
 * @param validators: set of validators. object.
 * properties are keys of _forms parameter, and values are validators.
 * if validator is not given to a property, it's validation result is always true.
 * [Validator result]
 * validators can return boolean, string or undefined.
 * when it returns boolean, true means valid, and false means invalid.
 * when it returns string, empty string means valid, and others mean invalid.
 * when it returns undefined, it means nothing. invalid state is just undefined.
 * @param immediate:
 *  whether to start validation immediately or not. boolean.
 *  if it's false, it starts validation when value is updated at least once.
 *  default: false
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

type invalidState<T> = {
    [K in keyof T]: ComputedRef<ValidateResult>
}

type Resets<T> = {
    [K in keyof T]: () => void
}

export function useFormValidator<T extends Record<string, any> = any>(
    _forms: T,
    validators: Partial<Validators<T>>,
    immediate = false,
) {
    const formKeys: Array<keyof T> = Object.keys(_forms);

    const forms = {} as Forms<T>;
    const valueSetters = {} as ValueSetters<T>;
    const invalidTexts = {} as InvalidTexts<T>;
    const invalidState = {} as invalidState<T>;
    const resets = {} as Resets<T>;
    const resetValidationMap = {} as Resets<T>;


    formKeys.forEach((key) => {
        const validator = validators[key];

        const {
            value, setValue, isInvalid, invalidText, reset, resetValidation,
        } = useValueValidator(_forms[key], validator, immediate);

        forms[key] = value;
        valueSetters[key] = setValue;
        invalidTexts[key] = invalidText;
        invalidState[key] = isInvalid;
        resets[key] = reset;
        resetValidationMap[key] = resetValidation;
    });

    const isAllValid = computed<ValidateResult>(() => {
        let result: ValidateResult;
        Object.values(invalidState).some((isInvalid) => {
            if (result === undefined && isInvalid.value === undefined) result = undefined;
            else result = !isInvalid.value;
            return result === false;
        });
        return result;
    });

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

    return {
        forms,
        invalidState,
        invalidTexts,
        isAllValid,
        setForm,
        resetAll,
        resetValidations,
    };
}
