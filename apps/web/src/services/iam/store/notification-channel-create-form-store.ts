import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ServiceChannelForwardType, ServiceChannelScheduleInfoType } from '@/schema/alert-manager/service-channel/type';

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
    scheduleInfo: ServiceChannelScheduleInfoType;
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
            MON: { is_scheduled: false, start: 9, end: 18 },
            TUE: { is_scheduled: false, start: 9, end: 18 },
            WED: { is_scheduled: false, start: 9, end: 18 },
            THU: { is_scheduled: false, start: 9, end: 18 },
            FRI: { is_scheduled: false, start: 9, end: 18 },
            SAT: { is_scheduled: false, start: 9, end: 18 },
            SUN: { is_scheduled: false, start: 9, end: 18 },
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
