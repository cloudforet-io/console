import type { TASK_STATUS_COLOR_NAMES } from '@/schema/opsflow/task/constant';

export type TaskStatusType = 'TODO'|'IN_PROGRESS'|'COMPLETED';
type TaskStatusColorName = typeof TASK_STATUS_COLOR_NAMES[number];
export interface TaskStatusOption {
    status_id: string;
    name: string;
    color: TaskStatusColorName;
    is_default?: boolean;
}
export type TaskStatusOptions = Record<TaskStatusType, TaskStatusOption[]>;
export type TaskPriority = 'LOW'|'MEDIUM'|'HIGH';
