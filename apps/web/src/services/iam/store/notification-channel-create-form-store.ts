import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { defineStore } from 'pinia';

import type { UserGroupChannelScheduleType } from '@/schema/alert-manager/user-group-channel/type';

interface UserInfoType {
    type: 'ALL_MEMBERS' | 'USER' | 'USER_GROUP';
    value: string[];
}

interface ScheduleInfoType {
    days: (string|null)[];
    start: number;
    end: number;
    type: UserGroupChannelScheduleType
}

interface NotificationChannelCreateFormState {
    currentStep: number;
    selectedProtocol: string | { icon: string; label: TranslateResult | string; };
    channelName: string;
//     TODO: about channel info
    userInfo: UserInfoType;
    scheduleInfo: ScheduleInfoType;
}

export const useNotificationChannelCreateFormStore = defineStore('channel-create-form', () => {
    const state = reactive<NotificationChannelCreateFormState>({
        currentStep: 1,
        selectedProtocol: '',
        channelName: '',
        userInfo: {
            type: 'ALL_MEMBERS',
            value: [],
        },
        scheduleInfo: {
            days: [],
            start: 0,
            end: 0,
            type: 'ALL_DAY',
        },
    });

    const actions = {
        initState() {
            state.currentStep = 1;
            state.selectedProtocol = '';
            state.channelName = '';
            state.userInfo = {
                type: 'ALL_MEMBERS',
                value: [],
            };
            state.scheduleInfo = {
                days: [],
                start: 0,
                end: 0,
                type: 'ALL_DAY',
            };
        },
        setCurrentStep(step: number) {
            state.currentStep = step;
        },
        setSelectedProtocol(protocol: string | { icon: string; label: TranslateResult | string }) {
            state.selectedProtocol = protocol;
        },
        setChannelName(name: string) {
            state.channelName = name;
        },
        setUserInfo(userInfo: UserInfoType) {
            state.userInfo = userInfo;
        },
        setScheduleInfo(scheduleInfo: ScheduleInfoType) {
            state.scheduleInfo = scheduleInfo;
        },
    };

    return {
        state,
        ...actions,
    };
});
