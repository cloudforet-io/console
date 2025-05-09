<script lang="ts" setup>
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeadingLayout, PHeading, PButton, PToolboxTable, PBadge, PLazyImg,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NotificationProtocolGetParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/get';
import type { NotificationProtocolListParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { UserGroupChannelGetParameters } from '@/schema/alert-manager/user-group-channel/api-verbs/get';
import type { UserGroupChannelListParameters } from '@/schema/alert-manager/user-group-channel/api-verbs/list';
import { USER_GROUP_CHANNEL_SCHEDULE_TYPE } from '@/schema/alert-manager/user-group-channel/constants';
import type { UserGroupChannelModel } from '@/schema/alert-manager/user-group-channel/model';
import type {
    UserGroupChannelScheduleInfoType,
} from '@/schema/alert-manager/user-group-channel/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import type { DayType } from '@/common/components/schedule-setting-form/schedule-setting-form';
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
const channelListApiQuery = channelListApiQueryHelper.data;

const queryTagHelper = useQueryTags({ keyItemSets: USER_GROUP_CHANNELS_SEARCH_HANDLERS });
const { queryTags } = queryTagHelper;


interface ChannelItem {
  name: string;
  channel_id: string;
  day: UserGroupChannelScheduleInfoType;
  time: UserGroupChannelScheduleInfoType;
  timeZone: string;
}

const isDeleteAble = ref<boolean>(false);
const isScheduleTagged = ref<boolean>(false);

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});


const tableState = reactive({
    fields: computed(() => [
        { name: 'name', label: 'Name', width: '350px' },
        { name: 'channel_id', label: 'Channel', width: '240px' },
        { name: 'day', label: 'Day', width: '327px' },
        { name: 'time', label: 'Time', width: '116px' },
        { name: 'timeZone', label: 'Time Zone', width: '250px' },
    ]),
    items: computed<ChannelItem[]>(() => {
        const channels = userGroupPageState.userGroupChannels.list ?? [];
        return channels.map((channel) => ({
            name: channel.name,
            channel_id: channel.protocol_id,
            day: channel.schedule,
            time: channel.schedule,
            timeZone: channel.schedule.TIMEZONE,
        }));
    }),
    valueHandlerMap: computed(() => ({
        name: makeDistinctValueHandler(
            'alert_manager.UserGroupChannel',
            'name',
            'string',
            [{ k: 'user_group_id', v: userGroupPageGetters.selectedUserGroups[0].user_group_id, o: 'eq' }],
        ),
        schedule: makeDistinctValueHandler(
            'alert_manager.UserGroupChannel',
            'schedule.SCHEDULE_TYPE',
            'string',
        ),
    })),
});

const state = reactive({
    loading: false,
    channelName: '',
    protocolList: computed<{ icon: string; label: string; value: string; }[]>(() => userGroupPageState.protocolList?.map((protocol) => ({
        icon: storeState.plugins[protocol.plugin_info.plugin_id]?.icon || '',
        label: protocol.name,
        value: protocol.protocol_id,
    })) ?? []),
    dayMapping: computed<Record<DayType, TranslateResult>>(() => ({
        MON: i18n.t('COMMON.SCHEDULE_SETTING.MON'),
        TUE: i18n.t('COMMON.SCHEDULE_SETTING.TUE'),
        WED: i18n.t('COMMON.SCHEDULE_SETTING.WED'),
        THU: i18n.t('COMMON.SCHEDULE_SETTING.THU'),
        FRI: i18n.t('COMMON.SCHEDULE_SETTING.FRI'),
        SAT: i18n.t('COMMON.SCHEDULE_SETTING.SAT'),
        SUN: i18n.t('COMMON.SCHEDULE_SETTING.SUN'),
    })),
});

const totalCount = ref(0);

/* Component */
const fetchListUserGroupChannel = async (params: UserGroupChannelListParameters) => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.userGroupChannel.list<UserGroupChannelListParameters, ListResponse<UserGroupChannelModel>>(params);
        userGroupPageState.userGroupChannels.list = results;
        totalCount.value = results?.length ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

const handleChange = async (options: any = {}) => {
    let value;
    if (options.queryTags) {
        value = options.queryTags.map((tag) => {
            if (tag.key.name === 'schedule') {
                isScheduleTagged.value = true;
                return tag.value.name;
            }
            return '';
        });
    }
    const filteredApiQueryHelper = new ApiQueryHelper();
    const filteredApiQuery = filteredApiQueryHelper.setFilters([
        { k: 'schedule.SCHEDULE_TYPE', v: value, o: '=' },
    ]).data;

    if (options.pageStart !== undefined) userGroupPageState.userGroupChannels.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) userGroupPageState.userGroupChannels.pageLimit = options.pageLimit;
    try {
        state.loading = true;
        await fetchListUserGroupChannel({
            user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
            query: isScheduleTagged.value
                ? filteredApiQuery : getApiQueryWithToolboxOptions(channelListApiQueryHelper, options),
        });
    } finally {
        state.loading = false;
    }
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

const getScheduleInfo = (schedule: UserGroupChannelScheduleInfoType) => {
    const scheduleInfo = {
        styleType: '', value: '' as TranslateResult, days: [] as TranslateResult[], time: '', timezone: '',
    };


    const formatTime = (time: number | undefined, defaultTime: number): string => `${String(time ?? defaultTime).padStart(2, '0')}:00`;
    Object.entries(schedule).forEach(([day, s]) => {
        if (day === 'SCHEDULE_TYPE') return;

        if (day === 'TIMEZONE') {
            scheduleInfo.timezone = s as string;
            return;
        }
        const scheduleDay = s;
        if (!scheduleDay || typeof scheduleDay === 'string') return;

        const startTime = formatTime(scheduleDay.start, 0);
        const endTime = formatTime(scheduleDay.end, 24);
        if (schedule.SCHEDULE_TYPE === 'WEEK_DAY') {
            scheduleInfo.days = Object.values(state.dayMapping).slice(0, 5).map((d) => d as TranslateResult);
            if (scheduleDay.is_scheduled) {
                scheduleInfo.time = `${startTime} ~ ${endTime}`;
            }
        } else if (schedule.SCHEDULE_TYPE === 'ALL_DAY') {
            scheduleInfo.days = Object.values(state.dayMapping).map((d) => d as TranslateResult);
            scheduleInfo.time = `${startTime} ~ ${endTime}`;
        } else if (scheduleDay?.is_scheduled) {
            scheduleInfo.days.push(state.dayMapping[day]);
            scheduleInfo.time = `${startTime} ~ ${endTime}`;
        }
    });

    switch (schedule.SCHEDULE_TYPE) {
    case 'WEEK_DAY':
        scheduleInfo.styleType = 'secondary1';
        scheduleInfo.value = i18n.t('COMMON.SCHEDULE_SETTING.WEEKDAYS');
        break;
    case 'ALL_DAY':
        scheduleInfo.styleType = 'primary1';
        scheduleInfo.value = i18n.t('COMMON.SCHEDULE_SETTING.EVERYDAY');
        break;
    default:
        scheduleInfo.styleType = 'coral500';
        scheduleInfo.value = i18n.t('COMMON.SCHEDULE_SETTING.CUSTOM');
        break;
    }


    return {
        ...scheduleInfo,
        days: scheduleInfo.days.join(', '),
    };
};

/* Watcher */
watch(isScheduleTagged, (nv_scheduled_tag) => {
    if (nv_scheduled_tag) {
        isScheduleTagged.value = false;
    }
}, { immediate: true });

watch(() => userGroupPageGetters.selectedUserGroups, () => {
    if (userGroupPageGetters.selectedUserGroups && userGroupPageGetters.selectedUserGroups[0].notification_channel) {
        return userGroupPageGetters.selectedUserGroups[0].notification_channel.length;
    }
    return 0;
}, { deep: true, immediate: true });

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

/* API */
const fetchGetNotificationProtocol = async (params: NotificationProtocolGetParameters) => {
    try {
        return await SpaceConnector.clientV2.alertManager.notificationProtocol.get<NotificationProtocolGetParameters, NotificationProtocolModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
        return null;
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
                        <p-button style-type="secondary"
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
                         :multi-select="false"
                         :key-item-sets="USER_GROUP_CHANNELS_SEARCH_HANDLERS"
                         :query-tags="queryTags"
                         :value-handler-map="tableState.valueHandlerMap"
                         :select-index="userGroupPageState.userGroupChannels.selectedIndices"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
        >
            <template #col-channel_id-format="{value}">
                <div v-for="(protocol, idx) in state.protocolList"
                     :key="`${protocol}-${idx}`"
                >
                    <div v-if="protocol.value === value"
                         class="flex items-center gap-2"
                    >
                        <p-lazy-img :src="assetUrlConverter(protocol.icon)"
                                    width="1rem"
                                    height="1rem"
                                    error-icon="ic_notification-protocol_envelope"
                        />
                        <p>{{ protocol.label }}</p>
                    </div>
                </div>
            </template>
            <template #col-day-format="{value}">
                <div class="flex gap-2 items-center">
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
                    <span>
                        {{ getScheduleInfo(value)['days'] }}
                    </span>
                </div>
            </template>
            <template #col-time-format="{value}">
                {{ getScheduleInfo(value)['time'] }}
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
