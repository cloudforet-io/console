<script lang="ts" setup>
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';

import {
    makeDistinctValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeadingLayout, PHeading, PButton, PToolboxTable, PBadge,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { NotificationProtocolGetParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/get';
import type { NotificationProtocolListParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { UserGroupChannelGetParameters } from '@/schema/alert-manager/user-group-channel/api-verbs/get';
import type { UserGroupChannelListParameters } from '@/schema/alert-manager/user-group-channel/api-verbs/list';
import { USER_GROUP_CHANNEL_SCHEDULE_TYPE } from '@/schema/alert-manager/user-group-channel/constants';
import type { UserGroupChannelModel } from '@/schema/alert-manager/user-group-channel/model';
import type {
    UserGroupChannelScheduleType,
} from '@/schema/alert-manager/user-group-channel/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

import {
    USER_GROUP_CHANNELS_SEARCH_HANDLERS,
    USER_GROUP_MODAL_TYPE,
} from '@/services/iam/constants/user-group-constant';
import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

interface Props {
  hasReadWriteAccess: boolean;
}

const props = defineProps<Props>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const channelListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(userGroupPageState.userGroupChannels.pageStart)
    .setSort('name', true);
let channelListApiQuery = channelListApiQueryHelper.data;

const queryTagHelper = useQueryTags({ keyItemSets: USER_GROUP_CHANNELS_SEARCH_HANDLERS });
const { queryTags } = queryTagHelper;


interface ChannelItem {
  name: string;
  channel_id: string;
  // schedule: UserGroupChannelScheduleInfoType;
  SCHEDULE_TYPE: UserGroupChannelScheduleType;
  details?: any;
}

const isDeleteAble = ref<boolean>(false);

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});

const tableState = reactive({
    fields: computed(() => [
        { name: 'name', label: 'Name' },
        { name: 'channel_id', label: 'Channel' },
        { name: 'schedule', label: 'Schedule' },
    ]),
    items: computed<ChannelItem[]>(() => {
        const channels = userGroupPageState.userGroupChannels.list ?? [];
        return channels.map((channel) => ({
            name: channel.name,
            channel_id: channel.protocol_id,
            schedule: channel.schedule.SCHEDULE_TYPE,
        }));
    }),
    valueHandlerMap: computed(() => ({
        name: makeDistinctValueHandler('alert_manager.UserGroupChannel', 'name'),
        // schedule: makeEnumValueHandler({
        //     WEEKDAYS: 'Weekdays',
        //     EVERYDAY: 'Everyday',
        //     CUSTOM: 'Custom',
        // }),
        schedule: makeDistinctValueHandler('alert_manager.UserGroupChannel', 'schedule.SCHEDULE_TYPE'),
    })),
});

const state = reactive({
    loading: false,
    channelName: '',
    protocolIcon: '',
});

const totalCount = computed<number>(() => {
    if (userGroupPageGetters.selectedUserGroups && userGroupPageGetters.selectedUserGroups[0].notification_channel) {
        return userGroupPageGetters.selectedUserGroups[0].notification_channel.length;
    }
    return 0;
});

/* Component */
const handleChange = async (options: any = {}) => {
    channelListApiQuery = getApiQueryWithToolboxOptions(channelListApiQueryHelper, options) ?? channelListApiQuery;
    if (options.queryTags !== undefined) {
        userGroupPageStore.$patch((_state) => {
            _state.state.userGroupChannels.searchFilters = channelListApiQueryHelper.filters;
        });
    }
    if (options.pageStart !== undefined) userGroupPageState.userGroupChannels.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) userGroupPageState.userGroupChannels.pageLimit = options.pageLimit;
    await fetchListUserGroupChannel({ user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id, query: channelListApiQuery });
};

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
            const {
                protocol_id, schedule, name,
            } = result;

            if (protocol_id) {
                const protocolResult = await fetchGetNotificationProtocol({
                    protocol_id,
                });

                if (protocolResult && storeState.plugins[protocolResult.plugin_info.plugin_id] !== undefined) {
                    state.protocolIcon = storeState.plugins[protocolResult.plugin_info.plugin_id]?.icon || '';

                    notificationChannelCreateFormStore.$patch((_state) => {
                        _state.state.selectedProtocol.protocol_id = protocol_id;
                        _state.state.selectedProtocol.icon = storeState.plugins[protocolResult.plugin_info.plugin_id]?.icon || '';
                        _state.state.selectedProtocol.name = protocolResult.name;
                        _state.state.channelName = name;
                        _state.state.scheduleInfo = {
                            SCHEDULE_TYPE: schedule.SCHEDULE_TYPE,
                            TIMEZONE: schedule.TIMEZONE,
                            MON: schedule.MON,
                            TUE: schedule.TUE,
                            WED: schedule.WED,
                            THU: schedule.THU,
                            FRI: schedule.FRI,
                            SAT: schedule.SAT,
                            SUN: schedule.SUN,
                        };
                    });
                    userGroupPageStore.updateModalSettings({
                        type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_SECOND,
                        title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.UPDATE_TITLE'),
                        themeColor: 'primary1',
                    });
                }
            }
        }
    } else if (modalType === 'delete') {
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.DELETE_NOTIFICATION_CHANNEL,
            title: i18n.t('IAM.USER_GROUP.MODAL.DELETE_CHANNEL.TITLE'),
            themeColor: 'alert',
        });
    }
};

/* Watcher */
watch(() => userGroupPageGetters.selectedUserGroups, async (nv_selected_user_group, ov_selected_user_group) => {
    if (nv_selected_user_group !== ov_selected_user_group && nv_selected_user_group[0].user_group_id) {
        try {
            state.loading = true;
            await fetchListUserGroupChannel({ user_group_id: nv_selected_user_group[0].user_group_id, query: channelListApiQuery });
        } finally {
            state.loading = false;
        }
    }
}, { deep: true, immediate: true });

watch([() => tableState.items, () => userGroupPageGetters.selectedUserGroupChannel], ([nv_items, nv_selected_item]) => {
    if (nv_items.length > 0 && nv_selected_item.length === 1) {
        isDeleteAble.value = true;
    } else if (nv_items.length === 0) {
        isDeleteAble.value = false;
    }
}, { deep: true, immediate: true });

// watch(() => userGroupPageState.userGroupChannels.selectedIndices, async (nv_selected_channel) => {
//     if (nv_selected_channel.length === 1) {
//         await fetchGetNotificationProtocol({
//           protocol_id:
//         });
//     }
// }, { deep: true, immediate: true });

/* API */
const fetchGetNotificationProtocol = async (params: NotificationProtocolGetParameters) => {
    try {
        return await SpaceConnector.clientV2.alertManager.notificationProtocol.get<NotificationProtocolGetParameters, NotificationProtocolModel>(params);
        // notificationChannelCreateFormStore.$patch((_state) => {
        //     _state.state.selectedProtocol.icon = result.plugin_info.plugin_id;
        //     _state.state.selectedProtocol.name = result.name;
        // });
    } catch (e) {
        ErrorHandler.handleError(e, true);
        return null;
    }
};

const fetchListUserGroupChannel = async (params: UserGroupChannelListParameters) => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.userGroupChannel.list<UserGroupChannelListParameters, ListResponse<UserGroupChannelModel>>(params);
        userGroupPageState.userGroupChannels.list = results;
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

const fetchGetUserGroupChannel = async (params: UserGroupChannelGetParameters): Promise<UserGroupChannelModel | undefined> => {
    try {
        return await SpaceConnector.clientV2.alertManager.userGroupChannel.get<UserGroupChannelGetParameters, UserGroupChannelModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
        return undefined;
    }
};

const fetchNotificationProtocolList = async (params: NotificationProtocolListParameters) => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.notificationProtocol.list<NotificationProtocolListParameters, ListResponse<NotificationProtocolModel>>(params);
        userGroupPageState.protocolList = results;
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

/* Mounted */
onMounted(async () => {
    if (userGroupPageGetters.selectedUserGroups[0].user_group_id) {
        await fetchListUserGroupChannel({
            user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
            query: channelListApiQuery,
        });
    }
});

onMounted(async () => {
    await fetchNotificationProtocolList({});
});
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
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
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
                                  :disabled="!isDeleteAble"
                                  @click="handleUpdateModal('edit')"
                        >
                            {{ $t('IAM.USER_GROUP.TAB.NOTIFICATION_CHANNEL.EDIT') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  icon-left="ic_delete"
                                  :disabled="!isDeleteAble"
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
                         sortable
                         sort-desc
                         :loading="state.loading"
                         :refreshable="false"
                         :multi-select="false"
                         :key-item-sets="USER_GROUP_CHANNELS_SEARCH_HANDLERS"
                         :query-tags="queryTags"
                         :value-handler-map="tableState.valueHandlerMap"
                         :select-index="userGroupPageState.userGroupChannels.selectedIndices"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         @select="handleSelect"
                         @change="handleChange"
        >
            <template #col-channel_id-format="{value}">
                {{
                    userGroupPageState.protocolList?.filter(protocol => protocol.protocol_id === value)[0]?.name
                }}
            </template>
            <template #col-schedule-format="{value}">
                <p-badge v-if="value === USER_GROUP_CHANNEL_SCHEDULE_TYPE.CUSTOM"
                         badge-type="solid-outline"
                         style-type="alert"
                >
                    {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.CUSTOM') }}
                </p-badge>
                <p-badge v-else-if="value === USER_GROUP_CHANNEL_SCHEDULE_TYPE.ALL_DAY"
                         badge-type="solid-outline"
                         style-type="indigo500"
                >
                    {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.EVERYDAY') }}
                </p-badge>
                <p-badge v-else-if="value === USER_GROUP_CHANNEL_SCHEDULE_TYPE.WEEK_DAY"
                         badge-type="solid-outline"
                         style-type="secondary1"
                >
                    {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.WEEKDAYS') }}
                </p-badge>
                <p-badge v-else-if="value === USER_GROUP_CHANNEL_SCHEDULE_TYPE.WEEKEND"
                         badge-type="solid-outline"
                         style-type="gray500"
                >
                    {{ $t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.DESC.SCHEDULE.WEEKEND') }}
                </p-badge>
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
