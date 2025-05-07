// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { UserChannelUpdateParameters } from '@/schema/alert-manager/user-channel/api-verbs/update';
import type { UserChannelModel } from '@/schema/alert-manager/user-channel/model';
import type { NotificationLevel } from '@/schema/notification/notification/type';
import type { ProjectChannelUpdateParameters } from '@/schema/notification/project-channel/api-verbs/update';
import type { UserChannelUpdateParameters as UserChannelUpdateParametersV1 } from '@/schema/notification/user-channel/api-verbs/update';
import { i18n } from '@/translations';

import { useGlobalConfigUiAffectsSchema } from '@/lib/config/global-config/composables/use-global-config-ui-affects-schema';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface NotificationItemState<Data> {
    visibleUserNotification: boolean;
	isEditMode: boolean;
	dataForEdit?: Data;
	userChannelId?: string;
	projectChannelId?: string;
}
type Emit<Data> = {
    (event: 'edit', value?: Data): void;
};

export const useNotificationItem = <Data>(_state: NotificationItemState<Data>, emit: Emit<Data>) => {
    const alertManagerUiAffectsSchema = useGlobalConfigUiAffectsSchema('ALERT_MANAGER');

    const state = reactive({
        visibleUserNotification: computed<boolean>(() => alertManagerUiAffectsSchema.value?.visibleUserNotification ?? false),
        isEditMode: _state.isEditMode,
        dataForEdit: _state.dataForEdit,
        userChannelId: _state.userChannelId,
        projectChannelId: _state.projectChannelId,
    }) as NotificationItemState<Data>;
    const cancelEdit = (initialData: Data) => {
        state.isEditMode = false;
        if (typeof initialData === 'object') {
            state.dataForEdit = cloneDeep(initialData);
        } else {
            state.dataForEdit = initialData;
        }
        emit('edit', undefined);
    };

    const startEdit = (value: any, initialData?: Data) => {
        state.isEditMode = true;
        if (typeof initialData === 'object') {
            state.dataForEdit = cloneDeep(initialData);
        } else {
            state.dataForEdit = initialData;
        }
        emit('edit', value);
    };

    const updateUserChannel = async <Key extends keyof (Partial<UserChannelUpdateParametersV1>
        &Partial<UserChannelUpdateParameters>) = 'name'|'data'|'schedule'>(paramKey: Key, paramValue: (Partial<UserChannelUpdateParametersV1> & Partial<UserChannelUpdateParameters>)[Key]) => {
        try {
            if (!state.userChannelId) throw new Error('userChannelId is undefined');
            const paramV1: UserChannelUpdateParametersV1 = {
                user_channel_id: state.userChannelId,
            };
            const param: UserChannelUpdateParameters = {
                channel_id: state.userChannelId,
            };
            if (paramKey === 'name') {
                paramV1.name = paramValue as string;
                param.name = paramValue as string;
            } else if (paramKey === 'data') {
                paramV1.data = paramValue as object;
                param.data = paramValue as object;
            } else if (paramKey === 'schedule') {
                param.schedule = paramValue;
            }
            const fetcher = state.visibleUserNotification
                ? SpaceConnector.clientV2.alertManager.userChannel.update<UserChannelUpdateParameters, UserChannelModel>(param)
                : SpaceConnector.clientV2.notification.userChannel.update<UserChannelUpdateParametersV1>(paramV1);
            await fetcher;
            showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_USER_CHANNEL'), '');
            state.isEditMode = false;
            emit('edit', undefined);
        } catch (e) {
            ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_USER_CHANNEL'));
        }
    };

    const updateProjectChannel = async <Key extends keyof ProjectChannelUpdateParameters = 'name'|'data'|'notification_level'>(paramKey: Key, paramValue: ProjectChannelUpdateParameters[Key]) => {
        try {
            if (!state.projectChannelId) throw new Error('projectChannelId is undefined');
            const param: ProjectChannelUpdateParameters = {
                project_channel_id: state.projectChannelId,
            };
            if (paramKey === 'name') param.name = paramValue as string;
            else if (paramKey === 'data') param.data = paramValue as object;
            else if (paramKey === 'notification_level') param.notification_level = paramValue as NotificationLevel;
            await SpaceConnector.clientV2.notification.projectChannel.update<ProjectChannelUpdateParameters>(param);
            showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_UPDATE_PROJECT_CHANNEL'), '');
            state.isEditMode = false;
            emit('edit', undefined);
        } catch (e) {
            ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_UPDATE_PROJECT_CHANNEL'));
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
