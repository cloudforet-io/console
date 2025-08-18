import type { AlertState, AlertUrgency } from '@/api-clients/monitoring/alert/schema/type';

export interface AlertUpdateParameters {
    alert_id: string;
    title?: string;
    state?: AlertState;
    description?: string;
    urgency?: AlertUrgency;
    project_id?: string;
}
