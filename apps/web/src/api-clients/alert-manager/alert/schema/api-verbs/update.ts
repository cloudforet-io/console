import type { AlertUrgencyType, AlertStatusType } from '@/api-clients/alert-manager/alert/schema/type';

export interface AlertUpdateParameters {
    alert_id: string;
    title?: string;
    status?: AlertStatusType;
    description?: string;
    urgency?: AlertUrgencyType;
}
