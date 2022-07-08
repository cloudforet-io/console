<template>
    <div class="cloud-service-history-detail">
        <p-pane-layout class="page-wrapper">
            <!--            song-lang-->
            <p-page-title title="History Details" child @goBack="handleGoBack" />
            <div class="content-wrapper">
                <div class="left-part">
                    <div class="title-wrapper">
                        <!--                        song-lang-->
                        <span class="title">History</span>
                        <span class="total-count">({{ totalCount }})</span>
                    </div>
                    <vertical-timeline v-for="(item, idx) in historyItems"
                                       :key="`timeline-${item.recordId}-${idx}`"
                                       :date="item.date"
                                       :title="item.title"
                                       :count="item.diffCount"
                                       :color="getTimelineColor(item.action)"
                                       :timezone="timezone"
                                       :selected="item.recordId === selectedHistoryRecordId"
                                       :is-last-item="idx === historyItems.length-1"
                                       @click-timeline="handleClickTimeline(item)"
                    />
                </div>
                <div class="right-part">
                    <p-tab :tabs="tabs"
                           :active-tab.sync="activeTab"
                    >
                        <template #changed>
                            {{ selectedHistoryRecordId }}
                            changed-tab-component
                        </template>
                        <template #log>
                            <cloud-service-history-log-tab />
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
    computed, defineComponent, PropType, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PPaneLayout, PPageTitle, PTab,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import VerticalTimeline from '@/common/components/vertical-timeline/VerticalTimeline.vue';

import CloudServiceHistoryDetailNote
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-history-detail/CloudServiceHistoryDetailNote.vue';
import CloudServiceHistoryLogTab
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-history-detail/CloudServiceHistoryLogTab.vue';
import {
    CloudServiceHistoryItem, HISTORY_ACTION_MAP,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';

interface Props {
    historyItems: CloudServiceHistoryItem[];
    selectedHistoryItem: CloudServiceHistoryItem;
    totalCount: number;
}

export default defineComponent<Props>({
    name: 'CloudServiceHistoryDetailOverlay',
    components: {
        CloudServiceHistoryLogTab,
        VerticalTimeline,
        PPaneLayout,
        PPageTitle,
        PTab,
        CloudServiceHistoryDetailNote,
    },
    props: {
        historyItems: {
            type: Array,
            default: () => [] as PropType<CloudServiceHistoryItem[]>,
        },
        selectedHistoryItem: {
            type: Object,
            default: () => ({}) as PropType<CloudServiceHistoryItem>,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            selectedHistoryRecordId: '',
            tabs: computed(() => ([
                // song-lang
                { name: 'changed', label: i18n.t('Changed') },
                { name: 'log', label: i18n.t('Log') },
                { name: 'note', label: i18n.t('Note') },
            ] as TabItem[])),
            activeTab: 'changed',
        });

        /* Util */
        const getTimelineColor = (action: string) => HISTORY_ACTION_MAP[action].color;

        /* Event */
        const handleGoBack = () => {
            emit('close');
        };
        const handleClickTimeline = (selectedItem: CloudServiceHistoryItem) => {
            state.selectedHistoryRecordId = selectedItem.recordId;
        };

        /* Watcher */
        watch(() => props.selectedHistoryItem, (selectedTimelineItem) => {
            state.selectedHistoryRecordId = selectedTimelineItem?.recordId;
        }, { immediate: true });

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
                padding: 1.5rem 1rem;
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
            }
            .right-part {
                @apply col-span-9;
            }
        }
    }
}
</style>
