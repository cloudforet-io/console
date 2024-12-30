import { reactive } from 'vue';

import { defineStore } from 'pinia';

import type { UserGroupChannelScheduleInfoType } from '@/schema/alert-manager/user-group-channel/type';

interface NotificationChannelCreateFormState {
    selectedProtocol: {
      name: string;
      protocol_id: string;
    };
    protocolSchemaForm: Record<string, any>;
    channelName: string;
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
        scheduleInfo: {
            SCHEDULE_TYPE: 'WEEK_DAY',
            TIMEZONE: 'UTC',
            MON: {
                is_scheduled: true,
            },
            TUE: {
                is_scheduled: true,
            },
            WED: {
                is_scheduled: true,
            },
            THU: {
                is_scheduled: true,
            },
            FRI: {
                is_scheduled: true,
            },
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
            state.scheduleInfo = {
                SCHEDULE_TYPE: 'WEEK_DAY',
                TIMEZONE: 'UTC',
                MON: {
                    is_scheduled: true,
                },
                TUE: {
                    is_scheduled: true,
                },
                WED: {
                    is_scheduled: true,
                },
                THU: {
                    is_scheduled: true,
                },
                FRI: {
                    is_scheduled: true,
                },
            };
        },
    };

    return {
        state,
        ...actions,
    };
});
