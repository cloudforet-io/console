import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { AlertDataModel } from '@/services/monitoring/alert-manager/type';
import { UpdateAlertParams } from '@/services/monitoring/alert-manager/store/type';

export const getAlertData = async ({ commit }, alertId: string): Promise<void|Error> => {
    try {
        const alert: AlertDataModel = await SpaceConnector.client.monitoring.alert.get({
            alert_id: alertId,
        });
        commit('setAlertData', alert);
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }
};

export const updateAlertData = async ({ commit }, params: UpdateAlertParams): Promise<void|Error> => {
    try {
        const alert: AlertDataModel = await SpaceConnector.client.monitoring.alert.update({
            ...params.updateParams,
            alert_id: params.alertId,
        });
        commit('setAlertData', alert);
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }
};
