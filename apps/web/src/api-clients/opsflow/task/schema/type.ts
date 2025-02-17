import type { TASK_STATUS_COLOR_NAMES } from './constant';

export type TaskStatusType = 'TODO'|'IN_PROGRESS'|'COMPLETED';
export type TaskStatusColorName = typeof TASK_STATUS_COLOR_NAMES[number];
export interface TaskStatusOption {
    status_id: string;
    name: string;
    color: TaskStatusColorName;
    is_default?: boolean;
}
export type TaskStatusOptions = Record<TaskStatusType, TaskStatusOption[]>;
export interface TaskStatusOptionWithOptionalId extends Omit<TaskStatusOption, 'status_id'> {
    status_id?: string;
}
export type TaskPriority = 'LOW'|'MEDIUM'|'HIGH';
