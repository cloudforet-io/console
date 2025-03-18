<script setup lang="ts">
import {
    computed,
    reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PToolbox, PHeading, PHeadingLayout, PDataLoader, PDivider, PSelectStatus, PTextButton,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertHistoryParameters } from '@/schema/alert-manager/alert/api-verbs/history';
import { ALERT_HISTORY_ACTION } from '@/schema/alert-manager/alert/constants';
import type { AlertModel, AlertHistoryModel } from '@/schema/alert-manager/alert/model';
import type { AlertHistoryActionType } from '@/schema/alert-manager/alert/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { AppReferenceMap } from '@/store/reference/app-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';

import VerticalTimelineItem from '@/common/components/vertical-timeline/VerticalTimelineItem.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import AlertDetailTabsTimelineModal from '@/services/alert-manager/v2/components/AlertDetailTabsTimelineModal.vue';
import { useAlertDetailPageStore } from '@/services/alert-manager/v2/stores/alert-detail-page-store';
import type { AlertFilterType } from '@/services/alert-manager/v2/types/alert-manager-type';

type HistoryItemInfo = {
    title: string;
    styleType?: string;
};

const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;
const alertDetailPageGetters = alertDetailPageStore.getters;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
    timezone: computed<string>(() => alertDetailPageGetters.timezone),
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    app: computed<AppReferenceMap>(() => allReferenceGetters.app),
    user: computed<UserReferenceMap>(() => allReferenceGetters.user),
});
const state = reactive({
    loading: true,
    historyList: [] as AlertHistoryModel[],
    slicedHistoryList: computed<AlertHistoryModel[]>(() => {
        let _list = state.historyList;
        if (filterState.searchText) {
            _list = state.historyList.filter((item) => item.description.toLowerCase().includes(filterState.searchText.toLowerCase()));
        } else {
            _list = state.historyList;
        }
        if (filterState.selectedAction !== 'ALL') {
            if (filterState.selectedAction === 'NOTIFIED') {
                _list = state.historyList.filter((item) => item.action === ALERT_HISTORY_ACTION.NOTIFIED_FAILURE
                    || item.action === ALERT_HISTORY_ACTION.NOTIFIED_SUCCESS
                    || item.action === ALERT_HISTORY_ACTION.NOTIFIED_SKIPPED);
            } else {
                _list = state.historyList.filter((item) => item.action === filterState.selectedAction);
            }
        }
        return _list.slice(0, state.pageStart * state.pageLimit);
    }),
    pageStart: 1,
    pageLimit: 10,
    selectedItem: {} as AlertHistoryModel,
    modalVisible: false,
    modalType: ALERT_HISTORY_ACTION.EVENT_PUSHED as AlertHistoryActionType,
});
const filterState = reactive({
    statusFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_HISTORY_ACTION.TRIGGERED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), name: ALERT_HISTORY_ACTION.ACKNOWLEDGED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), name: ALERT_HISTORY_ACTION.RESOLVED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.NOTIFIED'), name: 'NOTIFIED' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.EVENT_PUSHED'), name: ALERT_HISTORY_ACTION.EVENT_PUSHED },
    ])),
    selectedAction: 'ALL',
    searchText: '',
});

const getCreatedByNames = (createdBy: string): string => {
    if (createdBy.includes('webhook')) {
        return storeState.webhook[createdBy].label || createdBy;
    }
    if (createdBy.includes('app')) {
        return storeState.app[createdBy].label || createdBy;
    }
    if (createdBy.includes('SYSTEM')) {
        return createdBy;
    }
    return storeState.user[createdBy]?.name ? `${storeState.user[createdBy]?.name} (${storeState.user[createdBy]?.key})` : storeState.user[createdBy]?.key || createdBy;
};
const getItemInfo = (item: AlertHistoryActionType): HistoryItemInfo => {
    let styleType: string|undefined;
    if (item === ALERT_HISTORY_ACTION.TRIGGERED) styleType = 'red';
    if (item === ALERT_HISTORY_ACTION.ACKNOWLEDGED) styleType = 'violet';
    if (item === ALERT_HISTORY_ACTION.RESOLVED) styleType = 'green';
    if (item === ALERT_HISTORY_ACTION.NOTIFIED_FAILURE || item === ALERT_HISTORY_ACTION.NOTIFIED_SUCCESS || item === ALERT_HISTORY_ACTION.NOTIFIED_SKIPPED) styleType = 'yellow';
    if (item === ALERT_HISTORY_ACTION.EVENT_PUSHED) styleType = 'gray';
    return {
        title: item.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
        styleType,
    };
};

const handleClickHistoryItem = (item: AlertHistoryModel, action: AlertHistoryActionType) => {
    state.modalVisible = true;
    state.modalType = action;
    state.selectedItem = item;
};
const handleSelectAction = (value: string) => {
    filterState.selectedAction = value;
    state.pageStart = 1;
};
const handleChangeToolbox = async (value: string) => {
    filterState.searchText = value;
    state.pageStart = 1;
};
const handleClickShowMore = async () => {
    state.pageStart += 1;
};

const fetchHistoryList = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.alert.history<AlertHistoryParameters, ListResponse<AlertHistoryModel>>({
            alert_id: storeState.alertInfo.alert_id,
            include_details: true,
        });
        state.historyList = results || [];
    } catch (e: any) {
        ErrorHandler.handleError(e);
        state.historyList = [];
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.alertInfo, async (alertInfo) => {
    if (!alertInfo) return;
    await fetchHistoryList();
}, { immediate: true });
</script>

<template>
    <section class="alert-detail-tabs-timeline pt-6 px-4 pb-10">
        <p-heading-layout class="pb-4">
            <template #heading>
                <p-heading heading-type="sub"
                           :title="$t('ALERT_MANAGER.ALERTS.TIMELINE')"
                />
            </template>
        </p-heading-layout>
        <p-toolbox search-type="plain"
                   filters-visible
                   :total-count="state.historyList.length"
                   :page-size-changeable="false"
                   :pagination-visible="false"
                   :search-text="filterState.searchText"
                   @update:search-text="handleChangeToolbox"
                   @refresh="fetchHistoryList()"
        />
        <div class="action-filter-wrapper">
            <span class="font-bold">{{ $t('ALERT_MANAGER.ALERTS.TYPE') }}</span>
            <p-divider class="divider"
                       vertical
            />
            <p-select-status v-for="(item, idx) in filterState.statusFields"
                             :key="idx"
                             :selected="filterState.selectedAction"
                             :value="item.name"
                             class="text-gray-600"
                             @change="handleSelectAction"
            >
                {{ item.label }}
            </p-select-status>
        </div>
        <p-data-loader :loading="state.loading"
                       :data="state.slicedHistoryList"
                       class="min-h-10"
        >
            <template v-if="state.slicedHistoryList.length > 0">
                <p-divider />
                <div class="mt-4">
                    <vertical-timeline-item v-for="(item, idx) in state.slicedHistoryList"
                                            :key="`history-item-${idx}`"
                                            :title="getItemInfo(item.action).title"
                                            :datetime="item.created_at"
                                            :timezone="storeState.timezone"
                                            :style-type="getItemInfo(item.action)?.styleType"
                                            :is-last-item="idx === state.slicedHistoryList?.length - 1"
                    >
                        <template #top-right>
                            <span class="ml-auto text-label-sm text-gray-600">
                                {{ $t('ALERT_MANAGER.ALERTS.CREATED_BY', { user: getCreatedByNames(item.created_by) }) }}
                            </span>
                        </template>
                        <p-text-button v-if="item.action === ALERT_HISTORY_ACTION.EVENT_PUSHED
                                           || item.action === ALERT_HISTORY_ACTION.NOTIFIED_FAILURE
                                           || item.action === ALERT_HISTORY_ACTION.NOTIFIED_SUCCESS"
                                       style-type="highlight"
                                       size="md"
                                       @click="handleClickHistoryItem(item, item.action)"
                        >
                            {{ item.description }}
                        </p-text-button>
                        <span v-else
                              class="text-gray-700"
                        >
                            {{ item.description }}
                        </span>
                    </vertical-timeline-item>
                </div>
            </template>
            <template #no-data>
                <span class="pt-12">{{ $t('ALERT_MANAGER.ALERTS.NO_EVENT') }}</span>
            </template>
        </p-data-loader>
        <div class="flex justify-center mt-6">
            <p-button v-if="state.slicedHistoryList.length > 0
                          && state.historyList.length > 10
                          && state.historyList.length > state.slicedHistoryList.length"
                      icon-right="ic_chevron-down"
                      size="sm"
                      style-type="secondary"
                      :loading="state.loading"
                      @click="handleClickShowMore"
            >
                {{ $t('ALERT_MANAGER.SHOW_MORE') }}
            </p-button>
        </div>
        <alert-detail-tabs-timeline-modal v-if="state.modalVisible"
                                          :visible.sync="state.modalVisible"
                                          :type="state.modalType"
                                          :history="state.selectedItem"
        />
    </section>
</template>

<style lang="postcss" scoped>
.alert-detail-tabs-timeline {
    .event-detail-modal-content {
        max-height: 20.68rem;
    }
    .code-block {
        min-height: 100%;
    }
    .action-filter-wrapper {
        @apply flex items-center flex-wrap text-label-sm;
        gap: 0.75rem;
        margin-bottom: 1rem;
        .divider {
            height: 1rem;
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
        }
    }
}
</style>
