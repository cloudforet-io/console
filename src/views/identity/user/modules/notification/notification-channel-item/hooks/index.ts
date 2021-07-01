import {
    EDIT_TYPE,
    PARAM_KEY_TYPE,
    ParamType,
} from '@/views/identity/user/modules/notification/notification-channel-item/type';
import { ComponentRenderProxy, getCurrentInstance, reactive } from '@vue/composition-api';
import { cloneDeep } from 'lodash';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';

interface NotificationItemState {
	isEditMode: boolean;
	dataForEdit?: any;
	userChannelId?: string;
	projectChannelId?: string;
}
export const useNotificationItem = (obj: NotificationItemState) => {
    const vm = getCurrentInstance() as ComponentRenderProxy;
    const state = reactive<NotificationItemState>(obj);
    const cancelEdit = (initialData) => {
        state.isEditMode = false;
        if (typeof initialData === 'object') {
            state.dataForEdit = cloneDeep(initialData);
        } else {
            state.dataForEdit = initialData;
        }
        vm.$emit('edit', undefined);
    };

    const startEdit = (value, initialData) => {
        state.isEditMode = true;
        if (typeof initialData === 'object') {
            state.dataForEdit = cloneDeep(initialData);
        } else {
            state.dataForEdit = initialData;
        }
        vm.$emit('edit', value);
    };

    const updateUserChannel = async (paramKey, paramValue) => {
        try {
            const param: ParamType = {
                user_channel_id: state.userChannelId,
            };
            if (paramKey === PARAM_KEY_TYPE.NAME) param.name = paramValue;
            else if (paramKey === PARAM_KEY_TYPE.DATA) param.data = paramValue;
            await SpaceConnector.client.notification.userChannel.update(param);
            showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_USER_CHANNEL'), '', vm.$root);
            state.isEditMode = false;
            vm.$emit('edit', undefined);
        } catch (e) {
            console.error(e);
            showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_USER_CHANNEL'), e, vm.$root);
        }
    };

    const updateProjectChannel = async (paramKey, paramValue) => {
        try {
            const param: ParamType = {
                // eslint-disable-next-line camelcase
                project_channel_id: state.projectChannelId,
            };
            if (paramKey === PARAM_KEY_TYPE.NAME) param.name = paramValue;
            else if (paramKey === PARAM_KEY_TYPE.DATA) param.data = paramValue;
            // eslint-disable-next-line camelcase
            else if (paramKey === PARAM_KEY_TYPE.LEVEL) param.notification_level = paramValue;
            await SpaceConnector.client.notification.projectChannel.update(param);
            showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_PROJECT_CHANNEL'), '', vm.$root);
            state.isEditMode = false;
            vm.$emit('edit', undefined);
        } catch (e) {
            console.error(e);
            showErrorMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_PROJECT_CHANNEL'), e, vm.$root);
        }
    };


    return {
        state,
        cancelEdit,
        startEdit,
        updateUserChannel,
        updateProjectChannel,
    };
};
