import type {
    TASK_MANAGEMENT_TEMPLATE_TYPES,
} from '@/services/ops-flow/task-management-templates/constants/task-management-template-constant';

export type TaskManagementTemplateType = typeof TASK_MANAGEMENT_TEMPLATE_TYPES[number];
