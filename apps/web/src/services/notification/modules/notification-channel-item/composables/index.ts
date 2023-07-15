import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { cloneDeep } from 'lodash';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';



import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { ParamType } from '@/services/notification/modules/notification-channel-item/type';
import {
    PARAM_KEY_TYPE,
} from '@/services/notification/modules/notification-channel-item/type';


interface NotificationItemState {
	isEditMode: boolean;
	dataForEdit?: any;
	userChannelId?: string;
	projectChannelId?: string;
}
type NotificationEmitEvent = (e: 'edit', value?: any) => void;

export const useNotificationItem = (obj: NotificationItemState, emit: NotificationEmitEvent) => {
    const { t } = useI18n();
    const state = reactive<NotificationItemState>(obj);
    const cancelEdit = (initialData) => {
        state.isEditMode = false;
        if (typeof initialData === 'object') {
            state.dataForEdit = cloneDeep(initialData);
        } else {
            state.dataForEdit = initialData;
        }
        emit('edit', undefined);
    };

    const startEdit = (value, initialData) => {
        state.isEditMode = true;
        if (typeof initialData === 'object') {
            state.dataForEdit = cloneDeep(initialData);
        } else {
            state.dataForEdit = initialData;
        }
        emit('edit', value);
    };

    const updateUserChannel = async (paramKey, paramValue) => {
        try {
            const param: ParamType = {
                user_channel_id: state.userChannelId,
            };
            if (paramKey === PARAM_KEY_TYPE.NAME) param.name = paramValue;
            else if (paramKey === PARAM_KEY_TYPE.DATA) param.data = paramValue;
            await SpaceConnector.client.notification.userChannel.update(param);
            showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_USER_CHANNEL'), '');
            state.isEditMode = false;
            emit('edit', undefined);
        } catch (e) {
            ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_USER_CHANNEL'));
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
            showSuccessMessage(t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_PROJECT_CHANNEL'), '');
            state.isEditMode = false;
            emit('edit', undefined);
        } catch (e) {
            ErrorHandler.handleRequestError(e, t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_PROJECT_CHANNEL'));
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
