export type TaskStatusType = 'TODO'|'IN_PROGRESS'|'COMPLETE';
export interface TaskStatusOption {
    status_id: string;
    name: string;
    color: string;
    is_default: boolean;
}
export type TaskStatusOptions = Record<TaskStatusType, TaskStatusOption[]>;
export type TaskPriority = 'LOW'|'MEDIUM'|'HIGH';
