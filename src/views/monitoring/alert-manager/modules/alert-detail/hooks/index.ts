import { ComponentRenderProxy, getCurrentInstance, reactive } from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import { EDIT_MODE } from '@/views/monitoring/alert-manager/lib/config';

interface AlertDetailItemState {
	isEditMode: boolean;
	alertId: string;
	projectChannelId?: string;
	dataForUpdate?: any;
}

interface ParamType {
	alert_id: string;
	description?: string;
	status_message?: string;
	project_id?: string;
}

export const useAlertDetailItem = (obj: AlertDetailItemState) => {
    const vm = getCurrentInstance() as ComponentRenderProxy;
    const state = reactive<AlertDetailItemState>(obj);
    const cancelEdit = () => {
        state.isEditMode = false;
    };

    const startEdit = () => {
        state.isEditMode = true;
    };

    const getParams = (editMode: EDIT_MODE) => {
        const param = {} as ParamType;
        param.alert_id = state.alertId;
        if (editMode === EDIT_MODE.DESCRIPTION) param.description = state.dataForUpdate;
        else if (editMode === EDIT_MODE.STATUS_MSG) param.status_message = state.dataForUpdate;
        else if (editMode === EDIT_MODE.PROJECT) param.project_id = state.dataForUpdate;
        return param;
    };
    const updateAlert = async (editMode: EDIT_MODE) => {
        try {
            await SpaceConnector.client.monitoring.alert.update(getParams(editMode));
            showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_S_UPDATE_DESCRIPTION'), '', vm.$root);
            state.isEditMode = false;
        } catch (e) {
            console.error(e);
            showErrorMessage(i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_E_UPDATE_DESCRIPTION'), e, vm.$root);
        }
    };

    const onClickSave = async (editMode: EDIT_MODE) => {
        await updateAlert(editMode);
        vm.$emit('update');
    };


    return {
        state,
        cancelEdit,
        startEdit,
        updateAlert,
        onClickSave,
    };
};
