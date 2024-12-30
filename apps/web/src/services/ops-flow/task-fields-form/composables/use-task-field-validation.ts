import type { Ref, UnwrapRef } from 'vue';
import { watch } from 'vue';

import { isEqual } from 'lodash';

import type { TaskField, TaskFieldType } from '@/schema/opsflow/_types/task-field-type';
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
const stringArrayValidatorTypes: TaskFieldType[] = ['LABELS', 'DROPDOWN', 'USER', 'PROJECT']; // , 'PROVIDER', 'SERVICE_ACCOUNT', 'ASSET'];
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
        if (typeof props.field.options?.maxLength === 'number' && val.length > props.field.options.maxLength) {
            return i18n.t('OPSFLOW.VALIDATION.VALUE_TOO_LONG', { length: props.field.options.maxLength }) as string;
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
            return true;
        }
        // MULTI case
        if (props.field.is_required && val.length === 0) {
            return i18n.t('OPSFLOW.VALIDATION.FIELD_REQUIRED') as string;
        }
        return true;
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
