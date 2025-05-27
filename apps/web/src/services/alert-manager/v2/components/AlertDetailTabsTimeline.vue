<script setup lang="ts">
import {
    computed,
    reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { useQueryClient } from '@tanstack/vue-query';

import {
    PButton, PToolbox, PHeading, PHeadingLayout, PDataLoader, PDivider, PSelectStatus, PTextButton,
} from '@cloudforet/mirinae';

import { useAlertApi } from '@/api-clients/alert-manager/alert/composables/use-alert-api';
import { ALERT_HISTORY_ACTION } from '@/api-clients/alert-manager/alert/schema/constants';
import type { AlertHistoryModel } from '@/api-clients/alert-manager/alert/schema/model';
import type { AlertHistoryActionType } from '@/api-clients/alert-manager/alert/schema/type';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { AppReferenceMap } from '@/store/reference/app-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import type { WebhookReferenceMap } from '@/store/reference/webhook-reference-store';
import { useUserStore } from '@/store/user/user-store';

import VerticalTimelineItem from '@/common/components/vertical-timeline/VerticalTimelineItem.vue';

import AlertDetailTabsTimelineModal from '@/services/alert-manager/v2/components/AlertDetailTabsTimelineModal.vue';
import { useAlertGetQuery } from '@/services/alert-manager/v2/composables/use-alert-get-query';
import type { AlertFilterType } from '@/services/alert-manager/v2/types/alert-manager-type';

type HistoryItemInfo = {
    title: string;
    styleType?: string;
};

const userStore = useUserStore();
const userState = userStore.state;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const route = useRoute();

const { alertData } = useAlertGetQuery(route.params.alertId as string);

const storeState = reactive({
    timezone: computed<string>(() => userState.timezone || 'UTC'),
    webhook: computed<WebhookReferenceMap>(() => allReferenceGetters.webhook),
    app: computed<AppReferenceMap>(() => allReferenceGetters.app),
    user: computed<UserReferenceMap>(() => allReferenceGetters.user),
});
const state = reactive({
    slicedHistoryList: computed<AlertHistoryModel[]>(() => {
        let _list = alertHistoryData.value || [];
        if (filterState.searchText) {
            _list = _list.filter((item) => item.description.toLowerCase().includes(filterState.searchText.toLowerCase()));
        }
        if (filterState.selectedAction !== 'ALL') {
            if (filterState.selectedAction === 'NOTIFIED') {
                _list = _list.filter((item) => item.action === ALERT_HISTORY_ACTION.NOTIFIED_FAILURE
                    || item.action === ALERT_HISTORY_ACTION.NOTIFIED_SUCCESS
                    || item.action === ALERT_HISTORY_ACTION.NOTIFIED_SKIPPED);
            } else {
                _list = _list.filter((item) => item.action === filterState.selectedAction);
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

const queryClient = useQueryClient();
const { alertAPI } = useAlertApi();
const { key: alertHistoryQueryKey, params: alertHistoryQueryParams } = useServiceQueryKey('alert-manager', 'alert', 'history', {
    params: computed(() => ({
        alert_id: alertData.value?.alert_id || '',
        include_details: true,
    })),
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
const refreshHistoryList = () => {
    queryClient.invalidateQueries({ queryKey: alertHistoryQueryKey });
};

const { data: alertHistoryData, isFetching: alertHistoryLoading } = useScopedQuery({
    queryKey: alertHistoryQueryKey,
    queryFn: () => alertAPI.history(alertHistoryQueryParams.value),
    select: (data) => data.results || [],
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
}, ['WORKSPACE']);
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
                   :total-count="alertHistoryData?.length || 0"
                   :page-size-changeable="false"
                   :pagination-visible="false"
                   :search-text="filterState.searchText"
                   @update:search-text="handleChangeToolbox"
                   @refresh="refreshHistoryList()"
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
        <p-data-loader :loading="alertHistoryLoading"
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
                          && (alertHistoryData?.length || 0) > 10
                          && (alertHistoryData?.length || 0) > state.slicedHistoryList.length"
                      icon-right="ic_chevron-down"
                      size="sm"
                      style-type="secondary"
                      :loading="alertHistoryLoading"
                      @click="handleClickShowMore"
            >
                {{ $t('ALERT_MANAGER.SHOW_MORE') }}
            </p-button>
        </div>
        <alert-detail-tabs-timeline-modal v-if="state.modalVisible"
                                          :visible.sync="state.modalVisible"
                                          :type="state.modalType"
                                          :history="state.selectedItem"
                                          :service-id="alertData?.service_id || ''"
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
