import type { TaskField } from '@/schema/opsflow/_types/task-field-type';

import type { Attachment } from '@/common/components/editor/extensions/image/type';

export interface TaskFieldFormProps<TField extends TaskField, TValue> {
  field: TField;
  value: TValue;
  readonly?: boolean;
  attachments?: Attachment[];
}
export interface TaskFieldFormEmits<TValue> {
  (event: 'update:value', value: TValue): void;
  (event: 'update:is-valid', value: boolean): void;
}
