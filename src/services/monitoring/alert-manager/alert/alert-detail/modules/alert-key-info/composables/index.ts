import {
    ComponentRenderProxy, ComputedRef, getCurrentInstance, reactive,
} from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import { EDIT_MODE } from '@/services/monitoring/alert-manager/lib/config';
import { cloneDeep } from 'lodash';
import { store } from '@/store';

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
	reset_description?: boolean;
}

export const useAlertInfoItem = (obj: AlertDetailItemState) => {
    const vm = getCurrentInstance() as ComponentRenderProxy;
    const state = reactive<AlertDetailItemState>(obj);
    const cancelEdit = (initialData) => {
        state.isEditMode = false;
        if (typeof initialData === 'object') {
            state.dataForUpdate = cloneDeep(initialData);
        } else {
            state.dataForUpdate = initialData;
        }
    };

    const startEdit = (initialData) => {
        state.isEditMode = true;
        if (typeof initialData === 'object') {
            state.dataForUpdate = cloneDeep(initialData);
        } else {
            state.dataForUpdate = initialData;
        }
    };

    const getMessage = (editMode: EDIT_MODE, isSuccessful: boolean) => {
        if (isSuccessful) {
            return editMode === EDIT_MODE.DESCRIPTION ? i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_S_UPDATE_DESCRIPTION') : i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_S_UPDATE_PROJECT');
        }
        return editMode === EDIT_MODE.PROJECT ? i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_E_UPDATE_DESCRIPTION') : i18n.t('MONITORING.ALERT.DETAIL.INFO.ALT_E_UPDATE_PROJECT');
    };

    const getParams = (editMode: EDIT_MODE) => {
        const param = {} as ParamType;

        if (editMode === EDIT_MODE.DESCRIPTION) {
            const isEmptyInput = state.dataForUpdate.trim().length === 0;
            param.description = state.dataForUpdate;
            param.reset_description = isEmptyInput;
        } else if (editMode === EDIT_MODE.PROJECT) param.project_id = state.dataForUpdate;
        return param;
    };
    const updateAlert = async (editMode: EDIT_MODE) => {
        try {
            await store.dispatch('service/alert/updateAlertData', {
                updateParams: getParams(editMode),
                alertId: state.alertId,
            });
            showSuccessMessage(getMessage(editMode, true), '', vm.$root);
            state.isEditMode = false;
        } catch (e) {
            console.error(e);
            showErrorMessage(getMessage(editMode, false), e, vm.$root);
        }
    };

    const onClickSave = async (editMode: EDIT_MODE) => {
        await updateAlert(editMode);
    };


    return {
        state,
        cancelEdit,
        startEdit,
        updateAlert,
        onClickSave,
    };
};
