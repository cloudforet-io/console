import type { AlertResourcesType, AlertSeverityType, AlertUrgencyType } from '@/api-clients/alert-manager/alert/schema/type';

export interface AlertCreateParameters {
    title: string;
    description?: string;
    urgency?: AlertUrgencyType;
    severity?: AlertSeverityType;
    rule?: string;
    image_url?: string;
    resources?: AlertResourcesType[];
    additional_info?: Record<string, any>;
    service_id: string;
}
