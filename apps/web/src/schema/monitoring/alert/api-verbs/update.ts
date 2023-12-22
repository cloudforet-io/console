import type { AlertState, AlertUrgency } from '@/schema/monitoring/alert/model';

export interface AlertUpdateParameters {
    alert_id: string;
    title?: string;
    state?: AlertState;
    description?: string;
    urgency?: AlertUrgency;
    project_id: string;
}
