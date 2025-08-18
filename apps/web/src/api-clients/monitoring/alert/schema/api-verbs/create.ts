import type { AlertUrgency } from '@/api-clients/monitoring/alert/schema/type';

export interface AlertCreateParameters {
    title: string;
    project_id: string;
    description?: string;
    assignee?: string;
    urgency?: AlertUrgency;
}
