<template>
    <div class="cloud-service-history">
        <p-panel-top :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.HISTORY')"
                     :total-count="totalCount"
                     use-total-count
        />
        <p-toolbox search-type="query"
                   searchable
                   :pagination-visible="false"
                   :page-size-changeable="false"
                   :search-text.sync="searchText"
                   :key-item-sets="handlerState.keyItemSets"
                   :value-handler-map="handlerState.valueHandlerMap"
                   @change="handleChange"
                   @refresh="handleChange()"
        >
            <template #left-area>
                <cloud-service-history-date-select-dropdown :selected-year.sync="selectedYear"
                                                            :selected-month.sync="selectedMonth"
                />
            </template>
        </p-toolbox>
        <p-data-loader :data="items" :loading="!items.length && loading">
            <div ref="timelineWrapperRef" class="timeline-wrapper">
                <vertical-timeline v-for="(item, idx) in items"
                                   :key="`timeline-${item.date}-${idx}`"
                                   :date="item.date"
                                   :title="item.title"
                                   :count="item.diffCount"
                                   :color="getTimelineColor(item.action)"
                                   :is-last-item="idx === items.length-1"
                                   @click-timeline="handleClickTimeline(item)"
                >
                    <template v-if="item.diffItems && item.diffItems.length" #timeline-detail>
                        <div class="timeline-content-wrapper">
                            <div v-for="(diffItem, kIdx) in item.diffItems.slice(0, DIFF_ITEM_LIMIT)"
                                 :key="`key-value-item-${diffItem.key}-${kIdx}`"
                                 class="key-value-item"
                                 @click="handleClickKey(diffItem.key)"
                            >
                                <div class="key-wrapper">
                                    {{ diffItem.key }}
                                </div>
                                <div v-if="item.action === 'UPDATE' && diffItem.changedValue" class="value-wrapper">
                                    {{ getConvertedChangedValue(diffItem.changedValue) }}
                                </div>
                            </div>
                            <span v-if="item.diffCount > DIFF_ITEM_LIMIT" class="text-gray-500">{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.AND_MORE') }}</span>
                        </div>
                    </template>
                    <template #additional-title>
                        <div v-if="item.noteItemMap.length">
                            <span class="additional-title">{{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE') }}</span>
                            <p-badge style-type="gray200">
                                {{ item.noteItemMap.length }}
                            </p-badge>
                        </div>
                    </template>
                </vertical-timeline>
                <p-lottie v-if="loading && !!items.length" name="thin-spinner" auto
                          :size="2"
                />
            </div>
        </p-data-loader>
        <transition name="slide-up">
            <cloud-service-history-detail-overlay v-if="showDetailOverlay"
                                                  :loading="loading"
                                                  :history-items="items"
                                                  :selected-history-item.sync="selectedHistoryItem"
                                                  :selected-key-name="selectedKeyName"
                                                  :total-count="totalCount"
                                                  :provider="provider"
                                                  :cloud-service-id="cloudServiceId"
                                                  @load-more="handleLoadMore"
                                                  @refresh-note-count="handleRefreshNoteCount"
            />
        </transition>
    </div>
</template>

<script lang="ts">
import type { ComponentRenderProxy } from '@vue/composition-api';
import {
    computed, getCurrentInstance, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import type { KeyItem } from '@spaceone/console-core-lib/component-util/query-search/type';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import type { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PPanelTop, PToolbox, PDataLoader, PLottie, PBadge,
} from '@spaceone/design-system';
import { useInfiniteScroll } from '@vueuse/core';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import VerticalTimeline from '@/common/components/vertical-timeline/VerticalTimeline.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { makeCustomValueHandler } from '@/services/asset-inventory/cloud-service/cloud-service-detail/lib/helper';
import CloudServiceHistoryDetailOverlay
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-history-detail/CloudServiceHistoryDetailOverlay.vue';
import CloudServiceHistoryDateSelectDropdown
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceHistoryDateSelectDropdown.vue';
import type {
    CloudServiceHistoryItem,
    NoteModel,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';
import { HISTORY_ACTION_MAP } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';


const HISTORY_OVERLAY_HASH_NAME = 'history-detail';
const DIFF_ITEM_LIMIT = 10;
dayjs.extend(localeData);


export default {
    name: 'CloudServiceHistory',
    components: {
        CloudServiceHistoryDateSelectDropdown,
        CloudServiceHistoryDetailOverlay,
        VerticalTimeline,
        PPanelTop,
        PToolbox,
        PDataLoader,
        PLottie,
        PBadge,
    },
    props: {
        cloudServiceId: {
            type: String,
            default: '',
        },
        provider: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            timelineWrapperRef: null as null | HTMLElement,
            timezone: computed(() => store.state.user.timezone),
            selectedYear: dayjs.utc().format('YYYY'),
            selectedMonth: 'all',
            items: [] as CloudServiceHistoryItem[],
            noteItemMap: {} as { [key: string]: NoteModel[] },
            selectedHistoryItem: undefined as undefined | CloudServiceHistoryItem,
            selectedKeyName: undefined as undefined | string,
            showDetailOverlay: computed(() => vm.$route.hash === `#${HISTORY_OVERLAY_HASH_NAME}`),
            totalCount: 0,
            pageStart: 1,
            searchText: '',
        });
        const handlerState = reactive({
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'diff.key', label: 'Key' },
                ] as KeyItem[],
            }],
            valueHandlerMap: {
                'diff.key': makeCustomValueHandler('diff.key', props.cloudServiceId),
            },
        });
        const searchQueryHelper = new QueryHelper().setKeyItemSets(handlerState.keyItemSets);

        /* Util */
        const groupNoteByHistoryRecordId = (noteList) => {
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
        };

        const getConvertedHistoryData = (rawData: any[]): CloudServiceHistoryItem[] => rawData.map(data => ({
            recordId: data.record_id,
            date: data.created_at,
            title: HISTORY_ACTION_MAP[data.action].label,
            action: data.action,
            diffItems: data.diff.map(d => ({
                key: d.key.split('.').pop(),
                path: d.key,
                previousValue: d.before,
                changedValue: d.after,
                type: d.type,
            })),
            diffCount: data.diff_count,
            noteItemMap: Object.values(state.noteItemMap[data.record_id] ?? {}),
        }));
        const getTimelineColor = (action: string) => HISTORY_ACTION_MAP[action].color;
        const getConvertedChangedValue = (value) => {
            if (value?.startsWith('[')) return '[ ... ]';
            if (value?.startsWith('{')) return '{ ... }';
            return value;
        };
        const delay = time => new Promise(resolve => setTimeout(resolve, time));
        const loadMoreHistoryData = async () => {
            const newPageStart = state.pageStart + DIFF_ITEM_LIMIT;
            if (state.totalCount < newPageStart) return;

            state.pageStart = newPageStart;
            state.loading = true;
            await delay(1000);
            await listHistory();
        };

        /* Api */
        const noteApiQueryHelper = new ApiQueryHelper();
        const getNoteData = async (recordIdList) => {
            try {
                noteApiQueryHelper.setFilters([{ k: 'record_id', v: recordIdList, o: '=' }]);
                const { results } = await SpaceConnector.client.inventory.note.list({
                    query: noteApiQueryHelper.data,
                });
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };
        const apiQueryHelper = new ApiQueryHelper().setTimezone('UTC');
        const listHistory = async (refresh = false) => {
            if (refresh) {
                state.items = [];
                state.pageStart = 1;
            }
            try {
                state.loading = true;
                apiQueryHelper.setPage(state.pageStart, DIFF_ITEM_LIMIT);
                let startDate: Dayjs;
                let endDate: Dayjs;
                if (state.selectedMonth !== 'all') {
                    startDate = dayjs.utc(`${state.selectedYear}-${state.selectedMonth}`).startOf('month');
                    endDate = startDate.add(1, 'month');
                } else {
                    startDate = dayjs.utc(state.selectedYear).startOf('year');
                    endDate = startDate.add(1, 'year');
                }
                apiQueryHelper.setFilters([
                    { k: 'created_at', v: startDate.format('YYYY-MM-DD HH:mm:ss'), o: '>=t' },
                    { k: 'created_at', v: endDate.format('YYYY-MM-DD HH:mm:ss'), o: '<t' },
                    ...searchQueryHelper.filters,
                ]);
                const { results, total_count } = await SpaceConnector.client.inventory.changeHistory.list({
                    cloud_service_id: props.cloudServiceId,
                    query: {
                        ...apiQueryHelper.data,
                    },
                });
                const noteList = await getNoteData(results.map(history => history.record_id));
                state.noteItemMap = groupNoteByHistoryRecordId(noteList);
                const convertedData = getConvertedHistoryData(results);
                state.items = state.items.concat(convertedData);
                state.totalCount = total_count;
            } catch (e) {
                state.items = [];
                state.totalCount = 0;
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
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
            if (options.queryTags) {
                searchQueryHelper.setFiltersAsQueryTag(options.queryTags);
            }
            await listHistory(true);
        };
        const handleLoadMore = () => {
            loadMoreHistoryData();
        };
        const handleRefreshNoteCount = async () => {
            await listHistory(true);
        };

        /* Init */
        (async () => {
            await listHistory();
        })();

        /* Watcher */
        watch(() => props.cloudServiceId, (after, before) => {
            if (after !== before) {
                state.searchText = '';
                listHistory(true);
            }
        }, { immediate: false });
        watch([() => state.selectedMonth, () => state.selectedYear], () => {
            listHistory(true);
        }, { immediate: false });
        watch(() => state.showDetailOverlay, (visible) => {
            if (!visible) state.selectedKeyName = '';
        });

        onMounted(() => {
            useInfiniteScroll(state.timelineWrapperRef, () => {
                loadMoreHistoryData();
            });
        });

        return {
            ...toRefs(state),
            handlerState,
            DIFF_ITEM_LIMIT,
            getTimelineColor,
            getConvertedChangedValue,
            handleClickTimeline,
            handleChange,
            handleLoadMore,
            handleClickKey,
            handleRefreshNoteCount,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cloud-service-history {
    .p-toolbox::v-deep {
        padding: 1.5rem 1rem 0.5rem;
        .month-select-dropdown {
            .dropdown-button {
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
            }
        }
        .year-select-dropdown {
            .dropdown-button {
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                border-left: 0;
            }
        }
    }
    .timeline-wrapper {
        height: 30rem;
        overflow: auto;
        padding: 0 1.125rem;
        .p-lottie {
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
