import type { AlertUrgency } from '@/schema/monitoring/alert/model';

export interface AlertCreateParameters {
    title: string;
    project_id: string;
    description?: string;
    assignee?: string;
    urgency?: AlertUrgency;
}
