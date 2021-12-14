<template>
    <general-page-layout class="collector-history-container">
        <div class="top-wrapper">
            <p-breadcrumbs :routes="route" class="flex-grow" />
            <!--            <handbook-button class="flex-shrink-0">-->
            <!--            </handbook-button>-->
        </div>
        <p-page-title :title="$t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE')" />
        <p-collector-history-chart @click-date="onClickDate" />
        <div class="collector-history-table">
            <div class="status-wrapper">
                <span class="label">{{ $t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.STATUS') }}:</span>
                <p-select-button-group :buttons="statusList" :selected.sync="selectedStatus" />
            </div>
            <p-toolbox-table search-type="query"
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
                             :row-cursor-pointer="rowCursorPointer"
                             sortable
                             :selectable="false"
                             :exportable="false"
                             :class="items.length === 0 ? 'no-data' : ''"
                             :style="{height: '100%', border: 'none'}"
                             @change="onChange"
                             @refresh="onChange"
                             @rowLeftClick="onSelect"
            >
                <template #th-task-format="{  field }">
                    <span>{{ field.label }}</span>
                    <span class="th-additional-info-text"> (completed / total)</span>
                </template>
                <template #col-collector_info.plugin_info-format="{ value }">
                    <template v-if="value">
                        <p-lazy-img :src="plugins[value.plugin_id] ? plugins[value.plugin_id].icon : ''"
                                    width="1rem" height="1rem" class="mr-2"
                        />
                        {{ plugins[value.plugin_id] ? plugins[value.plugin_id].label : value.plugin_id }}
                    </template>
                </template>
                <template #col-status-format="{ value }">
                    <p-status
                        :text="statusTextFormatter(value)"
                        :text-color="statusTextColorFormatter(value)"
                        :icon="statusIconFormatter(value)"
                        :icon-color="statusIconColorFormatter(value)"
                        :icon-animation="[JOB_STATUS.progress, JOB_STATUS.created].includes(value) ? 'spin' : undefined"
                    />
                </template>
                <template #col-remained_tasks-format="{value}">
                    <div class="col-remained_tasks-format">
                        <p-progress-bar
                            :percentage="value"
                            :color="PROGRESS_BAR_COLOR"
                        />
                        <span class="text">{{ value }}%</span>
                    </div>
                </template>
            </p-toolbox-table>
            <div v-if="items.length > 0" class="pagination">
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
                    @click="$router.push({ name: PLUGIN_ROUTE.COLLECTOR.CREATE._NAME })"
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
    PPageTitle, PPagination, PButtonModal, PLazyImg,
    PBreadcrumbs, PIconTextButton, PSelectButtonGroup, PProgressBar, PStatus, PToolboxTable,
} from '@spaceone/design-system';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import PCollectorHistoryChart from '@/services/management/collector-history/modules/CollectorHistoryChart.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { iso8601Formatter, durationFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { replaceUrlQuery } from '@/lib/router-query-string';
import {
    makeEnumValueHandler, makeDistinctValueHandler, makeReferenceValueHandler,
} from '@spaceone/console-core-lib/component-util/query-search';
import { getPageStart } from '@spaceone/console-core-lib/component-util/pagination';
import { store } from '@/store';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { MANAGEMENT_ROUTE } from '@/services/management/routes';
import { PLUGIN_ROUTE } from '@/services/plugin/routes';
import { peacock, green, red } from '@/styles/colors';
import { JOB_STATUS } from '@/services/management/collector-history/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';


const PROGRESS_BAR_COLOR = peacock[400];
const COMPLETED_ICON_COLOR = green[400];
const FAILED_ICON_COLOR = red[400];

const statusTextFormatter = (status) => {
    if (status === JOB_STATUS.success) return 'Completed';
    if (status === JOB_STATUS.progress || status === JOB_STATUS.created) return 'In-Progress';
    return capitalize(status);
};
const statusTextColorFormatter = (status) => {
    if ([JOB_STATUS.canceled, JOB_STATUS.error, JOB_STATUS.timeout].includes(status)) return FAILED_ICON_COLOR;
    return undefined;
};
const statusIconFormatter = (status) => {
    if (status === JOB_STATUS.success) return 'ic_state_active';
    if (status === JOB_STATUS.progress || status === JOB_STATUS.created) return 'ic_in-progress';
    return 'ic_alert';
};
const statusIconColorFormatter = (status) => {
    if (status === JOB_STATUS.success) return COMPLETED_ICON_COLOR;
    if (status === JOB_STATUS.progress || status === JOB_STATUS.created) return undefined;
    return FAILED_ICON_COLOR;
};

export default {
    name: 'CollectorHistoryPage',
    components: {
        // HandbookButton,
        PLazyImg,
        PIconTextButton,
        PButtonModal,
        PBreadcrumbs,
        PPagination,
        PToolboxTable,
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
                        label: 'Created Time',
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
                { label: 'Status', name: 'status', sortable: false },
                { label: 'Job Progress', name: 'remained_tasks' },
                { label: 'Created', name: 'created_at' },
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
                    remained_tasks: job.total_tasks > 0 ? numberFormatter(((job.total_tasks - job.remained_tasks) / job.total_tasks) * 100) : 0,
                    created_at: iso8601Formatter(job.created_at, state.timezone),
                    duration: durationFormatter(job.created_at, job.finished_at, state.timezone) || '--',
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const onSelect = (item) => {
            vm.$router.push({
                name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR.JOB._NAME,
                params: { jobId: item.job_id },
            }).catch(() => {});
        };
        const onChange = async (item: any = {}) => {
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
                ErrorHandler.handleError(e);
            }
        };
        const onPaginationChange = () => {
            vm.$nextTick(() => {
                state.pageStart = getPageStart(state.thisPage, state.pageSize);
                getJobs();
            });
        };
        const onClickDate = async (data) => {
            state.selectedStatus = data.type;
            state.tags = [
                {
                    key: { label: 'Created Time', name: 'created_at', dataType: 'datetime' },
                    value: { label: data.date, name: data.date },
                    operator: '=',
                },
            ];
            await onChange({ queryTags: state.tags });
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
            PLUGIN_ROUTE,
            JOB_STATUS,
            onSelect,
            onChange,
            onPaginationChange,
            onClickDate,
            statusTextFormatter,
            statusTextColorFormatter,
            statusIconFormatter,
            statusIconColorFormatter,
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
        @apply bg-white border border-gray-200 rounded-lg;
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

        .p-toolbox-table {
            &.no-data {
                .p-data-table {
                    min-height: 18.75rem;
                }
            }
            .p-data-table {
                .col-remained_tasks-format {
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
        .modal-button {
            .create-collector-button {
                padding: 0;
            }
        }
    }
}
</style>
