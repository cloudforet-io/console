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
        return undefined;
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

    return {
        value: computed<UnwrapRef<T>>(() => valueRef.value),
        isInvalid,
        invalidText,
        setValue,
    };
}


/**
 * @param _forms: set of form input data. object.
 * @param validators: set of validators. object.
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


    formKeys.forEach((key) => {
        const validator = validators[key];

        const {
            value, setValue, isInvalid, invalidText,
        } = useValueValidator(_forms[key], validator, immediate);

        forms[key] = value;
        valueSetters[key] = setValue;
        invalidTexts[key] = invalidText;
        invalidState[key] = isInvalid;
    });

    const setForm = (key: keyof T, value: T[keyof T]) => {
        const setter = valueSetters[key];
        if (setter) setter(value);
    };

    const isAllValid = computed(() => Object.values(invalidState).every(state => !state.value));


    return {
        forms,
        invalidState,
        invalidTexts,
        setForm,
        isAllValid,
    };
}
