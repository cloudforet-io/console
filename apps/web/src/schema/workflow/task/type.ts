export type TaskStatusType = 'TODO'|'IN_PROGRESS'|'COMPLETE';
export interface TaskStatusOption {
    name: string;
    color: string;
    status_type: TaskStatusType;
}
