<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PI, PPaneLayout, PTooltip, PFieldTitle, PSelectStatus, PIconButton, PDataTable, PBadge, PTextButton,
} from '@cloudforet/mirinae';
import type { ValueItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertListParameters } from '@/schema/alert-manager/alert/api-verbs/list';
import { ALERT_STATUS, ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { AlertStatusType, AlertUrgencyType } from '@/schema/alert-manager/alert/type';
import { SERVICE_ALERTS_TYPE } from '@/schema/alert-manager/service/constants';
import { i18n } from '@/translations';

import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray, red } from '@/styles/colors';

import {
    alertStatusBadgeStyleTypeFormatter,
    getAlertStateI18n, getAlertUrgencyI18n,
} from '@/services/alert-manager/v2/composables/alert-table-data';
import { SERVICE_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import { SERVICE_ALERT_TABLE_FIELDS } from '@/services/alert-manager/v2/constants/service-table-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { Service } from '@/services/alert-manager/v2/types/alert-manager-type';


type AlertStatusInfoType = {
    status: TranslateResult,
    total: number,
    high?: number,
    low?: number,
    name: AlertStatusType
};

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;


const router = useRouter();

const storeState = reactive({
    serviceInfo: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
    timezone: computed<string>(() => serviceDetailPageGetters.timezone),
});
const state = reactive({
    alertStatusInfo: computed<AlertStatusInfoType[]>(() => [
        {
            status: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'),
            total: storeState.serviceInfo.alerts.TRIGGERED.HIGH + storeState.serviceInfo.alerts.TRIGGERED.LOW,
            high: storeState.serviceInfo.alerts.TRIGGERED.HIGH,
            low: storeState.serviceInfo.alerts.TRIGGERED?.LOW,
            name: SERVICE_ALERTS_TYPE.TRIGGERED,
        },
        {
            status: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'),
            total: storeState.serviceInfo.alerts.ACKNOWLEDGED.HIGH + storeState.serviceInfo.alerts.ACKNOWLEDGED.LOW,
            high: storeState.serviceInfo.alerts.ACKNOWLEDGED.HIGH,
            low: storeState.serviceInfo.alerts.ACKNOWLEDGED.LOW,
            name: SERVICE_ALERTS_TYPE.ACKNOWLEDGED,
        },
        {
            status: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'),
            total: storeState.serviceInfo.alerts.RESOLVED.HIGH + storeState.serviceInfo.alerts.RESOLVED.LOW,
            high: storeState.serviceInfo.alerts.RESOLVED.HIGH,
            low: storeState.serviceInfo.alerts.RESOLVED.LOW,
            name: SERVICE_ALERTS_TYPE.RESOLVED,
        },
    ]),
    selectedStatus: SERVICE_ALERTS_TYPE.TRIGGERED as AlertStatusType,
    urgencyField: computed<ValueItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL') as string, name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.HIGH') as string, name: ALERT_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.ALERTS.LOW') as string, name: ALERT_URGENCY.LOW },
    ])),
    selectedUrgency: 'ALL',
});
const tableState = reactive({
    loading: false,
    alertsList: [] as AlertModel[],
    alertStateLabels: getAlertStateI18n(),
    urgencyLabels: getAlertUrgencyI18n(),
    totalCounts: 0,
    sortBy: '',
    sortDesc: false,
});

const alertListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);

const handleRouteAlerts = (id: string) => {
    router.push({
        name: ALERT_MANAGER_ROUTE.ALERTS.DETAIL._NAME,
        params: {
            alertId: id,
            serviceId: storeState.serviceInfo.service_id,
        },
    }).catch(() => {});
};
const handleRouteAlertsTab = async () => {
    await serviceDetailPageStore.setCurrentTab(SERVICE_DETAIL_TABS.ALERTS);
    await replaceUrlQuery({
        tab: SERVICE_DETAIL_TABS.ALERTS,
        status: state.selectedStatus,
        urgency: state.selectedUrgency,
    });
};
const handleClickStatus = (name: AlertStatusType) => {
    state.selectedStatus = name;
    fetchAlertsList();
};
const handleSelectUrgency = (value: AlertUrgencyType) => {
    state.selectedUrgency = value;
    fetchAlertsList();
};
const handleChangeToolbox = async (sortBy:string, sortDesc:boolean) => {
    tableState.sortBy = sortBy;
    tableState.sortDesc = sortDesc;
    alertListApiQueryHelper.setSort(sortBy, sortDesc);
    await fetchAlertsList();
};

const fetchAlertsList = async () => {
    tableState.loading = true;
    try {
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.alert.list<AlertListParameters, ListResponse<AlertModel>>({
            service_id: storeState.serviceInfo.service_id,
            status: state.selectedStatus,
            urgency: state.selectedUrgency === 'ALL' ? undefined : state.selectedUrgency as AlertUrgencyType,
            query: alertListApiQueryHelper.data,
        });
        tableState.alertsList = results || [];
        tableState.totalCounts = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        tableState.alertsList = [];
        tableState.totalCounts = 0;
    } finally {
        tableState.loading = false;
    }
};

watch(() => storeState.serviceInfo.service_id, (service_id) => {
    if (!service_id) return;
    fetchAlertsList();
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-overview-status-table">
        <div class="inner-contents p-4 bg-gray-100">
            <div class="alert-status-card flex">
                <p-pane-layout v-for="(item, idx) in state.alertStatusInfo"
                               :key="`alert-status-${idx}`"
                               class="status"
                               :class="[item.name, {
                                   'selected': state.selectedStatus === item.name,
                                   'no-right-border': state.selectedStatus === state.alertStatusInfo[idx + 1]?.name
                               }]"
                               @click="handleClickStatus(item.name)"
                >
                    <p-field-title :label="item.status"
                                   size="lg"
                                   font-weight="regular"
                    >
                        <template #right>
                            <p-tooltip position="bottom"
                                       :contents="$t('ALERT_MANAGER.ALERTS.TOOLTIP')"
                            >
                                <p-i name="ic_info-circle"
                                     height="0.75rem"
                                     width="0.75rem"
                                     color="inherit"
                                />
                            </p-tooltip>
                        </template>
                    </p-field-title>
                    <p class="total text-display-xl">
                        {{ item.total }}
                    </p>
                    <div class="flex gap-3 mt-0.5">
                        <div class="high cnt-wrapper">
                            <p-i name="ic_error-filled"
                                 width="0.75rem"
                                 height="0.75rem"
                                 :color="red[400]"
                            />
                            <span>{{ $t('ALERT_MANAGER.ALERTS.HIGH') }}:</span>
                            <span>{{ item.high }}</span>
                        </div>
                        <div class="cnt-wrapper">
                            <p-i name="ic_warning-filled"
                                 width="0.75rem"
                                 height="0.75rem"
                                 :color="gray[200]"
                            />
                            <p class="flex gap-1 text-gray-700">
                                <span>{{ $t('ALERT_MANAGER.ALERTS.LOW') }}:</span>
                                <span>{{ item.low }}</span>
                            </p>
                        </div>
                    </div>
                </p-pane-layout>
            </div>
            <p-pane-layout class="table-wrapper"
                           :class="[state.selectedStatus]"
            >
                <div class="select-urgency-wrapper">
                    <p-field-title class="label-urgency"
                                   size="sm"
                    >
                        {{ $t('ALERT_MANAGER.ALERTS.LABEL_URGENCY') }}
                    </p-field-title>
                    <p-select-status v-for="(item, idx) in state.urgencyField"
                                     :key="idx"
                                     :selected="state.selectedUrgency"
                                     class="mr-2"
                                     :value="item.name"
                                     @change="handleSelectUrgency"
                    >
                        {{ item.label }}
                    </p-select-status>
                    <p-icon-button class="ml-auto"
                                   name="ic_refresh"
                                   @click="fetchAlertsList"
                    />
                </div>
                <p-data-table :fields="SERVICE_ALERT_TABLE_FIELDS"
                              :items="tableState.alertsList"
                              :loading="tableState.loading"
                              striped
                              :bordered="false"
                              :sort-by.sync="tableState.sortBy"
                              :sort-desc.sync="tableState.sortDesc"
                              :show-footer="tableState.totalCounts > tableState.alertsList.length"
                              sortable
                              class="table"
                              @changeSort="handleChangeToolbox"
                >
                    <template #col-title-format="{ value, item }">
                        <p-text-button @click="handleRouteAlerts(item.alert_id)">
                            {{ value }}
                        </p-text-button>
                    </template>
                    <template #col-status-format="{value}">
                        <p-badge :style-type="alertStatusBadgeStyleTypeFormatter(value)"
                                 :badge-type="value === ALERT_STATUS.TRIGGERED ? 'solid' : 'subtle'"
                        >
                            {{ tableState.alertStateLabels[value] }}
                        </p-badge>
                    </template>
                    <template #col-urgency-format="{value}">
                        <div class="flex items-center gap-2">
                            <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                                 width="1rem"
                                 height="1rem"
                                 :color="value === ALERT_URGENCY.HIGH ? red[400] : gray[200]"
                            />
                            <span>{{ tableState.urgencyLabels[value] }}</span>
                        </div>
                    </template>
                    <template #col-created_at-format="{value}">
                        {{ iso8601Formatter(value, storeState.timezone) }}
                    </template>
                    <template #foot>
                        <td class="w-full table-cell bg-white text-label-sm font-normal text-center pt-2 pb-2"
                            :colspan="SERVICE_ALERT_TABLE_FIELDS.length"
                        >
                            <p-text-button style-type="highlight"
                                           class="ml-auto mr-auto"
                                           size="sm"
                                           @click="handleRouteAlertsTab"
                            >
                                {{ $t('ALERT_MANAGER.SERVICE.VIEW_ALL') }}
                            </p-text-button>
                        </td>
                    </template>
                </p-data-table>
            </p-pane-layout>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview-status-table {
    @apply overflow-x-auto;
    padding: 0.875rem 1rem;
    .inner-contents {
        min-width: 37.125rem;
        width: 100%;
        border-radius: 0.375rem;
        .status {
            flex: 1;
            height: 9.375rem;
            padding: 1.5rem;
            border-bottom-color: transparent;
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
            order: 1;
            &:hover {
                @apply cursor-pointer bg-gray-150;
            }
            &:not(.selected) {
                @apply bg-transparent border-b;
                border-top-color: transparent;
                border-left-color: transparent;
                border-radius: 0;
                &:last-child {
                    border-right-color: transparent;
                }
                &:hover {
                    @apply bg-gray-150;
                }
            }
            &.no-right-border {
                border-right-color: transparent;
            }
            &.TRIGGERED {
                .total {
                    @apply text-red-500;
                }
                .cnt-wrapper {
                    &.high {
                        @apply text-red-500;
                    }
                }
            }
        }
        .cnt-wrapper {
            @apply flex items-center text-label-md;
            gap: 0.25rem;
        }
        .table-wrapper {
            margin-top: -0.063rem;
            padding-top: 1rem;
            padding-right: 1rem;
            padding-left: 1rem;
            order: 2;

            .table {
                @apply overflow-y-auto;
                min-height: 17rem;
            }
            .select-urgency-wrapper {
                @apply flex items-center pb-3 text-gray-600;
                gap: 0.5rem;

                .label-urgency {
                    @apply relative;
                    padding-right: 0.75rem;

                    &::after {
                        @apply border-r border-gray-300 absolute;
                        content: '';
                        top: 0;
                        right: 0;
                        height: 100%;
                    }
                }
            }

            &.TRIGGERED {
                border-top-left-radius: 0;
            }

            &.RESOLVED {
                border-top-right-radius: 0;
            }
        }
    }
}
</style>
