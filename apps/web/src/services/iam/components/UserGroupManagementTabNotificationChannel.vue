<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeadingLayout, PHeading, PButton, PToolboxTable, PBadge,
} from '@cloudforet/mirinae';

import type { UserGroupChannelGetParameters } from '@/schema/alert-manager/user-group-channel/api-verbs/get';
import { USER_GROUP_CHANNEL_SCHEDULE_TYPE } from '@/schema/alert-manager/user-group-channel/constants';
import type { UserGroupChannelModel } from '@/schema/alert-manager/user-group-channel/model';
import type { UserGroupChannelScheduleInfoType } from '@/schema/alert-manager/user-group-channel/type';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';



const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

interface ChannelItem {
  name: string;
  channel_id: string;
  schedule: UserGroupChannelScheduleInfoType;
  details?: any;
}

const isDeleteable = ref<boolean>(false);

const tableState = reactive({
    fields: computed(() => [
        { name: 'name', label: 'Name' },
        { name: 'channel_id', label: 'Channel' },
        { name: 'schedule', label: 'Schedule' },
        { name: 'details', label: 'Details' },
    ]),
    items: computed<ChannelItem[]>(() => {
        const channels = userGroupPageGetters.selectedUserGroups[0]?.notification_channel ?? [];
        return channels.map((channel) => {
            let userList: string[] | undefined = [];
            if (channel.data) {
                if (channel.data.FORWARD_TYPE === 'USER') {
                    userList = channel.data.USER;
                } else if (channel.data.FORWARD_TYPE === 'USER_GROUP') {
                    userList = channel.data.USER_GROUP;
                } else {
                    // TODO: text 'all member'??
                    userList = [];
                }
            }
            return {
                name: channel.name,
                channel_id: channel.protocol_id,
                schedule: channel.schedule,
                details: userList,
            };
        });
    }),
});

const totalCount = computed<number>(() => {
    if (userGroupPageGetters.selectedUserGroups && userGroupPageGetters.selectedUserGroups[0].notification_channel) {
        return userGroupPageGetters.selectedUserGroups[0].notification_channel.length;
    }
    return 0;
});

/* Component */
const handleSelect = async (index: number[]) => {
    userGroupPageState.userGroupChannels.selectedIndices = index;
};

const handleUpdateModal = async (modalType: string) => {
    if (modalType === 'create') {
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST,
            title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE'),
            themeColor: 'primary1',
        });
    } else if (modalType === 'edit') {
        const result = await fetchGetUserGroupChannel({
            channel_id: userGroupPageGetters.selectedUserGroupChannel[0].channel_id,
        });
        if (result) {
            notificationChannelCreateFormStore.setSelectedProtocol(result.protocol_id);
            notificationChannelCreateFormStore.setChannelName(result.name);
            if (result.data) {
                if (result.data.USER && result.data.USER.length > 0) {
                    notificationChannelCreateFormStore.setUserInfo({
                        type: 'USER',
                        value: result.data.USER,
                    });
                } else if (result.data.USER_GROUP && result.data.USER_GROUP.length > 0) {
                    notificationChannelCreateFormStore.setUserInfo({
                        type: 'USER_GROUP',
                        value: result.data.USER_GROUP,
                    });
                }
            }
            if (result.schedule.SCHEDULE_TYPE === 'ALL_DAY') {
                notificationChannelCreateFormStore.setScheduleInfo({
                    days: ['MON', 'TUE', 'WED', 'Thu', 'Fri', 'Sat', 'Sun'],
                    start: result.schedule.MON.start,
                    end: result.schedule.MON.end,
                    type: 'ALL_DAY',
                });
            } else if (result.schedule.SCHEDULE_TYPE === 'WEEK_DAY') {
                notificationChannelCreateFormStore.setScheduleInfo({
                    days: ['MON', 'TUE', 'WED', 'Thu', 'Fri'],
                    start: result.schedule.MON.start,
                    end: result.schedule.MON.end,
                    type: 'WEEK_DAY',
                });
            } else if (result.schedule.SCHEDULE_TYPE === 'CUSTOM') {
                notificationChannelCreateFormStore.setScheduleInfo({
                    days: Object.values(result.schedule).map((sc, idx) => {
                        if (typeof sc === 'object' && sc.is_scheduled) {
                            return Object.keys(result.schedule)[idx];
                        }
                        return null;
                    }),
                    start: result.schedule.MON.start,
                    end: result.schedule.MON.end,
                    type: 'CUSTOM',
                });
            }
            console.log(result);
        }
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST,
            title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.UPDATE_TITLE'),
            themeColor: 'primary1',
        });
    } else if (modalType === 'delete') {
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.DELETE_NOTIFICATION_CHANNEL,
            title: i18n.t('IAM.USER_GROUP.MODAL.DELETE_CHANNEL.TITLE'),
            themeColor: 'alert',
        });
    }
};

/* Watcher */
watch(() => tableState.items, (nv_items) => {
    if (nv_items.length > 0) {
        isDeleteable.value = true;
    }
}, { immediate: true });

/* API */
const fetchGetUserGroupChannel = async (params: UserGroupChannelGetParameters): Promise<UserGroupChannelModel | undefined> => {
    try {
        return await SpaceConnector.clientV2.alertManager.userGroupChannel.get<UserGroupChannelGetParameters, UserGroupChannelModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
        return undefined;
    }
};
</script>

<template>
    <div class="user-group-management-notification-channel">
        <p-heading-layout class="pt-8 px-4 pb-6">
            <template #heading>
                <p-heading heading-type="sub"
                           use-total-count
                           :total-count="totalCount"
                           :title="i18n.t('IAM.USER_GROUP.TAB.NOTIFICATION_CHANNEL.TITLE')"
                />
            </template>
            <template #extra>
                <div class="toolbox-wrapper">
                    <div class="toolbox">
                        <p-button style-type="tertiary"
                                  icon-left="ic_plus"
                                  @click="handleUpdateModal('create')"
                        >
                            {{ $t('IAM.USER_GROUP.TAB.NOTIFICATION_CHANNEL.CREATE') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  icon-left="ic_edit-text"
                                  @click="handleUpdateModal('edit')"
                        >
                            {{ $t('IAM.USER_GROUP.TAB.NOTIFICATION_CHANNEL.EDIT') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  icon-left="ic_delete"
                                  :disabled="!isDeleteable"
                                  @click="handleUpdateModal('delete')"
                        >
                            {{ $t('IAM.USER_GROUP.TAB.NOTIFICATION_CHANNEL.DELETE') }}
                        </p-button>
                    </div>
                </div>
            </template>
        </p-heading-layout>
        <p-toolbox-table search-type="query"
                         searchable
                         selectable
                         :refreshable="false"
                         :multi-select="false"
                         :select-index="userGroupNotificationChannelPageState.selectedIndices"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         @select="handleSelect"
        >
            <template #col-schedule-format="{value}">
                <p-badge v-if="value.SCHEDULE_TYPE === USER_GROUP_CHANNEL_SCHEDULE_TYPE.CUSTOM"
                         badge-type="solid-outline"
                         style-type="alert"
                >
                    {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.CUSTOM') }}
                </p-badge>
                <p-badge v-else-if="value.SCHEDULE_TYPE === USER_GROUP_CHANNEL_SCHEDULE_TYPE.ALL_DAY"
                         badge-type="solid-outline"
                         style-type="indigo500"
                >
                    {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.EVERYDAY') }}
                </p-badge>
                <p-badge v-else-if="value.SCHEDULE_TYPE === USER_GROUP_CHANNEL_SCHEDULE_TYPE.WEEK_DAY"
                         badge-type="solid-outline"
                         style-type="secondary1"
                >
                    {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.WEEKDAYS') }}
                </p-badge>
                <p-badge v-else-if="value.SCHEDULE_TYPE === USER_GROUP_CHANNEL_SCHEDULE_TYPE.WEEKEND"
                         badge-type="solid-outline"
                         style-type="gray500"
                >
                    {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.WEEKEND') }}
                </p-badge>
            </template>
            <template #col-details-format="{value}">
                <div v-if="value.length < 5">
                    <span v-for="(v, i) in value"
                          :key="i"
                    >
                        <span v-if="i === value.length - 1">
                            {{ v }}
                        </span>
                        <span v-else>
                            {{ v }},
                        </span>
                    </span>
                </div>
                <div v-else-if="value.length > 5">
                    <span v-for="(v, i) in value"
                          :key="i"
                    >
                        <span v-if="i < 4">
                            {{ v }},
                        </span>
                        <span v-else-if="i === 4">
                            {{ v }}
                        </span>
                        <span v-else-if="i > 4">
                            ...
                        </span>
                    </span>
                </div>
            </template>
        </p-toolbox-table>
    </div>
</template>

<style scoped lang="postcss">
.user-group-management-notification-channel {
    .toolbox-wrapper {
        .toolbox {
            @apply flex;
            gap: 8px;
        }
    }
}
:deep(.p-toolbox-table) {
    border-width: 0;
}
</style>
