import type { AlertState, AlertUrgency } from '@/schema/monitoring/alert/type';

export interface AlertUpdateParameters {
    alert_id: string;
    title?: string;
    state?: AlertState;
    description?: string;
    reset_description?: boolean;
    urgency?: AlertUrgency;
    project_id?: string;
}
