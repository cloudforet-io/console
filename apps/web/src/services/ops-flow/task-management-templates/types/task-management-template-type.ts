import type {
    TASK_MANAGEMENT_TEMPLATE_TYPES,
} from '@/services/ops-flow/task-management-templates/constants/task-management-template-constant';

export type TaskManagementTemplateType = typeof TASK_MANAGEMENT_TEMPLATE_TYPES[number];

export interface TaskManagementTemplate {
    TemplateName: string;
    Task: string;
    TaskType: string;
    TaskBoard: string;
    TaskCategory: string;
    taskTypes: string;
    taskType: string;
    task: string;
    tasks: string;
    landingDescription?: string;
}
