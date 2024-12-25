import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { defineStore } from 'pinia';

import type { ServiceChannelForwardType, ServiceChannelScheduleInfoType } from '@/schema/alert-manager/service-channel/type';

interface UserInfoType {
    type: ServiceChannelForwardType
    value: string[] | undefined;
}

interface NotificationChannelCreateFormState {
    currentStep: number;
    selectedProtocol: string | { icon: string; label: TranslateResult | string; };
    channelName: string;
//     TODO: about channel info
    userInfo: UserInfoType;
    scheduleInfo: ServiceChannelScheduleInfoType;
}

export const useNotificationChannelCreateFormStore = defineStore('channel-create-form', () => {
    const state = reactive<NotificationChannelCreateFormState>({
        currentStep: 1,
        selectedProtocol: '',
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
            state.currentStep = 1;
            state.selectedProtocol = '';
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
        setSelectedProtocol(protocol: string | { icon: string; label: TranslateResult | string }) {
            state.selectedProtocol = protocol;
        },
    };

    return {
        state,
        ...actions,
    };
});
