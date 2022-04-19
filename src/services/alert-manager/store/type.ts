import { Store } from 'vuex';
import { AlertState } from '@/services/alert-manager/store/alert/type';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AlertManagerState {}

export type AlertManagerStore = Store<AlertManagerState & {
    alert: AlertState;
}>
