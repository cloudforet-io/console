<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PI, PPaneLayout, PTooltip, PFieldTitle, PSelectStatus, PIconButton, PDataTable, PBadge,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import type { ValueItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import type { Tags } from '@/schema/_common/model';
import { i18n } from '@/translations';

import { red } from '@/styles/colors';

import {
    ALERT_STATUS_FILTER,
    ALERT_URGENCY_FILTER,
} from '@/services/alert-manager-v2/constants/alert-manager-constant';
import type { AlertStatusFilterType, AlertUrgencyFilterType } from '@/services/alert-manager-v2/types/alert-manager-type';

type AlertStatusInfoType = {
    status: TranslateResult,
    total: number,
    high?: number,
    low?: number,
    name: AlertStatusFilterType
};
const state = reactive({
    alertStatusInfo: computed<AlertStatusInfoType[]>(() => [
        {
            status: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'),
            total: 300,
            high: 40,
            low: 40,
            name: ALERT_STATUS_FILTER.TRIGGERED,
        },
        {
            status: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'),
            total: 200,
            high: 10,
            low: 60,
            name: ALERT_STATUS_FILTER.ACKNOWLEDGED,
        },
        {
            status: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'),
            total: 800,
            high: 300,
            low: 400,
            name: ALERT_STATUS_FILTER.RESOLVED,
        },
    ]),
    selectedStatus: ALERT_STATUS_FILTER.TRIGGERED as AlertStatusFilterType,
    urgencyField: computed<ValueItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL') as string, name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.HIGH') as string, name: ALERT_URGENCY_FILTER.HIGH },
        { label: i18n.t('ALERT_MANAGER.ALERTS.LOW') as string, name: ALERT_URGENCY_FILTER.LOW },
    ])),
    selectedUrgency: 'ALL',
});
const tableState = reactive({
    // TODO: temp data
    items: [{
        name: 'Node Ready False Count alert',
        status: 'TRIGGERED',
        urgency: 'High',
        created_at: '2024-12-03 01:07:57',
    }],
    fields: computed<DataTableFieldType[]>(() => [
        {
            name: 'name', label: i18n.t('ALERT_MANAGER.ALERTS.LABEL_TITLE') as string, width: '50%', sortable: false,
        },
        {
            name: 'status', label: i18n.t('ALERT_MANAGER.STATUS') as string, width: '15%', sortable: false,
        },
        {
            name: 'urgency', label: i18n.t('ALERT_MANAGER.ALERTS.LABEL_URGENCY') as string, width: '15%', sortable: false,
        },
        {
            name: 'created_at', label: i18n.t('ALERT_MANAGER.ALERTS.CREATED') as string, width: '20%', sortable: false,
        },
    ]),
    loading: false,
    tags: {} as Tags,
    tagEditPageVisible: false,
});

const handleClickStatus = (name: AlertStatusFilterType) => {
    state.selectedStatus = name;
};
const handleSelectUrgency = (value: AlertUrgencyFilterType) => {
    state.selectedUrgency = value;
};
const handleClickRefresh = () => {
    console.log('TODO: handleClickRefresh');
};
</script>

<template>
    <div class="service-detail-tabs-overview-status-table">
        <div class="p-2 bg-gray-100">
            <div class="flex">
                <p-pane-layout v-for="(item, idx) in state.alertStatusInfo"
                               :key="`alert-status-${idx}`"
                               class="status"
                               :class="{
                                   'selected': state.selectedStatus === item.name,
                                   'no-right-border': state.selectedStatus === state.alertStatusInfo[idx + 1]?.name
                               }"
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
                    <p class="text-display-xl">
                        {{ item.total }}
                    </p>
                    <div class="flex gap-3 mt-0.5">
                        <div class="cnt-wrapper">
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
                                 :color="red[200]"
                            />
                            <span>{{ $t('ALERT_MANAGER.ALERTS.LOW') }}:</span>
                            <span>{{ item.low }}</span>
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
                                   @click="handleClickRefresh"
                    />
                </div>
                <p-data-table :fields="tableState.fields"
                              :items="tableState.items"
                              striped
                              no-border
                              sort-by="created_at"
                              sortable
                >
                    <template #col-status-format="{value}">
                        <p-badge style-type="alert">
                            {{ value }}
                        </p-badge>
                    </template>
                    <template #col-urgency-format="{value}">
                        <div class="flex items-center gap-2">
                            <p-i :name="value === ALERT_URGENCY_FILTER.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                                 width="1rem"
                                 height="1rem"
                                 :color="value === ALERT_URGENCY_FILTER.HIGH ? red[400] : red[200]"
                            />
                            <span class="text">{{ value }}</span>
                        </div>
                    </template>
                </p-data-table>
            </p-pane-layout>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-overview-status-table {
    padding: 0.875rem 1rem;
    .status {
        flex: 1;
        height: 9.375rem;
        padding: 1.5rem;
        border-bottom-color: transparent;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
        order: 1;
        &:hover {
            @apply cursor-pointer;
        }
        &:not(.selected) {
            @apply bg-transparent border-b;
            border-top-color: transparent;
            border-left-color: transparent;
            border-radius: 0;
            &:last-child {
                border-right-color: transparent;
            }
        }
        &.no-right-border {
            border-right-color: transparent;
        }
    }
    .cnt-wrapper {
        @apply flex items-center text-label-md;
        gap: 0.25rem;
    }
    .table-wrapper {
        margin-top: -0.125rem;
        padding-top: 1rem;
        padding-right: 1rem;
        padding-left: 1rem;
        order: 2;

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

        &.triggered {
            border-top-left-radius: 0;
        }

        &.resolved {
            border-top-right-radius: 0;
        }
    }
}
</style>
