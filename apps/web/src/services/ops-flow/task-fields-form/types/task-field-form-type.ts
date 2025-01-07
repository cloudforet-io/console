import type { FileModel } from '@/schema/file-manager/model';
import type { TaskField } from '@/schema/opsflow/_types/task-field-type';

export interface References {
  project_id?: string;
}
export interface TaskFieldFormProps<TField extends TaskField, TValue> {
  field: TField;
  value: TValue;
  readonly?: boolean;
  files?: FileModel[];
  references?: References;
}
export interface TaskFieldFormEmits<TValue> {
  (event: 'update:value', value: TValue): void;
  (event: 'update:file-ids', value: string[]): void;
  (event: 'update:is-valid', value: boolean): void;
}
