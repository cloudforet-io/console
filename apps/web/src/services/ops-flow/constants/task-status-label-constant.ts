import type { TaskStatusType } from '@/api-clients/opsflow/task/schema/type';

export const TASK_STATUS_LABELS: Record<TaskStatusType, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
};
