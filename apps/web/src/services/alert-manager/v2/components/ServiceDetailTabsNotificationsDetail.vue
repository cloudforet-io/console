<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeadingLayout, PTab, PHeading, PDefinitionTable, PStatus, PLazyImg, PBadge, PI,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ServiceChannelGetParameters } from '@/schema/alert-manager/service-channel/api-verbs/get';
import {
    SERVICE_CHANNEL_FORWARD_TYPE,
    SERVICE_CHANNEL_SCHEDULE_TYPE, SERVICE_CHANNEL_TYPE,
} from '@/schema/alert-manager/service-channel/constants';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import type { ServiceChannelScheduleInfoType, ServiceChannelScheduleDayType } from '@/schema/alert-manager/service-channel/type';
import { i18n } from '@/translations';

import type { UserGroupReferenceMap } from '@/store/reference/user-group-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import type { DayType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { alertManagerStateFormatter } from '@/services/alert-manager/v2/composables/refined-table-data';
import {
    NOTIFICATIONS_DETAIL_TABS,
} from '@/services/alert-manager/v2/constants/common-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { ProtocolInfo, WebhookDetailTabsType, ProtocolCardItemType } from '@/services/alert-manager/v2/types/alert-manager-type';

type ScheduleInfo = {
    styleType: string;
    value: TranslateResult;
    days: string;
    time: string;
    timezone: string;
};

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const tabState = reactive({
    notificationsDetailTabs: computed<TabItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.DETAILS'), name: NOTIFICATIONS_DETAIL_TABS.DETAIL },
    ])),
    activeNotificationsDetailTab: NOTIFICATIONS_DETAIL_TABS.DETAIL as WebhookDetailTabsType,
});
const storeState = reactive({
    selectedNotificationId: computed<string|undefined>(() => serviceDetailPageState.selectedNotificationId),
    notificationProtocolList: computed<ProtocolCardItemType[]>(() => serviceDetailPageGetters.notificationProtocolList),
    userGroup: computed<UserGroupReferenceMap>(() => serviceDetailPageGetters.userGroupReferenceMap),
});
const state = reactive({
    notificationInfo: {} as ServiceChannelModel,
    refinedNotificationInfo: computed<ServiceChannelModel>(() => {
        if (state.notificationInfo.channel_type === SERVICE_CHANNEL_TYPE.FORWARD) {
            return {
                ...state.notificationInfo,
                protocol_id: 'forward',
            };
        }
        return state.notificationInfo;
    }),
    dayMapping: computed<Record<DayType, TranslateResult>>(() => ({
        MON: i18n.t('ALERT_MANAGER.NOTIFICATIONS.MONDAY'),
        TUE: i18n.t('ALERT_MANAGER.NOTIFICATIONS.TUESDAY'),
        WED: i18n.t('ALERT_MANAGER.NOTIFICATIONS.WEDNESDAY'),
        THU: i18n.t('ALERT_MANAGER.NOTIFICATIONS.THURSDAY'),
        FRI: i18n.t('ALERT_MANAGER.NOTIFICATIONS.FRIDAY'),
        SAT: i18n.t('ALERT_MANAGER.NOTIFICATIONS.SATURDAY'),
        SUN: i18n.t('ALERT_MANAGER.NOTIFICATIONS.SUNDAY'),
    })),
    fields: computed<DataTableFieldType[]>(() => {
        const forwardField = (state.notificationInfo.channel_type === SERVICE_CHANNEL_TYPE.FORWARD) ? [{ label: 'Member', name: 'data', disableCopy: true }] : [];
        return [
            { label: 'Name', name: 'name', disableCopy: true },
            { label: 'Channel', name: 'protocol_id' },
            { label: 'State', name: 'state', disableCopy: true },
            ...forwardField,
            { label: 'Schedule', name: 'schedule', disableCopy: true },
        ];
    }),
});

const getProtocolInfo = (id: string): ProtocolInfo => {
    if (id === 'forward') {
        if (state.notificationInfo.data?.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.ALL_MEMBER) {
            return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFY_TO_ALL_MEMBER') };
        }
        if (state.notificationInfo.data?.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.USER_GROUP) {
            return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFY_TO_USER_GROUP') };
        }
        if (state.notificationInfo.data?.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.USER) {
            return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFY_TO_USER') };
        }
        return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.ASSOCIATED_MEMBER') };
    }
    const protocol = storeState.notificationProtocolList.find((item) => item.protocol_id === id);
    return {
        name: protocol?.name || '',
        icon: protocol?.icon || '',
    };
};
const getUserGroupName = (userGroup: string[] = []): string => userGroup.map((group) => {
    const _userGroup = storeState.userGroup[group];
    return _userGroup?.name || '';
}).join(', ');
const getScheduleInfo = (schedule: ServiceChannelScheduleInfoType): ScheduleInfo => {
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
        const scheduleDay = s as ServiceChannelScheduleDayType;
        if (!scheduleDay) return;

        const startTime = formatTime(scheduleDay.start, 0);
        const endTime = formatTime(scheduleDay.end, 24);
        if (schedule.SCHEDULE_TYPE === 'WEEK_DAY') {
            scheduleInfo.days = Object.values(state.dayMapping).slice(0, 5).map((d) => d as TranslateResult);
            if (scheduleDay?.is_scheduled) {
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
    case SERVICE_CHANNEL_SCHEDULE_TYPE.WEEK_DAY:
        scheduleInfo.styleType = 'secondary1';
        scheduleInfo.value = i18n.t('COMMON.SCHEDULE_SETTING.WEEKDAYS');
        break;
    case SERVICE_CHANNEL_SCHEDULE_TYPE.ALL_DAY:
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
const fetchNotificationDetail = async (selectedId: string) => {
    try {
        state.notificationInfo = await SpaceConnector.clientV2.alertManager.serviceChannel.get<ServiceChannelGetParameters, ServiceChannelModel>({
            channel_id: selectedId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.notificationInfo = {} as ServiceChannelModel;
    }
};

watch(() => storeState.selectedNotificationId, async (selectedId) => {
    if (!selectedId) return;
    await fetchNotificationDetail(selectedId);
}, { immediate: true });
</script>

<template>
    <p-tab :tabs="tabState.notificationsDetailTabs"
           :active-tab.sync="tabState.activeNotificationsDetailTab"
           class="service-detail-tabs-webhook-detail-tabs"
    >
        <template #detail>
            <p-heading-layout>
                <template #heading>
                    <p-heading class="pt-8 px-4 pb-4"
                               heading-type="sub"
                               :title="$t('ALERT_MANAGER.WEBHOOK.BASE_INFO_TITLE')"
                    />
                </template>
            </p-heading-layout>
            <p-definition-table :fields="state.fields"
                                :data="state.refinedNotificationInfo"
                                :skeleton-rows="4"
                                block
            >
                <template #data-state="{data}">
                    <p-status class="capitalize"
                              v-bind="alertManagerStateFormatter(data)"
                    />
                </template>
                <template #data-protocol_id="{value}">
                    <div class="inline-flex items-center gap-2">
                        <p-i v-if="value === 'forward'"
                             name="ic_notification-protocol_users"
                             width="1rem"
                             height="1rem"
                        />
                        <p-lazy-img v-else
                                    :src="assetUrlConverter(getProtocolInfo(value).icon)"
                                    width="1rem"
                                    height="1rem"
                                    class="service-img"
                        />
                        <span>{{ getProtocolInfo(value).name }}</span>
                    </div>
                </template>
                <template #data-data="{value}">
                    <span v-if="value.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.ALL_MEMBER">{{ $t('ALERT_MANAGER.NOTIFICATIONS.ALL_MEMBER') }}</span>
                    <span v-else>
                        <span>{{ value.USER?.join(', ') }}</span>
                        <span>{{ getUserGroupName(value.USER_GROUP) }}</span>
                    </span>
                </template>
                <template #data-schedule="{value}">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-2">
                            <p>{{ $t('ALERT_MANAGER.NOTIFICATIONS.DAY') }}:</p>
                            <p-badge class="selected-item-badge"
                                     badge-type="solid-outline"
                                     :style-type="getScheduleInfo(value).styleType"
                            >
                                {{ getScheduleInfo(value).value }}
                            </p-badge>
                            <p>{{ getScheduleInfo(value).days }}</p>
                        </div>
                        <p>{{ $t('ALERT_MANAGER.NOTIFICATIONS.TIME') }}: {{ getScheduleInfo(value).time }}</p>
                        <p class="text-gray-500">
                            {{ $t('ALERT_MANAGER.TIMEZONE') }}: {{ getScheduleInfo(value).timezone }}
                        </p>
                    </div>
                </template>
            </p-definition-table>
        </template>
    </p-tab>
</template>

<style scoped lang="postcss">
.service-detail-tabs-webhook-detail-tabs {
    .col-type {
        display: inline-flex;
        align-items: center;
        .name {
            margin-top: -0.125rem;
        }
    }
}
</style>
