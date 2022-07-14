<template>
    <div class="cloud-service-history-detail">
        <p-pane-layout class="page-wrapper">
            <p-page-title :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.HISTORY_DETAIL')" child @goBack="handleGoBack" />
            <div class="content-wrapper">
                <div class="left-part">
                    <div class="title-wrapper">
                        <span class="title">{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.HISTORY') }}</span>
                        <span class="total-count">({{ totalCount }})</span>
                    </div>
                    <div ref="timelineWrapperRef" class="timeline-wrapper">
                        <vertical-timeline v-for="(item, idx) in historyItems"
                                           :ref="`timelineRef_${item.recordId}`"
                                           :key="`timeline-${item.recordId}-${idx}`"
                                           :date="item.date"
                                           :title="item.title"
                                           :count="item.diffCount"
                                           :color="getTimelineColor(item.action)"
                                           :selected="item.recordId === selectedHistoryRecordId"
                                           :is-last-item="idx === historyItems.length-1"
                                           @click-timeline="handleClickTimeline({cur: item, prev: historyItems[idx+1]})"
                        >
                            />
                            <p-lottie v-if="loading" name="thin-spinner" auto
                                      :size="2"
                            />
                        </vertical-timeline>
                    </div>
                </div>
                <div class="right-part">
                    <p-tab :tabs="tabs"
                           :active-tab.sync="activeTab"
                    >
                        <template #changed>
                            <cloud-service-history-changes-tab :selected-history-item="proxySelectedHistoryItem" />
                        </template>
                        <template #log>
                            <cloud-service-history-log-tab :provider="provider"
                                                           :cloud-service-id="cloudServiceId"
                                                           :date="selectedHistoryRecordDate"
                                                           :prev-date="selectedPrevHistoryRecordDate"
                            />
                        </template>
                        <template #note>
                            <cloud-service-history-detail-note :record-id="selectedHistoryRecordId" />
                        </template>
                    </p-tab>
                </div>
            </div>
        </p-pane-layout>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, defineComponent, getCurrentInstance, onMounted, PropType, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PPaneLayout, PPageTitle, PTab, PLottie,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { useInfiniteScroll } from '@vueuse/core';

import { i18n } from '@/translations';

import VerticalTimeline from '@/common/components/vertical-timeline/VerticalTimeline.vue';
import { useProxyValue } from '@/common/composables/proxy-state';

import CloudServiceHistoryChangesTab
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-history-detail/CloudServiceHistoryChangesTab.vue';
import CloudServiceHistoryDetailNote
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-history-detail/CloudServiceHistoryDetailNoteTab.vue';
import CloudServiceHistoryLogTab
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-history-detail/CloudServiceHistoryLogTab.vue';
import {
    CloudServiceHistoryItem, HISTORY_ACTION_MAP,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';


interface Props {
    loading: boolean;
    historyItems: CloudServiceHistoryItem[];
    selectedHistoryItem: CloudServiceHistoryItem;
    selectedKeyName?: string;
    totalCount: number;
    provider: string;
    cloudServiceId: string;
}

interface SelectedCloudServiceHistoryItem {
    cur: CloudServiceHistoryItem;
    prev: CloudServiceHistoryItem | undefined;
}

export default defineComponent<Props>({
    name: 'CloudServiceHistoryDetailOverlay',
    components: {
        CloudServiceHistoryChangesTab,
        CloudServiceHistoryLogTab,
        VerticalTimeline,
        PPaneLayout,
        PPageTitle,
        PTab,
        CloudServiceHistoryDetailNote,
        PLottie,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        historyItems: {
            type: Array,
            default: () => [] as PropType<CloudServiceHistoryItem[]>,
        },
        selectedHistoryItem: {
            type: Object,
            default: () => ({}) as PropType<CloudServiceHistoryItem>,
        },
        selectedKeyName: {
            type: String,
            default: undefined,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        provider: {
            type: String,
            default: '',
        },
        cloudServiceId: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;
        const state = reactive({
            timelineWrapperRef: null as null | HTMLElement,
            selectedHistoryRecordId: '',
            selectedHistoryRecordDate: '',
            selectedPrevHistoryRecordDate: '' as CloudServiceHistoryItem['date']|undefined,
            proxySelectedHistoryItem: useProxyValue('selectedHistoryItem', props, emit),
            tabs: computed(() => ([
                { name: 'changed', label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.CHANGES') },
                { name: 'log', label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.LOG') },
                { name: 'note', label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE') },
            ] as TabItem[])),
            activeTab: 'changed',
        });

        /* Util */
        const getTimelineColor = (action: string) => HISTORY_ACTION_MAP[action].color;

        /* Event */
        const handleGoBack = () => {
            // todo: hash 값으로 이동하도록 수정
            emit('close');
        };
        const handleClickTimeline = (selectedItem: SelectedCloudServiceHistoryItem) => {
            state.proxySelectedHistoryItem = selectedItem.cur;
            state.selectedPrevHistoryRecordDate = selectedItem.prev?.date;
        };

        /* Watcher */
        watch(() => props.selectedHistoryItem, (selectedTimelineItem: CloudServiceHistoryItem) => {
            state.selectedHistoryRecordId = selectedTimelineItem?.recordId;
            state.selectedHistoryRecordDate = selectedTimelineItem?.date;
        }, { immediate: true });

        onMounted(() => {
            const selectedRef = vm.$refs[`timelineRef_${props.selectedHistoryItem.recordId}`] as any;
            if (selectedRef) {
                const selectedEl: HTMLElement = selectedRef[0].$el;
                selectedEl.scrollIntoView();
            }
            useInfiniteScroll(state.timelineWrapperRef, () => {
                emit('load-more');
            });
        });

        return {
            ...toRefs(state),
            getTimelineColor,
            handleGoBack,
            handleClickTimeline,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-history-detail {
    position: absolute;
    display: flex;
    width: 100%;
    height: 100%;
    top: 0;
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

        .p-page-title {
            @apply bg-white;
            padding: 1.5rem;
            margin: 0;
        }
        .content-wrapper {
            @apply grid grid-cols-12;
            gap: 1rem;
            padding: 1.5rem;

            .left-part {
                @apply col-span-3 bg-white border border-gray-200 rounded-md;
                padding: 1.5rem 1rem 0 1rem;
                .title-wrapper {
                    font-size: 1rem;
                    padding-bottom: 0.75rem;
                    .title {
                        font-weight: bold;
                        padding-right: 0.25rem;
                    }
                    .total-count {
                        @apply text-gray-500;
                    }
                }
                .timeline-wrapper {
                    height: 72vh;
                    overflow-y: auto;
                    padding-bottom: 1.5rem;
                    .p-lottie {
                        display: flex;
                        height: 5rem;
                        justify-content: center;
                        align-items: center;
                    }
                }
            }
            .right-part::v-deep {
                @apply col-span-9;
                .p-data-table {
                    max-height: 45vh;
                }
            }
        }
    }
}
</style>
