import type { AlertUrgencyType, AlertStateType } from '@/schema/alert-manager/alert/type';

export interface AlertUpdateParameters {
    alert_id: string;
    title?: string;
    state?: AlertStateType;
    description?: string;
    urgency?: AlertUrgencyType;
}
