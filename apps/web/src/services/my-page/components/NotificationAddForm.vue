<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PPaneLayout,
} from '@cloudforet/mirinae';


import type { UserChannelCreateParameters } from '@/schema/alert-manager/user-channel/api-verbs/create';
import type { NotificationLevel } from '@/schema/notification/notification/type';
import type { ProjectChannelCreateParameters } from '@/schema/notification/project-channel/api-verbs/create';
import type { ChannelSchedule } from '@/schema/notification/type';
import type { UserChannelCreateParameters as UserChannelCreateParametersV1 } from '@/schema/notification/user-channel/api-verbs/create';
import { i18n } from '@/translations';

import { useGlobalConfigUiAffectsSchema } from '@/lib/config/global-config/composables/use-global-config-ui-affects-schema';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ErrorHandler from '@/common/composables/error/errorHandler';

import NotificationAddFormData from '@/services/my-page/components/NotificationAddFormData.vue';
import NotificationAddSchedule from '@/services/my-page/components/NotificationAddSchedule.vue';
import NotificationAddTopic from '@/services/my-page/components/NotificationAddTopic.vue';
import type { NotificationAddFormDataPayload, NotificationAddFormTopicPayload, NotificationAddFormSchedulePayload } from '@/services/my-page/types/notification-add-form-type';

const props = withDefaults(defineProps<{
    projectId?: string;
    protocolType: string;
    protocolId: string;
}>(), {
    projectId: '',
    protocolType: '',
    protocolId: '',
});

const router = useRouter();
const alertManagerUiAffectsSchema = useGlobalConfigUiAffectsSchema('ALERT_MANAGER');

const state = reactive({
    visibleUserNotification: computed<boolean>(() => alertManagerUiAffectsSchema.value?.visibleUserNotification ?? false),
    isDataValid: false,
    notificationLevel: 'LV1' as NotificationLevel,
    //
    channelName: '',
    data: {},
    topicMode: false,
    topicList: [] as string[],
    isTopicValid: true,
    //
    schedule: undefined as ChannelSchedule|undefined,
    isScheduled: false,
    isScheduleValid: true,

    // V2
    schemaForm: {},
    scheduleSettingData: {},
    isInputValid: false,
});

const createUserChannel = async () => {
    try {
        const fetcher = state.visibleUserNotification
            ? SpaceConnector.clientV2.alertManager.userChannel.create<UserChannelCreateParameters>({
                protocol_id: props.protocolId,
                name: state.channelName,
                schedule: state.scheduleSettingData,
                data: state.schemaForm,
                tags: {},
            }) : SpaceConnector.clientV2.notification.userChannel.create<UserChannelCreateParametersV1>({
                protocol_id: props.protocolId,
                name: state.channelName,
                data: state.data,
                is_subscribe: state.topicMode,
                subscriptions: state.topicList,
                schedule: state.schedule,
                is_scheduled: state.isScheduled,
            });
        await fetcher;
        showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_CREATE_USER_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_CREATE_USER_CHANNEL'));
    }
};

const createProjectChannel = async () => {
    try {
        await SpaceConnector.clientV2.notification.projectChannel.create<ProjectChannelCreateParameters>({
            protocol_id: props.protocolId,
            name: state.channelName,
            data: state.data,
            is_subscribe: state.topicMode,
            subscriptions: state.topicList,
            schedule: state.schedule,
            is_scheduled: state.isScheduled,
            notification_level: state.notificationLevel,
            project_id: props.projectId,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_S_CREATE_PROJECT_CHANNEL'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.NOTIFICATION.FORM.ALT_E_CREATE_PROJECT_CHANNEL'));
    }
};

const onClickSave = async () => {
    try {
        if (!state.visibleUserNotification && props.projectId) await createProjectChannel();
        else await createUserChannel();
        router.back();
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const onChangeData = (value: NotificationAddFormDataPayload) => {
    state.channelName = value.channelName;
    state.notificationLevel = value.level;
    state.isDataValid = value.isValid;
    if (!state.visibleUserNotification) {
        state.data = value.data;
    }
    state.schemaForm = value.data;
    state.isInputValid = value.isValid;
};

const onChangeSchedule = (schedule_value: ScheduleSettingFormType) => {
    state.scheduleSettingData = schedule_value;
};

const onChangeScheduleV1 = ({ schedule, is_scheduled, isScheduleValid }: NotificationAddFormSchedulePayload) => {
    state.schedule = schedule;
    state.isScheduled = is_scheduled;
    state.isScheduleValid = isScheduleValid;
};

const onChangeTopic = ({ topicMode, selectedTopic, isTopicValid }: NotificationAddFormTopicPayload) => {
    state.topicMode = topicMode;
    state.topicList = selectedTopic;
    state.isTopicValid = isTopicValid;
};
</script>

<template>
    <div>
        <section class="content-list-wrapper">
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.BASE_INFO') }}
                </h3>
                <notification-add-form-data :project-id="props.projectId"
                                            :protocol-type="props.protocolType"
                                            :protocol-id="props.protocolId"
                                            :visible-user-notification="state.visibleUserNotification"
                                            @change="onChangeData"
                />
            </p-pane-layout>
            <p-pane-layout class="content-wrapper">
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') }}
                </h3>
                <h4 class="sub-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
                </h4>
                <notification-add-schedule :visible-user-notification="state.visibleUserNotification"
                                           @changeV1="onChangeScheduleV1"
                                           @change="onChangeSchedule"
                />
            </p-pane-layout>
            <p-pane-layout v-if="!state.visibleUserNotification"
                           class="content-wrapper"
            >
                <h3 class="content-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') }}
                </h3>
                <h4 class="sub-title">
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.SETTING_MODE') }}
                </h4>
                <notification-add-topic @change="onChangeTopic" />
            </p-pane-layout>
        </section>
        <div class="button-group">
            <p-button style-type="tertiary"
                      class="text-button"
                      @click="$router.go(-1)"
            >
                {{ $t('COMMON.TAGS.CANCEL') }}
            </p-button>
            <p-button v-if="!state.visibleUserNotification"
                      style-type="primary"
                      class="text-button"
                      :disabled="!state.isDataValid || !state.isScheduleValid || !state.isTopicValid"
                      @click="onClickSave"
            >
                {{ $t('COMMON.TAGS.SAVE') }}
            </p-button>
            <p-button v-else
                      style-type="primary"
                      class="text-button"
                      :disabled="!state.isInputValid"
                      @click="onClickSave"
            >
                {{ $t('COMMON.TAGS.SAVE') }}
            </p-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.content-list-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
}
.button-group {
    display: flex;
    justify-content: flex-end;
    .text-button {
        margin-left: 1rem;
    }
}
.content-wrapper {
    padding: 2rem 1rem 2.5rem;
}
.content-title {
    font-size: 1.5rem;
    line-height: 135%;
}
.sub-title {
    @apply font-bold;
    font-size: 0.875rem;
    line-height: 140%;
    margin-top: 1.25rem;
    margin-bottom: 0.375rem;
}
</style>
