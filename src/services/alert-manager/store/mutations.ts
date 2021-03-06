import { Mutation } from 'vuex';
import { AlertStoreState } from '@/services/alert-manager/store/type';
import { AlertDataModel } from '@/services/alert-manager/type';

export const setAlertData: Mutation<AlertStoreState> = (state, alertData: Partial<AlertDataModel>) => {
    state.alertData = alertData;
};
