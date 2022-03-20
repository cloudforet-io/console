import { Getter } from 'vuex';
import { AlertStoreState } from '@/services/alert-manager/store/type';

export const alertId: Getter<AlertStoreState, any> = (state): string|undefined => state.alertData?.alert_id;
