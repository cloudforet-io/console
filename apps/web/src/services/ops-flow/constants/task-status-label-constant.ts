import type { TaskStatusType } from '@/schema/opsflow/task/type';

export const TASK_STATUS_LABELS: Record<TaskStatusType, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
};
