<script lang="ts" setup>
import { useInfiniteScroll } from '@vueuse/core';
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';

import { getThisPage } from '@cloudforet/core-lib/component-util/pagination';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PToolbox, PDataLoader, PBadge, PSpinner,
} from '@cloudforet/mirinae';
import type { QueryTag } from '@cloudforet/mirinae/types/controls/search/query-search-tags/type';
import type { KeyItem, ValueHandler, ValueMenuItem } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';

import { useAutocompleteApi } from '@/api-clients/add-ons/autocomplete/composables/use-autocomplete-api';
import { useChangeHistoryApi } from '@/api-clients/inventory/change-history/composables/use-change-history-api';
import type { ChangeHistoryListParameters } from '@/api-clients/inventory/change-history/schema/api-verbs/list';
import type { CloudServiceModel } from '@/api-clients/inventory/cloud-service/schema/model';
import type { NoteModel } from '@/api-clients/inventory/note/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedPaginationQuery } from '@/query/service-query/pagination/use-scoped-pagination-query';
import { SpaceRouter } from '@/router';

import { useUserStore } from '@/store/user/user-store';

import VerticalTimeline from '@/common/components/vertical-timeline/VerticalTimeline.vue';

import CloudServiceHistoryDateSelectDropdown from '@/services/asset-inventory/components/CloudServiceHistoryDateSelectDropdown.vue';
import CloudServiceHistoryDetailOverlay from '@/services/asset-inventory/components/CloudServiceHistoryDetailOverlay.vue';
import { useCloudServiceNoteListQuery } from '@/services/asset-inventory/composables/use-cloud-service-note-list-query';
import { HISTORY_ACTION_MAP } from '@/services/asset-inventory/constants/cloud-service-detail-constant';
import type {
    CloudServiceHistoryItem,

} from '@/services/asset-inventory/types/cloud-service-detail-page-type';

import type { NoteListParameters } from '@/api-clients/inventory/note/schema/note/api-verbs/list';


const { autocompleteAPI } = useAutocompleteApi();

const makeCustomValueHandler = (distinctKey: string, cloudServiceId: string): ValueHandler => async (inputText: string) => {
    try {
        const { results } = await autocompleteAPI.distinct({
            resource_type: 'inventory.ChangeHistory',
            options: { filter: [{ k: 'cloud_service_id', v: cloudServiceId, o: 'eq' }] },
            distinct_key: distinctKey,
            search: inputText,
        });

        const filteredResults = (results ?? []).filter((d) => d.key.includes(inputText));
        const filteredTotalCount = filteredResults.length;
        return {
            results: filteredResults.slice(0, 10).reduce((r, d) => {
                if (d.name !== '' && d.name !== undefined && d.name !== null) r.push({ label: d.name, name: d.key });
                return r;
            }, [] as ValueMenuItem[]),
            totalCount: filteredTotalCount,
        };
    } catch (e) {
        return {
            results: [],
            totalCount: 0,
        };
    }
};

const HISTORY_OVERLAY_HASH_NAME = 'history-detail';
const DIFF_ITEM_LIMIT = 10;
const TIMELINE_ITEM_LIMIT = 10;
dayjs.extend(localeData);

const props = defineProps<{
    cloudServiceItem: CloudServiceModel;
    provider: string;
}>();
const route = useRoute();
const userStore = useUserStore();
const state = reactive({
    timelineWrapperRef: null as null | HTMLElement,
    timezone: computed(() => userStore.state.timezone),
    selectedYear: dayjs.utc().format('YYYY'),
    selectedMonth: 'all',
    selectedHistoryItem: undefined as undefined | CloudServiceHistoryItem,
    selectedKeyName: undefined as undefined | string,
    showDetailOverlay: computed(() => route.hash === `#${HISTORY_OVERLAY_HASH_NAME}`),
    totalCount: 0,
    pageStart: 1,
    searchText: '',
    toolBoxQueryTags: undefined as undefined | QueryTag[],
});


const handlerState = reactive({
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'diff.key', label: 'Key' },
        ] as KeyItem[],
    }],
    valueHandlerMap: {
        'diff.key': makeCustomValueHandler('diff.key', props.cloudServiceItem.cloud_service_id),
    },
});


/* Api */
const apiQueryHelper = new ApiQueryHelper().setTimezone('UTC');
const searchQueryHelper = new QueryHelper().setKeyItemSets(handlerState.keyItemSets);

const { changeHistoryAPI } = useChangeHistoryApi();
const { key: changeHistoryListQueryKey, params: changeHistoryListQueryParams } = useServiceQueryKey('inventory', 'change-history', 'list', {
    params: computed<ChangeHistoryListParameters>(() => {
        apiQueryHelper.setPage(state.pageStart, TIMELINE_ITEM_LIMIT);
        let startDate: Dayjs;
        let endDate: Dayjs;
        if (state.selectedMonth !== 'all') {
            startDate = dayjs.utc(`${state.selectedYear}-${state.selectedMonth}`).startOf('month');
            endDate = startDate.add(1, 'month');
        } else {
            startDate = dayjs.utc(state.selectedYear).startOf('year');
            endDate = startDate.add(1, 'year');
        }
        if (state.toolBoxQueryTags) {
            searchQueryHelper.setFiltersAsQueryTag(state.toolBoxQueryTags);
        }
        apiQueryHelper.setFilters([
            { k: 'created_at', v: startDate.format('YYYY-MM-DD HH:mm:ss'), o: '>=t' },
            { k: 'created_at', v: endDate.format('YYYY-MM-DD HH:mm:ss'), o: '<t' },
            ...searchQueryHelper.filters,
        ]);
        return {
            cloud_service_id: props.cloudServiceItem.cloud_service_id,
            query: apiQueryHelper.data,
        };
    }),
    pagination: true,
});

const { data: changeHistoryListData, isLoading: isChangeHistoryListLoading, query } = useScopedPaginationQuery({
    queryKey: changeHistoryListQueryKey,
    params: changeHistoryListQueryParams,
    queryFn: changeHistoryAPI.list,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    enabled: computed(() => !!props.cloudServiceItem.cloud_service_id),
}, {
    thisPage: computed(() => getThisPage(state.pageStart, TIMELINE_ITEM_LIMIT)),
    pageSize: computed(() => TIMELINE_ITEM_LIMIT),
    verb: 'list',
}, ['DOMAIN', 'WORKSPACE']);
const recordIdList = computed(() => (changeHistoryListData.value?.results || []).map((item) => item.record_id));

const noteApiQueryHelper = new ApiQueryHelper();
const { data: noteListData, isLoading: noteListLoading, invalidate: invalidateNoteList } = useCloudServiceNoteListQuery({
    params: computed<NoteListParameters>(() => {
        noteApiQueryHelper.setFilters([{ k: 'record_id', v: recordIdList.value, o: '=' }]);
        return {
            query: noteApiQueryHelper.data,
        };
    }),
    enabled: computed(() => !!recordIdList.value?.length),
});

const loading = computed(() => isChangeHistoryListLoading.value || noteListLoading.value);
const changeHistoryState = reactive({
    items: computed<CloudServiceHistoryItem[]>(() => (changeHistoryListData.value?.results ?? []).map((data) => ({
        recordId: data.record_id,
        date: data.created_at,
        title: HISTORY_ACTION_MAP[data.action].label,
        action: data.action,
        diffItems: data.diff.map((d, i, array) => ({
        // If the key is duplicated, shows full path
            key: array.filter((d2) => getDiffItemsKey(d2.key) === getDiffItemsKey(d.key)).length >= 2
                ? d.key : getDiffItemsKey(d.key),
            path: d.key,
            previousValue: d.before,
            changedValue: d.after,
            type: d.type,
        })),
        diffCount: data.diff_count,
        noteItemMap: Object.values(noteState.noteItemMap[data.record_id] ?? {}),
    }))),
});
const noteState = reactive({
    noteList: computed<NoteModel[]>(() => noteListData.value?.results ?? []),
    noteItemMap: computed<{ [key: string]: NoteModel[] }>(() => {
        const noteList = noteListData.value?.results ?? [];
        const noteMap = {};
        noteList.forEach((note) => {
            const id = note.record_id;
            if (noteMap[id]) {
                noteMap[id].push(note);
            } else {
                noteMap[id] = [note];
            }
        });
        return noteMap;
    }),
});

/* Util */
const getDiffItemsKey = (fullKey: string) => fullKey.split('.')?.pop() ?? '';

const getTimelineColor = (action: string) => HISTORY_ACTION_MAP[action]?.color;
const getConvertedChangedValue = (value) => {
    if (value?.startsWith('[')) return '[ ... ]';
    if (value?.startsWith('{')) return '{ ... }';
    return value;
};
const delay = (time) => new Promise((resolve) => {
    setTimeout(resolve, time);
});
const loadMoreHistoryData = async () => {
    const newPageStart = state.pageStart + TIMELINE_ITEM_LIMIT;
    if (state.totalCount < newPageStart) return;

    state.pageStart = newPageStart;
    await delay(1000);
    // await listHistory();
};

/* Event */
const handleClickTimeline = (item: CloudServiceHistoryItem) => {
    state.selectedHistoryItem = item;
    SpaceRouter.router.push({ hash: HISTORY_OVERLAY_HASH_NAME });
};
const handleClickKey = (keyName: string) => {
    state.selectedKeyName = keyName;
};
const handleChange = async (options: ToolboxOptions = {}) => {
    setApiQueryWithToolboxOptions(apiQueryHelper, options);
    state.toolBoxQueryTags = options.queryTags;
};
const handleRefresh = () => {
    query.refetch();
};
const handleLoadMore = () => {
    loadMoreHistoryData();
};
const handleRefreshNoteCount = async () => {
    invalidateNoteList();
};

/* Watcher */
watch(() => props.cloudServiceItem, (after, before) => {
    if (after?.cloud_service_id !== before?.cloud_service_id) {
        state.searchText = '';
    }
}, { immediate: false });
watch(() => state.showDetailOverlay, (visible) => {
    if (!visible) state.selectedKeyName = '';
});

onMounted(() => {
    useInfiniteScroll(state.timelineWrapperRef, () => {
        loadMoreHistoryData();
    });
});

</script>

<template>
    <div class="cloud-service-history">
        <p-heading class="pt-8 px-4 pb-4"
                   heading-type="sub"
                   :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.HISTORY')"
                   :total-count="changeHistoryListData?.total_count || 0"
                   use-total-count
        />
        <p-toolbox search-type="query"
                   searchable
                   :pagination-visible="false"
                   :page-size-changeable="false"
                   :search-text.sync="state.searchText"
                   :key-item-sets="handlerState.keyItemSets"
                   :value-handler-map="handlerState.valueHandlerMap"
                   @change="handleChange"
                   @refresh="handleRefresh"
        >
            <template #left-area>
                <cloud-service-history-date-select-dropdown :selected-year.sync="state.selectedYear"
                                                            :selected-month.sync="state.selectedMonth"
                />
            </template>
        </p-toolbox>
        <p-data-loader :data="changeHistoryState.items"
                       :loading="loading"
        >
            <div ref="timelineWrapperRef"
                 class="timeline-wrapper"
            >
                <vertical-timeline v-for="(item, idx) in changeHistoryState.items"
                                   :key="`timeline-${item.date}-${idx}`"
                                   :date="item.date"
                                   :title="item.title"
                                   :count="item.diffCount"
                                   :color="getTimelineColor(item.action)"
                                   :is-last-item="idx === changeHistoryState.items.length - 1"
                                   @click-timeline="handleClickTimeline(item)"
                >
                    <template v-if="item.diffItems && item.diffItems.length"
                              #timeline-detail
                    >
                        <div class="timeline-content-wrapper">
                            <div v-for="(diffItem, kIdx) in item.diffItems.slice(0, DIFF_ITEM_LIMIT)"
                                 :key="`key-value-item-${diffItem.key}-${kIdx}`"
                                 class="key-value-item"
                                 @click="handleClickKey(diffItem.key)"
                            >
                                <div class="key-wrapper">
                                    {{ diffItem.key }}
                                </div>
                                <div v-if="item.action === 'UPDATE' && diffItem.changedValue"
                                     class="value-wrapper"
                                >
                                    {{ getConvertedChangedValue(diffItem.changedValue) }}
                                </div>
                            </div>
                            <span v-if="item.diffCount && item.diffCount > DIFF_ITEM_LIMIT"
                                  class="text-gray-500"
                            >{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.AND_MORE') }}</span>
                        </div>
                    </template>
                    <template #additional-title>
                        <div v-if="item.noteItemMap?.length">
                            <span class="additional-title">{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE') }}</span>
                            <p-badge badge-type="subtle"
                                     style-type="gray200"
                            >
                                {{ item.noteItemMap.length }}
                            </p-badge>
                        </div>
                    </template>
                </vertical-timeline>
                <p-spinner v-if="loading && !!changeHistoryState.items.length"
                           size="xl"
                />
            </div>
        </p-data-loader>
        <transition name="slide-up">
            <cloud-service-history-detail-overlay v-if="state.showDetailOverlay"
                                                  :loading="loading"
                                                  :history-items="changeHistoryState.items"
                                                  :selected-history-item.sync="state.selectedHistoryItem"
                                                  :selected-key-name="state.selectedKeyName"
                                                  :total-count="state.totalCount"
                                                  :provider="provider"
                                                  :cloud-service-item="cloudServiceItem"
                                                  @load-more="handleLoadMore"
                                                  @refresh-note-count="handleRefreshNoteCount"
            />
        </transition>
    </div>
</template>

<style lang="postcss" scoped>
.cloud-service-history {
    /* custom design-system component - p-toolbox */
    :deep(.p-toolbox) {
        padding: 1.5rem 1rem 0.5rem;
    }
    .timeline-wrapper {
        height: 30rem;
        overflow: auto;
        padding: 0 1.125rem;
        .p-spinner {
            display: flex;
            height: 5rem;
            justify-content: center;
            align-items: center;
        }
        .additional-title {
            padding-right: 0.25rem;
        }
    }
    .vertical-timeline {
        .timeline-content-wrapper {
            padding-top: 0.25rem;
            .key-value-item {
                display: inline-flex;
                align-items: center;
                max-width: 50%;
                margin-right: 0.625rem;
                margin-bottom: 0.625rem;
                &:hover {
                    .key-wrapper {
                        @apply bg-blue-200 text-blue-700;
                        text-decoration: underline;
                    }
                    .value-wrapper {
                        @apply bg-blue-200 text-blue-700;
                    }
                }
                .key-wrapper {
                    @apply bg-primary-4 border border-primary-3;
                    padding: 0.5rem 0.75rem;
                }
                .value-wrapper {
                    @apply bg-white border border-l-0 border-primary-3 truncate;
                    padding: 0.5rem 0.75rem;
                }
            }
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
