import type { Ref, UnwrapRef } from 'vue';
import { watch } from 'vue';

import { isEqual } from 'lodash';

import type { TaskField, TaskFieldType } from '@/api-clients/opsflow/_types/task-field-type';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { ValidatorFn } from '@/common/composables/form-validator';
import { useFieldValidator } from '@/common/composables/form-validator';

import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

type NotRef<T> = T extends Ref<any> ? never : T;
const stringValidatorTypes: TaskFieldType[] = ['TEXT', 'PARAGRAPH', 'DATE'];
const stringArrayValidatorTypes: TaskFieldType[] = ['LABELS', 'DROPDOWN', 'USER', 'ASSET', 'SERVICE_ACCOUNT']; // , 'PROVIDER'];
const stringOrStringArrayValidatorTypes: TaskFieldType[] = ['PROJECT'];
export const useTaskFieldValidation = <TField extends TaskField, TValue>(
    props: TaskFieldFormProps<TField, NotRef<TValue>>,
    emit: TaskFieldFormEmits<TValue>,
) => {
    const stringValidator: ValidatorFn<TValue> = (val): string|boolean => {
        if (val === undefined || val === null) {
            if (props.field.is_required) {
                return i18n.t('OPSFLOW.VALIDATION.FIELD_REQUIRED') as string;
            }
            return true;
        }
        if (typeof val !== 'string') {
            return i18n.t('OPSFLOW.VALIDATION.VALUE_STRING') as string;
        }
        if (props.field.is_required && val.trim() === '') {
            return i18n.t('OPSFLOW.VALIDATION.FIELD_REQUIRED') as string;
        }
        if (typeof props.field.options?.max_length === 'number' && val.length > props.field.options.max_length) {
            return i18n.t('OPSFLOW.VALIDATION.VALUE_TOO_LONG', { length: props.field.options.max_length }) as string;
        }
        if (props.field.options?.match_pattern && !new RegExp(props.field.options.match_pattern).test(val)) {
            return i18n.t('OPSFLOW.VALIDATION.INVALID_FORMAT', { format: props.field.options.match_pattern }) as string;
        }
        return true;
    };

    const stringArrayValidator: ValidatorFn<TValue> = (val): string|boolean => {
        if (val === undefined || val === null) {
            if (props.field.is_required) {
                return i18n.t('OPSFLOW.VALIDATION.FIELD_REQUIRED') as string;
            }
            return true;
        }
        if (!Array.isArray(val)) {
            return i18n.t('OPSFLOW.VALIDATION.VALUE_ARRAY') as string;
        }
        // SINGLE case
        if (!props.field.selection_type || props.field.selection_type === 'SINGLE') {
            if (val.length > 1) {
                return i18n.t('OPSFLOW.VALIDATION.VALUE_ONLY_ONE') as string;
            }
            if (props.field.is_required && val.length === 0) {
                return i18n.t('OPSFLOW.VALIDATION.FIELD_REQUIRED') as string;
            }
            if (props.field.options?.match_pattern && !new RegExp(props.field.options.match_pattern).test(val[0])) {
                return i18n.t('OPSFLOW.VALIDATION.INVALID_FORMAT', { format: props.field.options.match_pattern }) as string;
            }
            return true;
        }
        // MULTI case
        if (props.field.is_required && val.length === 0) {
            return i18n.t('OPSFLOW.VALIDATION.FIELD_REQUIRED') as string;
        }
        if (props.field.options?.match_pattern) {
            const pattern = props.field.options.match_pattern;
            const invalidValues = val.filter((v) => !new RegExp(pattern).test(v));
            if (invalidValues.length > 0) {
                return i18n.t('OPSFLOW.VALIDATION.INVALID_FORMAT', { format: props.field.options.match_pattern }) as string;
            }
        }
        return true;
    };

    const stringOrStringArrayValidator: ValidatorFn<TValue> = (val): string|boolean => {
        if (val === undefined) return !props.field.is_required;

        if (props.field.selection_type === 'MULTI') {
            if (!Array.isArray(val)) {
                return i18n.t('OPSFLOW.VALIDATION.VALUE_ARRAY') as string;
            }
            return stringArrayValidator(val) as string;
        }
        // SINGLE case
        return stringValidator(val) as string;
    };


    const {
        value: fieldValue,
        setValue: setFieldValue,
        invalidText, isInvalid, validationResult,
    } = useFieldValidator<TValue>(props.value, (val) => {
        if (stringValidatorTypes.includes(props.field.field_type)) {
            return stringValidator(val);
        }
        if (stringArrayValidatorTypes.includes(props.field.field_type)) {
            return stringArrayValidator(val);
        }
        if (stringOrStringArrayValidatorTypes.includes(props.field.field_type)) {
            return stringOrStringArrayValidator(val);
        }
        ErrorHandler.handleError(new Error(`Unsupported field type: ${props.field.field_type}`));
        return i18n.t('OPSFLOW.VALIDATION.UNSUPPORTED_FIELD_TYPE');
    });

    const updateFieldValue = (val: TValue) => {
        setFieldValue(val as UnwrapRef<TValue>);
        emit('update:value', val);
    };

    watch(() => props.value, (val) => {
        if (isEqual(val, fieldValue)) return;
        setFieldValue(val as UnwrapRef<TValue>);
    });
    watch(validationResult, (val: boolean) => {
        emit('update:is-valid', val);
    }, { immediate: true });

    return {
        fieldValue,
        setFieldValue,
        invalidText,
        isInvalid,
        isValid: validationResult,
        updateFieldValue,
    };
};
