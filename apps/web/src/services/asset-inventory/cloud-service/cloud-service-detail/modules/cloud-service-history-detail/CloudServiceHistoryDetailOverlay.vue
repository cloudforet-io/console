<script lang="ts" setup>
import { iso8601Formatter } from '@cloudforet/core-lib';
import {
    PPaneLayout, PHeading, PTab, PCopyButton, PBadge, PDivider, PSpinner,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { useInfiniteScroll } from '@vueuse/core';
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import VerticalTimeline from '@/common/components/vertical-timeline/VerticalTimeline.vue';
import { useProxyValue } from '@/common/composables/proxy-state';

import CloudServiceHistoryChangesTab
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-history-detail/CloudServiceHistoryChangesTab.vue';
import CloudServiceHistoryDetailNote
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-history-detail/CloudServiceHistoryDetailNoteTab.vue';
import CloudServiceLogTab
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceLogTab.vue';
import type { CloudServiceHistoryItem } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';
import { HISTORY_ACTION_MAP } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';

const TIMELINE_ITEM_LIMIT = 10;

interface Props {
    loading: boolean;
    historyItems: CloudServiceHistoryItem[];
    selectedHistoryItem: CloudServiceHistoryItem;
    selectedKeyName?: string;
    totalCount: number;
    provider: string;
    cloudServiceItem: any;
}

interface SelectedCloudServiceHistoryItem {
    cur: CloudServiceHistoryItem;
    prev: CloudServiceHistoryItem | undefined;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    historyItems: () => [],
    selectedHistoryItem: () => ({}) as CloudServiceHistoryItem,
    selectedKeyName: undefined,
    totalCount: 0,
    provider: '',
    cloudServiceItem: () => ({}),
});
const emit = defineEmits<{(e: 'update:selected-history-item', value: CloudServiceHistoryItem): void;
    (e: 'refresh-note-count'): void;
    (e: 'load-more'): void;
}>();
const { t } = useI18n();
const router = useRouter();

const state = reactive({
    resourceId: computed(() => props.cloudServiceItem.reference.resource_id),
    cloudServiceId: computed(() => props.cloudServiceItem.cloud_service_id),
    timelineWrapperRef: null as null | HTMLElement,
    selectedHistoryRecordId: '',
    selectedHistoryRecordDate: '',
    proxySelectedHistoryItem: useProxyValue('selectedHistoryItem', props, emit),
    tabs: computed(() => ([
        { name: 'changed', label: t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES') },
        { name: 'log', label: t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG') },
        { name: 'note', label: t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE') },
    ] as TabItem[])),
    activeTab: 'changed',
});

/* Util */
const getTimelineColor = (action: string) => HISTORY_ACTION_MAP[action].color;

/* Event */
const handleClickTimeline = (selectedItem: SelectedCloudServiceHistoryItem) => {
    state.proxySelectedHistoryItem = selectedItem.cur;
};
const handleRefreshNoteCount = () => {
    emit('refresh-note-count');
};

/* Watcher */
watch(() => props.selectedHistoryItem, (selectedTimelineItem: CloudServiceHistoryItem) => {
    state.selectedHistoryRecordId = selectedTimelineItem?.recordId;
    state.selectedHistoryRecordDate = selectedTimelineItem?.date;
}, { immediate: true });

onMounted(() => {
    const selectedRef = ref([`timelineRef_${props.selectedHistoryItem.recordId}`]) as any;
    if (selectedRef) {
        const selectedEl: HTMLElement = selectedRef[0].$el;
        selectedEl.scrollIntoView();
    }
    if (props.historyItems.length === TIMELINE_ITEM_LIMIT) {
        emit('load-more');
    }
    useInfiniteScroll(state.timelineWrapperRef, () => {
        emit('load-more');
    });
});

</script>

<template>
    <div class="cloud-service-history-detail-overlay">
        <p-pane-layout class="page-wrapper">
            <p-heading :title="t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.HISTORY_DETAIL')"
                       show-back-button
                       @click-back-button="router.go(-1)"
            >
                <template #title-right-extra>
                    <div class="title-right-extra">
                        <template v-if="cloudServiceItem.name">
                            <span class="label-text">Name: </span>
                            {{ cloudServiceItem.name }}
                            <p-divider vertical />
                        </template>
                        <span class="label-text">Resource ID: </span>
                        <p-copy-button>
                            {{ state.resourceId }}
                        </p-copy-button>
                    </div>
                </template>
            </p-heading>
            <div class="content-wrapper">
                <div class="left-part">
                    <div class="title-wrapper">
                        <span class="title">{{ t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.HISTORY') }}</span>
                        <span class="total-count">({{ totalCount }})</span>
                    </div>
                    <div ref="timelineWrapperRef"
                         class="timeline-wrapper"
                    >
                        <vertical-timeline v-for="(item, idx) in historyItems"
                                           :ref="`timelineRef_${item.recordId}`"
                                           :key="`timeline-${item.recordId}-${idx}`"
                                           :date="item.date"
                                           :title="item.title"
                                           :count="item.diffCount"
                                           :color="getTimelineColor(item.action)"
                                           :selected="item.recordId === state.selectedHistoryRecordId"
                                           :is-last-item="idx === historyItems.length-1"
                                           is-title-vertical
                                           @click-timeline="handleClickTimeline({cur: item, prev: historyItems[idx+1]})"
                        >
                            <template #additional-title>
                                <div v-if="item.noteItemMap.length">
                                    <span class="additional-title">{{ t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE') }}</span>
                                    <p-badge badge-type="subtle"
                                             style-type="gray200"
                                    >
                                        {{ item.noteItemMap.length }}
                                    </p-badge>
                                </div>
                            </template>
                        </vertical-timeline>
                        <p-spinner v-if="loading"
                                   size="xl"
                        />
                    </div>
                </div>
                <div class="right-part">
                    <div class="info-wrapper">
                        <div class="circle"
                             :class="getTimelineColor(state.proxySelectedHistoryItem.action)"
                        />
                        <span class="action-text">{{ HISTORY_ACTION_MAP[state.proxySelectedHistoryItem.action].label }}</span>
                        <span class="date-text">({{ iso8601Formatter(state.selectedHistoryRecordDate, 'UTC') }})</span>
                    </div>
                    <p-tab v-model:active-tab="state.activeTab"
                           :tabs="state.tabs"
                    >
                        <template #changed>
                            <cloud-service-history-changes-tab
                                :selected-history-item="state.proxySelectedHistoryItem"
                                :selected-key-name="selectedKeyName"
                            />
                        </template>
                        <template #log>
                            <cloud-service-log-tab :provider="provider"
                                                   :cloud-service-id="state.cloudServiceId"
                                                   :date="state.selectedHistoryRecordDate"
                            />
                        </template>
                        <template #note>
                            <cloud-service-history-detail-note :record-id="state.selectedHistoryRecordId"
                                                               @refresh-note-count="handleRefreshNoteCount"
                            />
                        </template>
                    </p-tab>
                </div>
            </div>
        </p-pane-layout>
    </div>
</template>

<style lang="postcss" scoped>
.cloud-service-history-detail-overlay {
    @apply bg-gray-100;
    position: fixed;
    display: flex;
    width: 100%;
    height: 100%;
    top: $gnb-height;
    left: 0;
    flex-direction: column;
    z-index: 99;

    /* transition: opacity 0.3s ease; */
    max-height: 100%;
    min-height: 100%;
    max-width: 100vw;

    .page-wrapper {
        @apply bg-gray-100;
        width: 100%;
        border: none;
        flex-grow: 1;

        /* custom design-system component - p-heading */
        :deep(.p-heading) {
            min-height: 3.5rem;
            height: auto;
            padding: 1.5rem 1.5rem 0;
            margin: 0;
            .title-right-extra {
                display: flex;
                flex-flow: wrap;
                align-items: center;
                float: right;
                font-size: 0.875rem;
                .p-divider {
                    margin: 0 0.75rem;
                    height: 0.875rem;
                }
                .label-text {
                    @apply text-gray-500;
                    padding-right: 0.25rem;
                }
            }
        }
        .content-wrapper {
            @apply flex;
            position: relative;
            height: calc(100vh - $(gnb-height) - 4rem);
            gap: 1rem;
            padding: 1rem 1.5rem;

            .left-part {
                @apply bg-white border border-gray-200 rounded-md;
                display: flex;
                flex-direction: column;
                min-width: 17.75rem;
                height: 100%;
                padding: 1.5rem 1rem 0;
                .title-wrapper {
                    font-size: 1rem;
                    padding-bottom: 0.75rem;
                    .additional-title {
                        padding-right: 0.25rem;
                    }
                    .total-count {
                        @apply text-gray-500;
                        padding-left: 0.25rem;
                    }
                }
                .timeline-wrapper {
                    height: 76vh;
                    overflow-y: auto;
                    .vertical-timeline {
                        padding-right: 1rem;
                    }
                    .p-spinner {
                        display: flex;
                        height: 5rem;
                        justify-content: center;
                        align-items: center;
                    }
                }
            }
            .right-part {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                gap: 1rem;

                /* custom design-system component - p-tab */
                :deep(.p-tab) {
                    flex-grow: 1;
                    .tab-item-wrapper {
                        height: 2.75rem;
                    }
                    .tab-pane {
                        height: calc(100% - 2.75rem);
                        padding: 0;
                    }
                }
                .info-wrapper {
                    @apply border border-gray-200 rounded-md bg-white;
                    position: relative;
                    display: flex;
                    align-items: center;
                    height: 4.125rem;
                    padding: 1.5rem 1rem;
                    .circle {
                        width: 1rem;
                        height: 1rem;
                        border-radius: theme('borderRadius.full');
                        left: -0.5rem;
                        top: 1rem;
                        margin-right: 0.5rem;
                        &.RED {
                            @apply border-4 border-red-200 bg-red-400;
                        }
                        &.GREEN {
                            @apply border-4 border-green-300 bg-green-600;
                        }
                        &.BLUE {
                            @apply border-4 border-blue-300 bg-blue-600;
                        }
                    }
                    .action-text {
                        font-size: 0.875rem;
                        font-weight: 700;
                        padding-right: 0.25rem;
                    }
                    .date-text {
                        @apply text-gray-500;
                        font-size: 0.875rem;
                    }
                }
            }
        }
    }
}

@screen tablet {
    .cloud-service-history-detail-overlay {
        display: block;
        overflow-y: auto;
        .page-wrapper {
            .content-wrapper {
                display: grid;
                height: auto;
                gap: 1rem;
                .left-part, .right-part {
                    display: grid;
                    gap: 1rem;
                    .timeline-wrapper {
                        max-height: 12rem;
                    }
                }
            }
        }
    }
}
</style>
