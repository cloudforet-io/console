export interface TaskChangeStatusParameters {
    task_id: string;
    status: string;
    assignee?: string;
    comment?: string;
}
