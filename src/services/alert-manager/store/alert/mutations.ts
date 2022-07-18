import type { Mutation } from 'vuex';

import type { AlertState } from '@/services/alert-manager/store/alert/type';
import type { AlertDataModel } from '@/services/alert-manager/type';

export const setAlertData: Mutation<AlertState> = (state, alertData: Partial<AlertDataModel>) => {
    state.alertData = alertData;
};
