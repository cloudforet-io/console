import type { AlertState } from '@/api-clients/monitoring/alert/schema/type';

export interface AlertUpdateStateParameters {
    alert_id: string;
    access_key: string;
    state: AlertState;
}
