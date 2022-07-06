<template>
    <div class="cloud-service-history-detail">
        <p-pane-layout class="page-wrapper">
            <p-page-title title="History Details" child @goBack="handleGoBack" />
            <div class="content-wrapper">
                <div class="left-part">
                    <div class="title-wrapper">
                        <!--                        song-lang-->
                        <span class="title">History</span>
                        <span class="total-count">({{ timelineItems.length }})</span>
                    </div>
                    <vertical-timeline v-for="(item, idx) in timelineItems"
                                       :key="`timeline-${item.date}-${idx}`"
                                       :item="item"
                                       :timezone="timezone"
                                       :selected="item.id === selectedTimelineId"
                                       :is-last-item="idx === timelineItems.length-1"
                                       @click-timeline="handleClickTimeline"
                    />
                </div>
                <div class="right-part">
                    right part!
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
    PPaneLayout, PPageTitle,
} from '@spaceone/design-system';

import { store } from '@/store';

import VerticalTimeline from '@/common/components/vertical-timeline/VerticalTimeline.vue';

import { CloudServiceTimelineItem } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';

interface Props {
    timelineItems: CloudServiceTimelineItem[];
    selectedTimelineItem: CloudServiceTimelineItem;
}

export default defineComponent<Props>({
    name: 'CloudServiceHistoryDetailOverlay',
    components: {
        VerticalTimeline,
        PPaneLayout,
        PPageTitle,
    },
    props: {
        timelineItems: {
            type: Array,
            default: () => [],
        },
        selectedTimelineItem: {
            type: Object,
            default: () => ({}) as PropType<CloudServiceTimelineItem>,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            selectedTimelineId: '',
        });

        /* Event */
        const handleGoBack = () => {
            emit('close');
        };
        const handleClickTimeline = (selectedItem: CloudServiceTimelineItem) => {
            state.selectedTimelineId = selectedItem.id;
        };

        /* Watcher */
        watch(() => props.selectedTimelineItem, (selectedTimelineItem) => {
            if (selectedTimelineItem?.id) {
                state.selectedTimelineId = selectedTimelineItem.id;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
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
