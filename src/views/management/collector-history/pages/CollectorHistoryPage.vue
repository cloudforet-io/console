<template>
    <general-page-layout class="collector-history-container">
        <div class="top-wrapper">
            <p-breadcrumbs :routes="route" class="flex-grow" />
            <!--            <handbook-button class="flex-shrink-0">-->p
            <!--            </handbook-button>-->
        </div>
        <p-page-title :title="$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE')" />
        <p-collector-history-chart @click-date="onClickDate" />
        <div class="collector-history-table">
            <div class="status-wrapper">
                <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.STATUS') }}:</span>
                <p-select-button-group :buttons="statusList" :selected.sync="selectedStatus" />
            </div>
            <p-query-search-table
                ref="querySearchRef"
                :class="items.length === 0 ? 'no-data' : ''"
                :fields="fields"
                :items="items"
                :query-tags="tags"
                :key-item-sets="handlers.keyItemSets"
                :value-handler-map="handlers.valueHandlerMap"
                :loading="loading"
                :total-count="totalCount"
                :sort-by.sync="sortBy"
                :sort-desc.sync="sortDesc"
                :this-page.sync="thisPage"
                :page-size.sync="pageSize"
                :style="{height: '100%', border: 'none'}"
                :selectable="false"
                :row-cursor-pointer="rowCursorPointer"
                :excel-visible="false"
                @change="onChange"
                @rowLeftClick="onSelect"
            >
                <template #th-task-format="{  field }">
                    <span>{{ field.label }}</span>
                    <span class="th-additional-info-text"> (completed / total)</span>
                </template>
                <template #col-collector_info.plugin_info-format="{ value }">
                    <template v-if="value">
                        <p-lazy-img :src="plugins[value.plugin_id].icon"
                                    width="1rem" height="1rem"
                        />
                        <span class="pl-2">{{ plugins[value.plugin_id].name }}</span>
                    </template>
                </template>
                <template #col-status-format="{ value }">
                    <p-status
                        :icon="value === JOB_STATUS.success ? 'ic_state_active' : undefined"
                        :lottie="statusLottieFormatter(value)"
                        :text="statusFormatter(value)"
                        :icon-color="COMPLETED_ICON_COLOR"
                        :theme="[JOB_STATUS.canceled, JOB_STATUS.error, JOB_STATUS.timeout].includes(value) ? 'red' : undefined"
                    />
                </template>
                <template #col-job_progress-format="{value}">
                    <div class="col-job_progress-format">
                        <p-progress-bar
                            :percentage="value"
                            :color="PROGRESS_BAR_COLOR"
                        />
                        <span class="text">{{ value }}%</span>
                    </div>
                </template>
            </p-query-search-table>
            <div v-if="!loading && items.length > 0" class="pagination">
                <p-pagination :total-count="totalCount"
                              :this-page.sync="thisPage"
                              :page-size.sync="pageSize"
                              @change="onPaginationChange"
                />
            </div>
        </div>
        <!-- no item -->
        <p-button-modal
            class="button-modal"
            :header-title="$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_TITLE')"
            :scrollable="false"
            size="md"
            :fade="true"
            :backdrop="true"
            :visible.sync="modalVisible"
        >
            <template #body>
                <p class="modal-content">
                    <b>{{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_DESC_1') }}</b><br>
                    {{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_DESC_2') }}
                </p>
            </template>
            <template #confirm-button>
                <p-icon-text-button
                    class="create-collector-button"
                    name="ic_plus_bold"
                    @click="$router.push({ name: 'createCollector' })"
                >
                    {{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.MODAL_CREATE_COLLECTOR') }}
                </p-icon-text-button>
            </template>
        </p-button-modal>
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { capitalize } from 'lodash';

import {
    computed, getCurrentInstance, reactive, toRefs, ComponentRenderProxy, watch,
} from '@vue/composition-api';

import {
    PPageTitle, PQuerySearchTable, PPagination, PButtonModal, PLazyImg,
    PBreadcrumbs, PIconTextButton, PSelectButtonGroup, PProgressBar, PStatus,
} from '@spaceone/design-system';
import { QuerySearchTableFunctions } from '@spaceone/design-system/dist/src/data-display/tables/query-search-table/type';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';

import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import PCollectorHistoryChart from '@/views/management/collector-history/modules/CollectorHistoryChart.vue';

import { referenceRouter } from '@/lib/reference/referenceRouter';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { iso8601Formatter, durationFormatter } from '@/lib/util';
import { replaceUrlQuery } from '@/lib/router-query-string';
import {
    makeEnumValueHandler, makeDistinctValueHandler, makeReferenceValueHandler,
} from '@/lib/component-utils/query-search';
import { getPageStart } from '@/lib/component-utils/pagination';
import { store } from '@/store';
import { QueryHelper } from '@/lib/query';
import { MANAGEMENT_ROUTE } from '@/routes/management/management-route';
import { peacock, green } from '@/styles/colors';
import { JOB_STATUS } from '@/views/management/collector-history/pages/config';
import HandbookButton from '@/common/components/HandbookButton.vue';


const PROGRESS_BAR_COLOR = peacock[400];
const COMPLETED_ICON_COLOR = green[400];

const statusLottieFormatter = (status) => {
    if (status === JOB_STATUS.success || status === JOB_STATUS.created) return undefined;
    if (status === JOB_STATUS.progress) return 'lottie_in_progress';
    return 'lottie_error';
};
const statusFormatter = (status) => {
    if (status === JOB_STATUS.progress) return 'In-Progress';
    if (status === JOB_STATUS.success) return 'Completed';
    return capitalize(status);
};

export default {
    name: 'CollectorHistoryPage',
    components: {
        HandbookButton,
        PLazyImg,
        PIconTextButton,
        PButtonModal,
        PBreadcrumbs,
        PPagination,
        PQuerySearchTable,
        PPageTitle,
        PSelectButtonGroup,
        PProgressBar,
        PStatus,
        PCollectorHistoryChart,
        GeneralPageLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const handlers = {
            keyItemSets: [{
                title: 'Properties',
                items: [
                    {
                        name: 'job_id',
                        label: 'Job ID',
                    },
                    {
                        name: 'status',
                        label: 'Status',
                    },
                    {
                        name: 'collector_id',
                        label: 'Collector',
                    },
                    {
                        dataType: 'datetime',
                        name: 'created_at',
                        label: 'Start Time',
                    },
                ],
            }] as KeyItemSet[],
            valueHandlerMap: {
                job_id: makeDistinctValueHandler('inventory.Job', 'job_id'),
                status: makeEnumValueHandler(JOB_STATUS),
                collector_id: makeReferenceValueHandler('inventory.Collector'),
            },
        };
        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            loading: true,
            plugins: computed(() => store.state.resource.plugin.items),
            isDomainOwner: computed(() => store.state.user.userType === 'DOMAIN_OWNER'),
            fields: computed(() => [
                { label: 'Job ID', name: 'job_id' },
                { label: 'Collector', name: 'collector_info.name', sortable: false },
                { label: 'Plugin', name: 'collector_info.plugin_info', sortable: false },
                { label: 'Status', name: 'status' },
                { label: 'Job Progress', name: 'job_progress' },
                { label: 'Created Time', name: 'created_at' },
                { label: 'Duration', name: 'duration', sortable: false },
            ]),
            statusList: computed(() => ([
                {
                    name: 'all', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.ALL'),
                },
                {
                    name: 'inProgress', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.IN_PROGRESS'),
                },
                {
                    name: 'completed', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.COMPLETED'),
                },
                {
                    name: 'failed', label: vm.$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.FAILED'),
                },
            ])),
            selectedStatus: 'all',
            items: [] as any[],
            //
            pageStart: 1,
            pageSize: 15,
            thisPage: 1,
            sortBy: 'created_at',
            sortDesc: true,
            totalCount: 0,
            rowCursorPointer: true,
            //
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
            querySearchRef: null as null|QuerySearchTableFunctions,
            modalVisible: false,
        });
        const routeState = reactive({
            route: computed(() => ([
                { name: vm.$t('MENU.MANAGEMENT.MANAGEMENT'), path: '/management/collector-history' },
                { name: vm.$t('MENU.MANAGEMENT.COLLECTOR_HISTORY') },
            ])),
        });

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(state.pageStart, state.pageSize)
                .setFilters(queryHelper.filters);

            let statusValues: JOB_STATUS[] = [];
            if (state.selectedStatus === 'inProgress') {
                statusValues = [JOB_STATUS.progress];
            } else if (state.selectedStatus === 'completed') {
                statusValues = [JOB_STATUS.created, JOB_STATUS.success];
            } else if (state.selectedStatus === 'failed') {
                statusValues = [JOB_STATUS.canceled, JOB_STATUS.error, JOB_STATUS.timeout];
            }

            if (statusValues.length > 0) {
                apiQuery.addFilter({ k: 'status', v: statusValues, o: '=' });
            }

            return apiQuery.data;
        };
        const getJobs = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.job.list({ query: getQuery() });
                state.totalCount = res.total_count;
                state.items = res.results.map(job => ({
                    ...job,
                    job_progress: ((job.total_tasks - job.remained_tasks) / job.total_tasks) * 100,
                    created_at: iso8601Formatter(job.created_at, state.timezone),
                    duration: durationFormatter(job.created_at, job.finished_at, state.timezone),
                }));
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const onSelect = (item) => {
            vm.$router.push({
                name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR.JOB,
                params: { jobId: item.job_id },
            }).catch(() => {});
        };
        const onChange = async (item) => {
            if (item.sortBy !== undefined) {
                state.sortBy = item.sortBy;
                state.sortDesc = item.sortDesc;
            }
            if (item.pageStart !== undefined) state.pageStart = item.pageStart;
            if (item.pageLimit !== undefined) state.pageSize = item.pageLimit;
            if (item.queryTags !== undefined) {
                state.tags = item.queryTags;
                queryHelper.setFiltersAsQueryTag(item.queryTags);
                await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
            }
            try {
                await getJobs();
            } catch (e) {
                console.error(e);
            }
        };
        const onPaginationChange = () => {
            vm.$nextTick(() => {
                state.pageStart = getPageStart(state.thisPage, state.pageSize);
                getJobs();
            });
        };
        const onClickDate = (date) => {
            // eslint-disable-next-line no-unused-expressions
            state.querySearchRef?.addTag(
                {
                    key: { label: 'Created Time', name: 'created_at', dataType: 'datetime' },
                    value: { label: date, name: date },
                    operator: '=',
                },
            );
        };

        const init = async () => {
            await store.dispatch('resource/plugin/load');

            await getJobs();
            if (state.totalCount === 0) state.modalVisible = true;
        };
        init();

        watch(() => state.selectedStatus, (selectedStatus) => {
            state.selectedStatus = selectedStatus;
            state.thisPage = 1;
            state.pageStart = 1;
            getJobs();
        });

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            handlers,
            PROGRESS_BAR_COLOR,
            COMPLETED_ICON_COLOR,
            JOB_STATUS,
            onSelect,
            onChange,
            onPaginationChange,
            onClickDate,
            statusFormatter,
            statusLottieFormatter,
            referenceRouter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.collector-history-container {
    .top-wrapper {
        display: flex;
        justify-content: space-between;
    }
    .collector-history-table {
        @apply bg-white border border-gray-200;
        border-radius: 0.375rem;
        margin-top: 1rem;

        .status-wrapper {
            display: flex;
            align-items: center;
            margin-left: 1rem;
            margin-top: 1.5rem;

            .label {
                font-size: 0.875rem;
                font-weight: bold;
                line-height: 1.5;
                padding-right: 1rem;
            }
        }

        .p-query-search-table {
            &.no-data {
                .p-data-table {
                    min-height: 18.75rem;
                }
            }
            .p-data-table {
                .col-job_progress-format {
                    display: flex;
                    align-items: center;
                    .progress-bar {
                        width: 6.25rem;
                        margin-right: 0.125rem;
                    }
                    .text {
                        @apply text-gray-700;
                    }
                }
            }
        }

        .pagination {
            text-align: center;
            padding-top: 1.5rem;
            bottom: 0;
            margin-bottom: 1.5rem;
        }
    }

    .button-modal {
        .modal-content {
            line-height: 1.5rem;
        }
        .modal-btn {
            .create-collector-button {
                padding: 0;
            }
        }
    }
}
</style>
