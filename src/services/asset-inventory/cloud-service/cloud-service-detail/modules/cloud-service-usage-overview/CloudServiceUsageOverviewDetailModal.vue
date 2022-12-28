<template>
    <p-button-modal :visible="proxyVisible"
                    :header-title="header"
                    hide-footer-close-button
                    size="lg"
                    class="cloud-service-usage-overview-detail-modal"
                    @update:visible="handleUpdateVisible"
                    @confirm="handleUpdateVisible(false)"
    >
        <template #body>
            <div class="flex items-center">
                <span class="text-sm text-gray-900 font-bold mb-3 mr-2">Filter: </span>
                <span class="text-sm text-gray-500 mb-3">{{ period ? '' : 'Auto (Overall period)' }}</span>
                <cloud-service-period-filter class="period-filter"
                                             read-only
                                             :period="period"
                />
                <p-divider v-if="queryTags.length"
                           vertical
                           class="!h-4 !ml-4 !mr-4 mb-3"
                />
                <p-query-search-tags :tags="queryTags"
                                     read-only
                />
            </div>
            <div class="modal-inner">
                <cloud-service-usage-overview-summary v-if="summaryDataList.length"
                                                      :data-loading="dataLoading"
                                                      :data-list="summaryDataList"
                                                      :widget-schema-list="summaryWidgetSchemaList"
                                                      :cloud-service-type-id="cloudServiceTypeId"
                />
                <div class="chart-widget-wrapper">
                    <template v-for="(schema, idx) in chartWidgetSchemaList">
                        <p-dynamic-widget :key="`${cloudServiceTypeId}-${idx}`"
                                          :index="idx"
                                          :type="schema.type"
                                          :name="schema.name"
                                          :data="chartDataList[idx]"
                                          :loading="dataLoading"
                                          :schema-options="schema.options"
                                          :field-handler="fieldHandler"
                        />
                    </template>
                </div>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.CLOSE') }}
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import {
    computed, defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import {
    PButtonModal, PDynamicWidget, PQuerySearchTags, PDivider,
} from '@spaceone/design-system';
import type {
    DynamicWidgetFieldHandler,
    DynamicWidgetSchema,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-widget/type';
import type { QueryTag } from '@spaceone/design-system/types/inputs/search/query-search-tags/type';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CloudServiceUsageOverviewSummary
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewSummary.vue';
import type { CloudServiceTypeInfo } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';
import CloudServicePeriodFilter from '@/services/asset-inventory/cloud-service/modules/CloudServicePeriodFilter.vue';
import type { Period } from '@/services/cost-explorer/type';

interface Data {
    name?: string;
    value?: number;
}

interface Props {
    visible: boolean;
    schemaList: DynamicWidgetSchema[];
    summaryDataList: Data[][];
    cloudServiceTypeInfo: CloudServiceTypeInfo;
    filters: ConsoleFilter[];
    period?: Period;
}

export default defineComponent<Props>({
    name: 'CloudServiceUsageOverviewDetailModal',
    components: {
        CloudServiceUsageOverviewSummary,
        CloudServicePeriodFilter,
        PButtonModal: PButtonModal as any,
        PDynamicWidget,
        PQuerySearchTags,
        PDivider,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        schemaList: {
            type: Array,
            default: () => [],
        },
        summaryDataList: {
            type: Array,
            default: () => [],
        },
        cloudServiceTypeInfo: {
            type: Object as () => CloudServiceTypeInfo,
            default: () => ({}),
        },
        filters: {
            type: Array as () => ConsoleFilter[],
            default: () => [],
        },
        period: {
            type: Object as () => Period|undefined,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const queryHelper = new QueryHelper();
        const state = reactive({
            proxyVisible: props.visible,
            header: computed(() => i18n.t('INVENTORY.CLOUD_SERVICE.MAIN.USAGE_OVERVIEW_OF_RESOURCE', { resource: props.cloudServiceTypeInfo?.name })),
            widgetSchemaList: [] as DynamicWidgetSchema[],
            summaryWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => props.schemaList.filter(({ type }) => ['summary', 'card'].includes(type))),
            chartWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => props.schemaList.filter(({ type }) => type === 'chart')),
            chartDataList: [] as Data[][],
            dataLoading: true,
            cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeInfo?.cloud_service_type_id ?? ''),
            queryTags: [] as QueryTag[],
            apiQuery: { filter: [] as ApiFilter[], keyword: '' },
            dateRange: computed<Period|undefined>(() => {
                if (isEmpty(props.period)) return undefined;
                const period = props.period as Period;
                const dateRange: Period = {};
                if (period.start) dateRange.start = dayjs.utc(period.start).format('YYYY-MM-DD');
                if (period.end) dateRange.end = dayjs.utc(period.end).format('YYYY-MM-DD');
                return dateRange;
            }),
        });

        const fetchDataWithSchema = async (schema: DynamicWidgetSchema): Promise<Data[]> => {
            try {
                const { results } = await SpaceConnector.client.inventory.cloudService.analyze({
                    ...state.apiQuery,
                    default_query: schema.query,
                    date_range: state.dateRange,
                });
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const getDataListWithSchema = async () => {
            const results: any[] = await Promise.allSettled(state.chartWidgetSchemaList.map((schema) => fetchDataWithSchema(schema)));

            state.chartDataList = results.map((d) => {
                if (d.status === 'fulfilled') return d.value;
                return [];
            });
        };

        const setFilters = (filters: ConsoleFilter[]) => {
            const { filter, keyword } = queryHelper.setFilters(filters).apiQuery;

            state.apiQuery.filter = filter;
            state.apiQuery.keyword = keyword;
            state.queryTags = queryHelper.queryTags;
        };

        /* Component Props */
        const fieldHandler: DynamicWidgetFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        /* Event Handlers */
        const handleUpdateVisible = (visible) => {
            state.proxyVisible = visible;
            emit('update:visible', visible);
        };

        /* Watchers */
        watch([() => state.proxyVisible, () => props.schemaList, () => props.filters], async ([visible, schemaList, filters], [, prevSchemaList, prevFilters]) => {
            if (!visible) {
                // If the schema is the same, do not flush the data.
                // We can reuse the data if the filters are the same.
                if (schemaList !== prevSchemaList) state.chartDataList = [];

                // Show users loading UI at the first time.
                state.dataLoading = true;
                return;
            }

            // Do not get data if filters are the same with the previous one.
            if (filters === prevFilters) return;

            // set filters and get data
            if (!state.dataLoading) state.dataLoading = true;
            setFilters(filters);
            await getDataListWithSchema();
            state.dataLoading = false;
        }, { immediate: true });

        let initiated = false;
        watch(() => props.visible, async (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
            if (!initiated) {
                await store.dispatch('reference/loadAll');
                initiated = true;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleUpdateVisible,
            fieldHandler,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-usage-overview-detail-modal {
    .modal-inner {
        @apply bg-gray-100;
        display: flex;
        flex-direction: column;
        padding: 1rem 1.25rem;
    }
    .chart-widget-wrapper {
        @apply overflow-visible;
        padding: 1.5rem 0 0.5rem;
        flex: 1;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-gap: 0.5rem;
    }
    .period-filter {
        margin-bottom: 0.75rem;
    }

    /* custom design-system component - p-dynamic-widget */
    :deep(.p-dynamic-widget) {
        .amcharts-Polyspline {
            @apply hidden;
        }

        /* custom design-system component - p-dynamic-widget-chart */
        &.p-dynamic-widget-chart {
            @apply overflow-visible h-auto;
            min-height: 17.5rem;
        }

        /* custom design-system component - p-dynamic-chart */

        /* custom design-system component - p-dynamic-chart-column */
        &.p-dynamic-chart-column {
            .label-wrapper {
                @apply items-center;
                > .name {
                    @apply truncate mr-4;
                }
                > .value {
                    @apply flex-shrink-0;
                }
            }
        }
    }
}

@screen laptop {
    .cloud-service-usage-overview-detail-modal {
        .chart-widget-wrapper {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
}

@screen tablet {
    .cloud-service-usage-overview-detail-modal {
        .modal-inner {
            min-height: 70vh;
        }
        .chart-widget-wrapper {
            grid-template-columns: 1fr;
        }
    }
}

@screen mobile {
    .cloud-service-usage-overview-detail-modal {
        .modal-inner {
            padding: 0;
        }
    }
}

</style>
