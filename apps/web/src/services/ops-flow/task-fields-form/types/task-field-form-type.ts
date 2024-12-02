import type { TaskField } from '@/schema/opsflow/_types/task-field-type';

export interface TaskFieldFormProps<TField extends TaskField, TValue> {
  field: TField;
  value: TValue;
}
export interface TaskFieldFormEmits<TValue> {
  (event: 'update:value', value: TValue): void;
  (event: 'update:is-valid', value: boolean): void;
}
