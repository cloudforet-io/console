import { Getter } from 'vuex';
import { AlertState } from '@/services/alert-manager/store/alert/type';

export const alertId: Getter<AlertState, any> = (state): string|undefined => state.alertData?.alert_id;
