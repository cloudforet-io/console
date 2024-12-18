<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PHeadingLayout, PHeading, PButton, PToolboxTable, PBadge,
} from '@cloudforet/mirinae';

import type { UserGroupChannelScheduleInfoType } from '@/schema/alert-manager/user-group-channel/type';
import { i18n } from '@/translations';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupNotificationChannelPageStore } from '@/services/iam/store/user-group-notification-channel-page-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';


const userGroupNotificationChannelPageStore = useUserGroupNotificationChannelPageStore();
const userGroupNotificationChannelPageState = userGroupNotificationChannelPageStore.state;

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

interface ChannelItem {
  name: string;
  channel: string;
  schedule: UserGroupChannelScheduleInfoType;
  details?: any;
}

const tableState = reactive({
    fields: computed(() => [
        { name: 'name', label: 'Name' },
        { name: 'channel_id', label: 'Channel' },
        { name: 'schedule', label: 'Schedule' },
        { name: 'details', label: 'Details' },
    ]),
    items: computed<ChannelItem[]>(() => {
        const channels = userGroupPageState.userGroups[0]?.notification_channel ?? [];
        return channels.map((channel) => ({
            name: channel.name,
            channel: channel.protocol_id,
            schedule: channel.schedule,
            details: '',
        }));
    }),
});

/* Component */
const handleSelect = async (index: number[]) => {
    userGroupPageState.userGroupChannels.selectedIndices = index;
};

const handleUpdateModal = (modalType: string) => {
    switch (modalType) {
    case 'add':
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST,
            title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE'),
            themeColor: 'primary1',
        });
        break;
    //     TODO: Update with stored values
    case 'edit':
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST,
            title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.UPDATE_TITLE'),
            themeColor: 'primary1',
        });
        break;
    case 'delete':
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.DELETE_NOTIFICATION_CHANNEL,
            title: i18n.t('IAM.USER_GROUP.MODAL.DELETE_CHANNEL.TITLE'),
            themeColor: 'alert',
        });
        break;
    default:
        break;
    }
};
</script>

<template>
    <div class="user-group-management-notification-channel">
        <p-heading-layout class="pt-8 px-4 pb-6">
            <template #heading>
                <p-heading heading-type="sub"
                           use-total-count
                           :total-count="userGroupNotificationChannelPageState.totalCount"
                           :title="i18n.t('IAM.USER_GROUP.TAB.NOTIFICATION_CHANNEL.TITLE')"
                />
            </template>
            <template #extra>
                <div class="toolbox-wrapper">
                    <div class="toolbox">
                        <p-button style-type="tertiary"
                                  icon-left="ic_plus"
                                  @click="handleUpdateModal('add')"
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
                         :multi-select="false"
                         :select-index="userGroupNotificationChannelPageState.selectedIndices"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         @select="handleSelect"
        >
            <template #col-schedule-format="{value}">
                <p-badge v-if="value === 'Custom'"
                         badge-type="solid-outline"
                         style-type="alert"
                >
                    {{ value }}
                </p-badge>
                <p-badge v-else-if="value === 'Every Day'"
                         badge-type="solid-outline"
                         style-type="indigo500"
                >
                    {{ value }}
                </p-badge>
                <p-badge v-else-if="value === 'Weekdays'"
                         badge-type="solid-outline"
                         style-type="secondary1"
                >
                    {{ value }}
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
