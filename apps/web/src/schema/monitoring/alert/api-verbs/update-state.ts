import type { AlertState } from '@/schema/monitoring/alert/type';

export interface AlertUpdateStateParameters {
    alert_id: string;
    access_key: string;
    state: AlertState;
}
