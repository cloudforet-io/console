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
        <vertical-timeline v-for="(item, idx) in items"
                           :key="`timeline-${item.date}-${idx}`"
                           :item="item"
                           :timezone="timezone"
                           :is-last-item="idx===items.length-1"
        >
            <template v-if="item.data && item.data.length" #timeline-detail>
                <div class="timeline-content-wrapper">
                    <key-value-item v-for="(keyValueItem, kIdx) in item.data.slice(0, TIMELINE_CONTENT_LIMIT)"
                                    :key="`key-value-item-${keyValueItem.key}-${kIdx}`"
                                    :item="keyValueItem"
                    />
                    <!--                    song-lang-->
                    <span v-if="item.data.length >TIMELINE_CONTENT_LIMIT" class="text-gray-500">and more...</span>
                </div>
            </template>
        </vertical-timeline>
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


interface TimelineItem {
    date: string;
    color: string;
    title: string;
    count?: number;
    data?: { key: string, value?: any }[];
}

const TIMELINE_CONTENT_LIMIT = 10;

export default {
    name: 'CloudServiceHistory',
    components: {
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
            items: computed<TimelineItem[]>(() => ([
                {
                    date: '2022/07/05 15:00:00', // dayjs.utc().tz(state.timezone).format('YYYY/MM/DD HH:mm:ss'),
                    color: 'RED',
                    title: 'Deleted',
                },
                {
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
        console.log(dayjs.utc().tz(state.timezone));

        /* Api */
        // const apiQuery = new ApiQueryHelper();
        // const getParams = () => ({
        //     cloud_service_id: props.cloudServiceId,
        //     key_path: 'collection_info.change_history',
        //     query: apiQuery.setSort(state.options.sortBy, state.options.sortDesc)
        //         .setPage(
        //             state.options.pageStart,
        //             state.options.pageLimit,
        //         )
        //         .setFilters([{ v: state.options.searchText }])
        //         .data,
        // });
        // const listHistory = async () => {
        //     state.loading = true;
        //     try {
        //         const res = await SpaceConnector.client.inventory.cloudService.getData(getParams());
        //
        //         state.items = res.results;
        //         state.totalCount = res.total_count;
        //     } catch (e) {
        //         ErrorHandler.handleError(e);
        //     } finally {
        //         state.loading = false;
        //     }
        // };

        /* Util */
        // const collectorLinkQueryHelper = new QueryHelper();
        // const getCollectorLink = (collectorId: string): Location => {
        //     collectorLinkQueryHelper.setFilters([{ k: 'collector_id', v: collectorId, o: '=' }]);
        //     return {
        //         name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
        //         query: {
        //             filters: collectorLinkQueryHelper.rawQueryStrings,
        //         },
        //     };
        // };
        //
        // const getJobLink = (jobId: string): Location => ({
        //     name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME,
        //     params: { jobId },
        // });

        /* Event */
        // const onChange = async (options = {}) => {
        //     state.options = { ...state.options, ...options };
        //     await listHistory();
        // };

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
                // onChange(),
            ]);
        })();

        return {
            ...toRefs(state),
            TIMELINE_CONTENT_LIMIT,
            iso8601Formatter,
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
    .vertical-timeline {
        .timeline-content-wrapper {
            padding-top: 0.25rem;
        }
    }
}
</style>
