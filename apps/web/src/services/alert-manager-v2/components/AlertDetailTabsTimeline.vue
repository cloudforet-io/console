<script setup lang="ts">
import {
    computed,
    reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PButtonModal, PCodeEditor, PToolbox, PHeading, PHeadingLayout, PDataLoader,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { AlertHistoryParameters } from '@/schema/alert-manager/alert/api-verbs/history';
import { ALERT_EVENT_ACTION } from '@/schema/alert-manager/alert/constants';
import type { AlertModel, AlertEventModel } from '@/schema/alert-manager/alert/model';
import type { AlertEventActionType } from '@/schema/alert-manager/alert/type';

import { useUserStore } from '@/store/user/user-store';

import { copyAnyData } from '@/lib/helper/copy-helper';

import VerticalTimelineItem from '@/common/components/vertical-timeline/VerticalTimelineItem.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useAlertDetailPageStore } from '@/services/alert-manager-v2/stores/alert-detail-page-store';

const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;
const userStore = useUserStore();
const userState = userStore.state;

const storeState = reactive({
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
    timezone: computed(() => userState.timezone),
});
const state = reactive({
    loading: true,
    historyList: [] as AlertEventModel[],
    slicedHistoryList: computed<AlertEventModel[]>(() => state.historyList.filter((i) => i.alert_id === state.searchText)
        .slice(0, state.pageStart * state.pageLimit)),
    totalCount: computed<string>(() => state.historyList.length),
    pageStart: 1,
    pageLimit: 10,
    searchText: '',
    selectedItem: {} as any,
    modalVisible: false,
    isAlertVisible: false,
});

const getStyleInfo = (item: AlertEventActionType) => {
    if (item === ALERT_EVENT_ACTION.TRIGGERED) return 'red';
    if (item === ALERT_EVENT_ACTION.ACKNOWLEDGED) return 'violet';
    if (item === ALERT_EVENT_ACTION.RESOLVED) return 'green';
    if (item === ALERT_EVENT_ACTION.NOTIFIED) return 'yellow';
    return 'gray';
};
const handleChangeToolbox = async (options: any = {}) => {
    if (options.searchText) {
        state.searchText = options.searchText;
        state.pageStart = 1;
    }
};
const handleClickShowMore = async () => {
    state.pageStart += 1;
};

const handleClickCopy = () => {
    copyAnyData(state.selectedItem.raw_data);
};

const fetchHistoryList = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.alert.history<AlertHistoryParameters, ListResponse<AlertEventModel>>({
            alert_id: storeState.alertInfo.alert_id,
        });
        state.historyList = results || [];
    } catch (e: any) {
        ErrorHandler.handleError(e, true);
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
        <p-data-loader :loading="state.loading"
                       :data="state.slicedHistoryList"
        >
            <p-toolbox search-type="plain"
                       filters-visible
                       :total-count="state.totalCount"
                       :page-size-changeable="false"
                       :pagination-visible="false"
                       class="mb-3"
                       @change="handleChangeToolbox"
                       @refresh="handleChangeToolbox"
            />
            <template v-if="state.slicedHistoryList.length > 0">
                <vertical-timeline-item v-for="(item, idx) in state.slicedHistoryList"
                                        :key="`history-item-${idx}`"
                                        :title="item.alert_id"
                                        :description="item.description"
                                        :datetime="item.created_at"
                                        :timezone="storeState.timezone"
                                        :style-type="getStyleInfo(item.action)"
                                        :is-last-item="idx === state.slicedHistoryList?.length - 1"
                                        class="timeline"
                />
            </template>
            <template #no-data>
                <span class="pt-12">{{ $t('ALERT_MANAGER.ALERTS.NO_EVENT') }}</span>
            </template>
        </p-data-loader>
        <div class="flex justify-center mt-6">
            <p-button v-if="state.historyList.length !== 0
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
        <p-button-modal v-if="state.modalVisible"
                        :header-title="$t('ALERT_MANAGER.ALERTS.EVENT_DETAILS')"
                        size="lg"
                        :visible.sync="state.modalVisible"
        >
            <template #body>
                <div class="event-detail-modal-content">
                    <p-code-editor :code="state.selectedItem"
                                   class="code-block"
                                   read-only
                                   folded
                    />
                </div>
            </template>
            <template #footer-extra>
                <div class="footer-extra">
                    <p-button style-type="tertiary"
                              icon-left="ic_copy"
                              @click="handleClickCopy"
                    >
                        {{ $t('ALERT_MANAGER.ALERTS.COPY_ALL') }}
                    </p-button>
                </div>
            </template>
        </p-button-modal>
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
}
</style>
