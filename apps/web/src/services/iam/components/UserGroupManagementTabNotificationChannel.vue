<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PHeadingLayout, PHeading, PButton, PToolboxTable, PBadge,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserGroupNotificationChannelPageStore } from '@/services/iam/store/user-group-notification-channel-page-store';

const userGroupNotificationChannelPageStore = useUserGroupNotificationChannelPageStore();
const userGroupNotificationChannelPageState = userGroupNotificationChannelPageStore.state;

const tableState = reactive({
    fields: computed(() => [
        { name: 'name', label: 'Name' },
        { name: 'channel', label: 'Channel' },
        { name: 'schedule', label: 'Schedule' },
        { name: 'details', label: 'Details' },
    ]),
    items: computed(() => ([
        {
            name: 'PMT 멤버 채널로 알림',
            channel: 'Notify to Member Channel',
            schedule: 'Custom',
            details: ['abc@mz.co.kr', 'edf@mz.co.kr'],
        },
        {
            name: '이메일 알림',
            channel: 'Email',
            schedule: 'Every Day',
            details: ['abc@mz.co.kr', 'edf@mz.co.kr'],
        },
        {
            name: '개인 핸드폰',
            channel: 'SMS',
            schedule: 'Weekdays',
            details: ['abc@mz.co.kr', 'edf@mz.co.kr', 'edf@mz.co.kr', 'sss@mz.co.kr', 'a@mz.co.kr', 'test@mz.co.kr'],
        },
    ])),
});

/* Component */
const handleSelect = async (index) => {
    userGroupNotificationChannelPageState.selectedIndices = index;
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
                        >
                            {{ $t('IAM.USER_GROUP.TAB.NOTIFICATION_CHANNEL.ADD') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  icon-left="ic_edit-text"
                        >
                            {{ $t('IAM.USER_GROUP.TAB.NOTIFICATION_CHANNEL.EDIT') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  icon-left="ic_delete"
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
