<template>
    <div class="cloud-service-history">
        <p-panel-top :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.HISTORY')"
                     :total-count="totalCount"
                     use-total-count
        />
        <p-toolbox search-type="plain"
                   searchable
                   :pagination-visible="false"
                   :page-size-changeable="false"
                   @refresh="handleRefresh"
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
                               :date="item.date"
                               :title="item.title"
                               :count="item.diffCount"
                               :color="getTimelineColor(item.action)"
                               :timezone="timezone"
                               :is-last-item="idx === items.length-1"
                               @click-timeline="handleClickTimeline(item)"
            >
                <template v-if="item.diffItems && item.diffItems.length" #timeline-detail>
                    <div class="timeline-content-wrapper">
                        <div v-for="(diffItem, kIdx) in item.diffItems"
                             :key="`key-value-item-${diffItem.key}-${kIdx}`"
                             class="key-value-item"
                        >
                            <div class="key-wrapper">
                                {{ diffItem.key }}
                            </div>
                            <div v-if="diffItem.changedValue" class="value-wrapper">
                                {{ diffItem.changedValue }}
                            </div>
                        </div>
                        <!--                    song-lang-->
                        <span v-if="item.diffCount > DIFF_ITEM_LIMIT" class="text-gray-500">and more...</span>
                    </div>
                </template>
            </vertical-timeline>
        </div>
        <transition name="slide-up">
            <cloud-service-history-detail-overlay v-if="showDetailOverlay"
                                                  :history-items="items"
                                                  :selected-history-item="selectedHistoryItem"
                                                  :total-count="totalCount"
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
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PPanelTop, PToolbox, PDatetimePicker,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { store } from '@/store';

import VerticalTimeline from '@/common/components/vertical-timeline/VerticalTimeline.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import CloudServiceHistoryDetailOverlay
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-history-detail/CloudServiceHistoryDetailOverlay.vue';
import {
    CloudServiceHistoryItem, HISTORY_ACTION_MAP,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';


const DIFF_ITEM_LIMIT = 10;

export default {
    name: 'CloudServiceHistory',
    components: {
        CloudServiceHistoryDetailOverlay,
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
    setup(props) {
        const state = reactive({
            loading: true,
            timezone: computed(() => store.state.user.timezone),
            selectedDates: [] as string[],
            items: [] as CloudServiceHistoryItem[],
            selectedHistoryItem: undefined as undefined | CloudServiceHistoryItem,
            showDetailOverlay: false,
            totalCount: 0,
            pageStart: 1,
            pageLimit: 10,
        });

        /* Util */
        const getConvertedHistoryData = (rawData: any[]): CloudServiceHistoryItem[] => rawData.map(data => ({
            recordId: data.record_id,
            date: data.created_at,
            title: HISTORY_ACTION_MAP[data.action].label,
            action: data.action,
            diffItems: data.diff.slice(0, DIFF_ITEM_LIMIT).map(d => ({
                key: d.key.split('.').pop(),
                previousValue: d.before,
                changedValue: d.after,
                type: d.type,
            })),
            diffCount: data.diff_count,
        }));
        const getTimelineColor = (action: string) => HISTORY_ACTION_MAP[action].color;

        /* Api */
        const apiHelper = new ApiQueryHelper().setPage(state.pageStart, state.pageLimit);
        const listHistory = async () => {
            try {
                state.loading = true;
                const { results, total_count } = await SpaceConnector.client.inventory.changeHistory.list({
                    cloud_service_id: props.cloudServiceId,
                    query: apiHelper.data,
                });
                state.items = getConvertedHistoryData(results);
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
            state.showDetailOverlay = true;
        };
        const handleCloseOverlay = () => {
            state.showDetailOverlay = false;
        };
        const handleRefresh = () => {
            listHistory();
        };

        /* Init */
        (async () => {
            await listHistory();
        })();

        /* Watcher */
        watch(() => props.cloudServiceId, (after, before) => {
            if (after !== before) listHistory();
        }, { immediate: false });
        watch(() => state.timezone, (timezone) => {
            if (timezone) {
                state.selectedDates = [dayjs.utc().tz(timezone).format()];
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            iso8601Formatter,
            DIFF_ITEM_LIMIT,
            getTimelineColor,
            handleClickTimeline,
            handleCloseOverlay,
            handleRefresh,
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
            .key-value-item {
                display: inline-flex;
                align-items: center;
                max-width: 50%;
                margin-right: 0.625rem;
                margin-bottom: 0.625rem;
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
