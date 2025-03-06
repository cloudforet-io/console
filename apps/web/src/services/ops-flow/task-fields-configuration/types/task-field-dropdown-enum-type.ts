import type { TaskFieldEnum } from '@/api-clients/opsflow/_types/task-field-type';

export interface ControllableTaskFieldEnum extends TaskFieldEnum {
    _id: string;
}
export type InvalidType = 'KEY_REQUIRED' | 'KEY_DUPLICATED' | 'NAME_REQUIRED';
export interface ValidationInfo {
    isValid?: boolean; // undefined means not touched
    invalidTypes: InvalidType[];
    touched: boolean;
}
