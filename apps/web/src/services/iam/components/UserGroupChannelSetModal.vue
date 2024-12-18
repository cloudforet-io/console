<script lang="ts" setup>
import { reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PButtonModal, PI, PButton } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type { UserGroupChannelCreateParameters } from '@/schema/alert-manager/user-group-channel/api-verbs/create';
import type { UserGroupChannelModel } from '@/schema/alert-manager/user-group-channel/model';
import type { UserGroupChannelScheduleType } from '@/schema/alert-manager/user-group-channel/type';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserGroupChannelScheduleSetForm from '@/services/iam/components/UserGroupChannelScheduleSetForm.vue';
import UserGroupChannelSetInputForm from '@/services/iam/components/UserGroupChannelSetInputForm.vue';
import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const emit = defineEmits<{(e: 'confirm'): void; }>();

interface ChannelSetModalState {
  loading: boolean;
  userInfo: {
    userMode: MenuItem;
    users: MenuItem[];
  };
  scheduleInfo: {
    days: string[];
    start: number;
    end: number;
    type: UserGroupChannelScheduleType;
  }
}

const state = reactive<ChannelSetModalState>({
    loading: false,
    userInfo: {
        userMode: {
            label: '',
            name: '',
        },
        users: [],
    },
    scheduleInfo: {
        days: [],
        start: 0,
        end: 0,
        type: 'ALL_DAY',
    },
});

const allDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

/* Component */
const handleConfirm = async () => {
    try {
        // TODO: need create | update channel division
        state.loading = true;

        const scheduleInfo = allDays.reduce((acc, day) => {
            if (state.scheduleInfo.days.includes(day)) {
                acc[day] = {
                    is_scheduled: true,
                    start: state.scheduleInfo.start,
                    end: state.scheduleInfo.end,
                };
            } else {
                acc[day] = {
                    is_scheduled: false,
                    start: 0,
                    end: 0,
                };
            }
            return acc;
        }, {});

        await fetchCreateUserGroupChannel({
            protocol_id: 'slack',
            name: 'Channel-test-sy',
            schedule: {
                ...scheduleInfo,
                SCHEDULE_TYPE: state.scheduleInfo.type,
            },
            data: {},
            tags: {},
            user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id ?? undefined,
        });
        emit('confirm');
    } finally {
        state.loading = false;
        userGroupPageState.modal = {
            type: '',
            title: '',
            themeColor: 'primary',
        };
    }
};

const handleCancel = () => {
    userGroupPageState.modal = {
        type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST,
        title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE'),
        themeColor: 'primary1',
    };
};

const handleUpdateUser = (value) => {
    state.userInfo = value;
};

const handleScheduleForm = (value) => {
    state.scheduleInfo = value;
};

/* API */
const fetchCreateUserGroupChannel = async (params: UserGroupChannelCreateParameters) => {
    try {
        return await SpaceConnector.clientV2.alertManager.userGroupChannel.create<UserGroupChannelCreateParameters, UserGroupChannelModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
        return {};
    }
};

/* Wacher */
// TODO: all input value must be full to be able to create clickkkk
</script>

<template>
    <div>
        <p-button-modal size="md"
                        :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_SECOND"
                        :header-title="userGroupPageState.modal.title"
                        :theme-color="userGroupPageState.modal.themeColor"
                        @confirm="handleConfirm"
                        @cancel="handleCancel"
        >
            <template #body>
                <div class="flex flex-col gap-1 mb-8">
                    <p class="text-xs">
                        <span>Step 2</span>
                        <span class="text-gray-500">/2</span>
                    </p>
                    <span class="text-gray-700 leading-4 text-sm">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.INFO') }}</span>
                    <div class="flex mt-8">
                        <p-i name="ic_notification-protocol_users"
                             width="2.5rem"
                             height="2.5rem"
                        />
                        <p class="flex flex-col">
                            <span class="text-lg">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.NOTIFY_TO_MEMBER') }}</span>
                            <span class="text-xs text-gray-600">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.NOTIFY_TO_MEMBER_INFO') }}</span>
                        </p>
                    </div>
                </div>
                <user-group-channel-set-input-form @update-user="handleUpdateUser" />
                <user-group-channel-schedule-set-form @schedule-form="handleScheduleForm" />
            </template>
            <template #close-button>
                <p-button icon-left="ic_arrow-left"
                          style-type="transparent"
                >
                    <span class="text-base">{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.GO_BACK') }}</span>
                </p-button>
            </template>
            <template #confirm-button>
                <span>{{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.CREATE') }}</span>
            </template>
        </p-button-modal>
    </div>
</template>
