<template>
    <div class="cloud-service-history">
        <p-panel-top :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.HISTORY')"
                     :total-count="7"
                     use-total-count
        />
        <p-toolbox search-type="plain"
                   searchable
                   :pagination-visible="false"
                   :page-size-changeable="false"
        >
            <template #left-area>
                <p-datetime-picker data-type="yearToMonth"
                                   :selected-dates.sync="selectedDates"
                                   :timezone="timezone"
                />
            </template>
        </p-toolbox>
        <div class="timeline-wrapper">
            <vertical-timeline v-for="(item, idx) in items"
                               :key="`timeline-${item.date}-${idx}`"
                               :item="item"
                               :timezone="timezone"
                               :is-last-item="idx === items.length-1"
                               @click-timeline="handleClickTimeline"
            >
                <template v-if="item.data && item.data.length" #timeline-detail>
                    <div class="timeline-content-wrapper">
                        <key-value-item v-for="(keyValueItem, kIdx) in item.data.slice(0, TIMELINE_CONTENT_LIMIT)"
                                        :key="`key-value-item-${keyValueItem.key}-${kIdx}`"
                                        :item="keyValueItem"
                        />
                        <!--                    song-lang-->
                        <span v-if="item.data.length > TIMELINE_CONTENT_LIMIT" class="text-gray-500">and more...</span>
                    </div>
                </template>
            </vertical-timeline>
        </div>
        <transition name="slide-up">
            <cloud-service-history-detail-overlay v-if="showDetailOverlay"
                                                  :timeline-items="items"
                                                  :selected-timeline-item="selectedTimelineItem"
                                                  @close="handleCloseOverlay"
            />
        </transition>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { iso8601Formatter } from '@spaceone/console-core-lib';
import {
    PPanelTop, PToolbox, PDatetimePicker,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';

import KeyValueItem from '@/common/components/key-value-item/KeyValueItem.vue';
import VerticalTimeline from '@/common/components/vertical-timeline/VerticalTimeline.vue';

import CloudServiceHistoryDetailOverlay
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceHistoryDetailOverlay.vue';
import { CloudServiceTimelineItem } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';


const TIMELINE_CONTENT_LIMIT = 10;

export default {
    name: 'CloudServiceHistory',
    components: {
        CloudServiceHistoryDetailOverlay,
        KeyValueItem,
        VerticalTimeline,
        PPanelTop,
        PToolbox,
        PDatetimePicker,
    },
    props: {
        cloudServiceId: {
            type: String,
            default: '',
        },
    },
    setup() {
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            selectedDates: [] as string[],
            items: computed<CloudServiceTimelineItem[]>(() => ([
                {
                    id: 'sample1',
                    record_id: 'record-835c86043ee8',
                    date: '2022/07/05 15:00:00', // dayjs.utc().tz(state.timezone).format('YYYY/MM/DD HH:mm:ss'),
                    color: 'RED',
                    title: 'Deleted',
                },
                {
                    id: 'sample2',
                    record_id: 'record-17af21745fb0',
                    date: '2022/07/05 13:01:35', // dayjs.utc().tz(state.timezone).format('YYYY/MM/DD HH:mm:ss'),
                    color: 'GREEN',
                    title: 'Updated',
                    count: 11,
                    data: [
                        { key: 'tags', value: { os: 'Amazon Linux 2', dept: 'cloudone', type: 'spaceone' } },
                        { key: 'type', value: 't3a.large' },
                        { key: 'os_type' },
                        { key: 'key', value: 'value' },
                        { key: 'cloud_service_type' },
                        { key: 'ip_address', value: ['13.233.222.111', '192.168.1.10', '322.222.222.222'] },
                        { key: 'project_id' },
                        { key: 'key', value: 'value' },
                        { key: 'key', value: 'value' },
                        { key: 'key', value: 'value' },
                        { key: '11th', value: 'value' },
                    ],
                },
                {
                    id: 'sample3',
                    record_id: 'record-aaaaa',
                    date: '2022/07/05 11:00:21', // dayjs.utc().tz(state.timezone).format('YYYY/MM/DD HH:mm:ss'),
                    color: 'BLUE',
                    title: 'Created',
                    count: 5,
                    data: [
                        { key: 'tags' },
                        { key: 'os_type' },
                        { key: 'cloud_service_type' },
                        { key: 'ip_address' },
                        { key: 'project_id' },
                    ],
                },
            ])),
            selectedTimelineItem: undefined as undefined | CloudServiceTimelineItem,
            showDetailOverlay: false,
            loading: true,
            totalCount: 0,
            options: {
                sortBy: 'updated_at',
                sortDesc: true,
                pageStart: 1,
                pageLimit: 15,
                searchText: '',
            },
            collectors: computed(() => store.state.reference.collector.items),
        });

        /* Event */
        const handleClickTimeline = (item: CloudServiceTimelineItem) => {
            state.selectedTimelineItem = item;
            state.showDetailOverlay = true;
        };
        const handleCloseOverlay = () => {
            state.showDetailOverlay = false;
        };

        /* Watcher */
        // watch(() => props.cloudServiceId, (after, before) => {
        //     if (after !== before) listHistory();
        // }, { immediate: false });
        watch(() => state.timezone, (timezone) => {
            if (timezone) {
                state.selectedDates = [dayjs.utc().tz(timezone).format()];
            }
        }, { immediate: true });

        /* Init */
        (async () => {
            await Promise.allSettled([
                store.dispatch('reference/collector/load'),
                // listHistory(),
            ]);
        })();

        return {
            ...toRefs(state),
            iso8601Formatter,
            TIMELINE_CONTENT_LIMIT,
            handleClickTimeline,
            handleCloseOverlay,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cloud-service-history {
    .p-toolbox::v-deep {
        padding: 1.5rem 1rem 0.5rem;
        .p-datetime-picker {
            width: 120px;
        }
    }
    .timeline-wrapper {
        padding: 0 1.125rem;
    }
    .vertical-timeline {
        .timeline-content-wrapper {
            padding-top: 0.25rem;
        }
    }
}

/* transition */
.slide-up-enter-active {
    transition: all 0.3s ease;
}
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}
</style>
