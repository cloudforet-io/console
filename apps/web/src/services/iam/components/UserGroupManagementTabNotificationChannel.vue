<script lang="ts" setup>
import {
    computed, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useQueryClient } from '@tanstack/vue-query';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeadingLayout, PHeading, PButton, PToolboxTable, PBadge, PLazyImg,
} from '@cloudforet/mirinae';

import { useNotificationProtocolApi } from '@/api-clients/alert-manager/notification-protocol/composables/use-notification-protocol-api';
import { useUserGroupChannelApi } from '@/api-clients/alert-manager/user-group-channel/composables/use-user-group-channel-api';
import { USER_GROUP_CHANNEL_SCHEDULE_TYPE } from '@/api-clients/alert-manager/user-group-channel/schema/constants';
import type {
    UserGroupChannelScheduleInfoType,
} from '@/api-clients/alert-manager/user-group-channel/schema/type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import type { DayType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import { useQueryTags } from '@/common/composables/query-tags';

import { useUserGroupChannelGetQuery } from '@/services/iam/composables/use-user-group-channel-get-query';
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
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();

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

const paginationState = reactive({
    thisPage: 1,
    pageSize: 15,
});
const filterState = reactive({
    sortKey: 'name',
    sortDesc: true,
});

const queryClient = useQueryClient();
const { userGroupChannelAPI } = useUserGroupChannelApi();

const channelListApiQueryHelper = new ApiQueryHelper();
const { key: userGroupChannelListQueryKey, params: userGroupChannelListQueryParams } = useServiceQueryKey('alert-manager', 'user-group-channel', 'list', {
    params: computed(() => {
        channelListApiQueryHelper.setFilters([...queryTagHelper.filters.value]);
        return {
            user_group_id: userGroupPageGetters.selectedUserGroups[0].user_group_id,
            query: {
                ...channelListApiQueryHelper.data,
                sort: [{ key: filterState.sortKey, desc: filterState.sortDesc }],
            },
        };
    }),
    pagination: true,
});
const { data: userGroupChannelListData, totalCount: userGroupChannelListTotalCount, isLoading: userGroupChannelListFetching } = useScopedPaginationQuery({
    queryKey: userGroupChannelListQueryKey,
    queryFn: userGroupChannelAPI.list,
    params: userGroupChannelListQueryParams,
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 60 * 2,
    enabled: computed(() => !!userGroupPageGetters.selectedUserGroups[0].user_group_id),
}, {
    thisPage: computed(() => paginationState.thisPage),
    pageSize: computed(() => paginationState.pageSize),
    verb: 'list',
}, ['DOMAIN', 'WORKSPACE']);

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});

const tableState = reactive({
    fields: computed(() => [
        { name: 'name', label: 'Name', width: '350px' },
        { name: 'channel_id', label: 'Channel', width: '240px' },
        {
            name: 'day', label: 'Day', width: '327px', sortable: false,
        },
        {
            name: 'time', label: 'Time', width: '116px', sortable: false,
        },
        {
            name: 'timeZone', label: 'Time Zone', width: '250px', sortable: false,
        },
    ]),
    items: computed<ChannelItem[]>(() => (userGroupChannelListData.value?.results || []).map((channel) => ({
        name: channel.name,
        channel_id: channel.protocol_id,
        day: channel.schedule,
        time: channel.schedule,
        timeZone: channel.schedule.TIMEZONE,
    }))),
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
    protocols: [],
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

const { notificationProtocolAPI } = useNotificationProtocolApi();
const { key: notificationProtocolListQueryKey } = useServiceQueryKey('alert-manager', 'notification-protocol', 'list');

const { data: notificationProtocolListData } = useScopedQuery({
    queryKey: notificationProtocolListQueryKey,
    queryFn: async () => notificationProtocolAPI.list(),
    select: (data) => data.results?.map((i) => ({
        plugin_info: i.plugin_info,
        name: i.name,
        protocol_id: i.protocol_id,
        icon: storeState.plugins[i.plugin_info.plugin_id]?.icon || '',
    })),
    enabled: computed(() => Object.keys(storeState.plugins).length > 0),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
}, ['DOMAIN', 'WORKSPACE']);

const { userGroupChannelData } = useUserGroupChannelGetQuery();

/* Component */
const refreshUserGroupChannelList = () => {
    queryClient.invalidateQueries({ queryKey: userGroupChannelListQueryKey.value });
};
const getProtocolInfo = (id: string) => notificationProtocolListData.value?.find((i) => i.protocol_id === id);

const handleChange = async (options: any = {}) => {
    if (options.sortBy !== undefined) filterState.sortKey = options.sortBy;
    if (options.sortDesc !== undefined) filterState.sortDesc = options.sortDesc;
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
    }
};

const handleSelect = async (index: number[]) => {
    userGroupPageStore.selectedUserGroupChannelIdx(index);
};

const handleUpdateModal = async (modalType: string) => {
    if (modalType === 'create') {
        userGroupPageStore.updateModalSettings({
            type: USER_GROUP_MODAL_TYPE.CREATE_NOTIFICATIONS_FIRST,
            title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.TITLE'),
            themeColor: 'primary1',
        });
    } else if (modalType === 'edit') {
        if (userGroupChannelData.value) {
            const {
                protocol_id, schedule, name,
            } = userGroupChannelData.value;

            if (protocol_id) {
                const protocolResult = notificationProtocolListData.value?.find((protocol) => protocol.protocol_id === protocol_id);

                if (protocolResult && storeState.plugins[protocolResult?.plugin_info.plugin_id] !== undefined) {
                    notificationChannelCreateFormStore.$patch((_state) => {
                        _state.state.selectedProtocol.protocol_id = protocol_id;
                        _state.state.selectedProtocol.icon = storeState.plugins[protocolResult?.plugin_info.plugin_id]?.icon || '';
                        _state.state.selectedProtocol.name = protocolResult?.name as string;
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

watch(() => userGroupPageGetters.selectedUserGroups[0].user_group_id, () => {
    refreshUserGroupChannelList();
}, { immediate: true });

watch([() => tableState.items, () => userGroupPageGetters.selectedUserGroupChannel], ([nv_items, nv_selected_item]) => {
    if (nv_items.length > 0 && nv_selected_item.length === 1) {
        isDeleteAble.value = true;
    } else if (nv_items.length === 0) {
        isDeleteAble.value = false;
    }
}, { deep: true, immediate: true });
watch(() => userGroupChannelListData.value?.results, (data) => {
    if (data) {
        userGroupPageStore.setSelectedUserGroupChannel(data);
    }
}, { immediate: true });


</script>

<template>
    <div class="user-group-management-notification-channel">
        <p-heading-layout class="pt-8 px-4 pb-6">
            <template #heading>
                <p-heading heading-type="sub"
                           use-total-count
                           :total-count="userGroupChannelListTotalCount"
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
                         :loading="userGroupChannelListFetching"
                         :multi-select="false"
                         :key-item-sets="USER_GROUP_CHANNELS_SEARCH_HANDLERS"
                         :query-tags="queryTags"
                         :this-page.sync="paginationState.thisPage"
                         :page-size.sync="paginationState.pageSize"
                         :total-count="userGroupChannelListTotalCount"
                         :value-handler-map="tableState.valueHandlerMap"
                         :select-index="userGroupPageState.userGroupChannels.selectedIndices"
                         :fields="tableState.fields"
                         :items="tableState.items"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="refreshUserGroupChannelList"
        >
            <template #col-channel_id-format="{value}">
                <div class="flex items-center gap-2">
                    <p-lazy-img :src="assetUrlConverter(getProtocolInfo(value)?.icon || '')"
                                width="1rem"
                                height="1rem"
                                error-icon="ic_notification-protocol_envelope"
                    />
                    <p>{{ getProtocolInfo(value)?.name }}</p>
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
