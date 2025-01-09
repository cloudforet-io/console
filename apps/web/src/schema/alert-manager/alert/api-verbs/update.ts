import type { AlertUrgencyType, AlertStatusType } from '@/schema/alert-manager/alert/type';

export interface AlertUpdateParameters {
    alert_id: string;
    title?: string;
    status?: AlertStatusType;
    description?: string;
    urgency?: AlertUrgencyType;
}
