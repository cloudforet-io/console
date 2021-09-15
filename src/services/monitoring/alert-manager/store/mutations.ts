import { Mutation } from 'vuex';
import { AlertStoreState } from '@/services/monitoring/alert-manager/store/type';
import { AlertDataModel } from '@/services/monitoring/alert-manager/type';

export const setAlertData: Mutation<AlertStoreState> = (state, alertData: Partial<AlertDataModel>) => {
    state.alertData = alertData;
};
