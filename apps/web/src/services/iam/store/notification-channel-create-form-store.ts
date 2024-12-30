import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ServiceChannelForwardType } from '@/schema/alert-manager/service-channel/type';
import type { UserGroupChannelScheduleInfoType } from '@/schema/alert-manager/user-group-channel/type';

interface UserInfoType {
    type: ServiceChannelForwardType
    value: string[] | undefined;
}

interface NotificationChannelCreateFormState {
    selectedProtocol: {
      name: string;
      protocol_id: string;
    };
    protocolSchemaForm: Record<string, any>;
    channelName: string;
    userInfo: UserInfoType;
    scheduleInfo: UserGroupChannelScheduleInfoType
}

export const useNotificationChannelCreateFormStore = defineStore('channel-create-form', () => {
    const state = reactive<NotificationChannelCreateFormState>({
        selectedProtocol: {
            name: '',
            protocol_id: '',
        },
        protocolSchemaForm: {},
        channelName: '',
        userInfo: {
            type: 'ALL_MEMBER',
            value: [],
        },
        scheduleInfo: {
            SCHEDULE_TYPE: 'ALL_DAY',
            TIMEZONE: 'UTC',
            MON: { is_scheduled: false, start: 0, end: 24 },
            TUE: { is_scheduled: false, start: 0, end: 24 },
            WED: { is_scheduled: false, start: 0, end: 24 },
            THU: { is_scheduled: false, start: 0, end: 24 },
            FRI: { is_scheduled: false, start: 0, end: 24 },
            SAT: { is_scheduled: false, start: 0, end: 24 },
            SUN: { is_scheduled: false, start: 0, end: 24 },
        },
    });

    const actions = {
        initState() {
            state.selectedProtocol = {
                name: '',
                protocol_id: '',
            };
            state.protocolSchemaForm = {};
            state.channelName = '';
            state.userInfo = {
                type: 'ALL_MEMBER',
                value: [],
            };
            state.scheduleInfo = {
                SCHEDULE_TYPE: 'ALL_DAY',
                TIMEZONE: 'UTC',
                MON: { is_scheduled: false, start: 9, end: 18 },
                TUE: { is_scheduled: false, start: 9, end: 18 },
                WED: { is_scheduled: false, start: 9, end: 18 },
                THU: { is_scheduled: false, start: 9, end: 18 },
                FRI: { is_scheduled: false, start: 9, end: 18 },
                SAT: { is_scheduled: false, start: 9, end: 18 },
                SUN: { is_scheduled: false, start: 9, end: 18 },
            };
        },
    };

    return {
        state,
        ...actions,
    };
});
