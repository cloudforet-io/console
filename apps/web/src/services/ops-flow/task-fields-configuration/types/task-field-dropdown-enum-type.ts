import type { TaskFieldEnum } from '@/schema/opsflow/_types/task-field-type';

export interface ControllableTaskFieldEnum extends TaskFieldEnum {
    _id: string;
}
