import type { TaskField, TaskFieldType } from '@/schema/opsflow/_types/task-field-type';

import type { ValidatorFn } from '@/common/composables/form-validator';
import { useFieldValidator } from '@/common/composables/form-validator';

import type { TaskFieldFormProps } from '@/services/ops-flow/task-fields-form/types/task-field-form-type';


const stringValidatorTypes: TaskFieldType[] = ['TEXT', 'PARAGRAPH', 'DATE'];
const stringArrayValidatorTypes: TaskFieldType[] = ['DROPDOWN', 'USER', 'PROJECT']; // , 'PROVIDER', 'SERVICE_ACCOUNT', 'ASSET'];
export const useTaskFieldValidation = <TField extends TaskField, TValue>(props: TaskFieldFormProps<TField, any>) => {
    const stringValidator: ValidatorFn<TValue> = (val): string|boolean => {
        if (val === undefined || val === null) {
            if (props.field.is_required) {
                return 'This field is required';
            }
            return true;
        }
        if (typeof val !== 'string') {
            return 'Value must be a string';
        }
        if (val.trim() === '') {
            return 'Value must not be empty';
        }
        return true;
    };

    const stringArrayValidator: ValidatorFn<TValue> = (val): string|boolean => {
        if (val === undefined || val === null) {
            if (props.field.is_required) {
                return 'This field is required';
            }
            return true;
        }
        if (!Array.isArray(val)) {
            return 'Value must be an array';
        }
        // SINGLE case
        if (!props.field.selection_type || props.field.selection_type === 'SINGLE') {
            if (val.length > 1) {
                return 'Only one value is allowed';
            }
            if (props.field.is_required && val.length === 0) {
                return 'This field is required';
            }
            return true;
        }
        // MULTI case
        if (props.field.is_required && val.length === 0) {
            return 'This field is required';
        }
        return true;
    };


    const fieldValidator = useFieldValidator<TValue>(props.value, (val) => {
        if (stringValidatorTypes.includes(props.field.field_type)) {
            return stringValidator(val);
        }
        if (stringArrayValidatorTypes.includes(props.field.field_type)) {
            return stringArrayValidator(val);
        }
        return 'Unsupported field type';
    });

    return {
        ...fieldValidator,
    };
};
