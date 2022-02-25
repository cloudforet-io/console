<template>
    <p-button-modal :visible="proxyVisible"
                    :header-title="header"
                    :scrollable="false"
                    hide-footer-close-button
                    size="lg"
                    class="cloud-service-usage-overview-detail-modal"
                    @update:visible="handleUpdateVisible"
                    @confirm="handleUpdateVisible(false)"
    >
        <template #body>
            <cloud-service-period-filter read-only :period="period" />
            <p-query-search-tags :tags="queryTags" read-only class="pt-4 border-t border-gray-200" />
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
        </template>
        <template #confirm-button>
            Close
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import {
    PButtonModal, PDivider, PDynamicWidget, PQuerySearchTags,
} from '@spaceone/design-system';
import {
    DynamicWidgetFieldHandler,
    DynamicWidgetSchema,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-widget/type';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';

import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { Filter } from '@spaceone/console-core-lib/space-connector/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import { CloudServiceTypeInfo } from '@/services/inventory/cloud-service/cloud-service-detail/type';
import { Period } from '@/services/billing/cost-management/type';
import CloudServicePeriodFilter from '@/services/inventory/cloud-service/modules/CloudServicePeriodFilter.vue';
import CloudServiceUsageOverviewSummary
    from '@/services/inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewSummary.vue';


interface Props {
    visible: boolean;
    schemaList: DynamicWidgetSchema[];
    summaryDataList: Data[][];
    cloudServiceTypeInfo: CloudServiceTypeInfo;
    isServer: boolean;
    filters: QueryStoreFilter[];
    period?: Period;
}

interface Data {
    name?: string;
    value?: number;
}

export default defineComponent<Props>({
    name: 'CloudServiceUsageOverviewDetailModal',
    components: {
        CloudServiceUsageOverviewSummary,
        CloudServicePeriodFilter,
        PButtonModal: PButtonModal as any,
        PDynamicWidget,
        PDivider,
        PQuerySearchTags,
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
        isServer: {
            type: Boolean,
            default: false,
        },
        filters: {
            type: Array as () => QueryStoreFilter[],
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
            header: computed(() => `Usage Overview of ${props.cloudServiceTypeInfo?.name}`),
            widgetSchemaList: [] as DynamicWidgetSchema[],
            summaryWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => props.schemaList.filter(({ type }) => type === 'summary')),
            chartWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => props.schemaList.filter(({ type }) => type === 'chart')),
            chartDataList: [] as Data[][],
            dataLoading: true,
            cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeInfo?.cloud_service_type_id ?? ''),
            queryTags: [] as QueryTag[],
            apiQuery: { filter: [] as Filter[], keyword: '' },
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
                const { results } = await SpaceConnector.client.inventory[props.isServer ? 'server' : 'cloudService'].analyze({
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
            state.dataLoading = true;

            const results: any[] = await Promise.allSettled(state.chartWidgetSchemaList.map(schema => fetchDataWithSchema(schema)));

            state.chartDataList = results.map((d) => {
                if (d.status === 'fulfilled') return d.value;
                return [];
            });

            state.dataLoading = false;
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
        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
        });

        watch([() => props.filters, () => state.proxyVisible], async ([filters, visible]) => {
            if (visible) {
                const { filter, keyword } = queryHelper.setFilters(filters as QueryStoreFilter[]).apiQuery;

                state.apiQuery.filter = filter;
                state.apiQuery.keyword = keyword;
                state.queryTags = queryHelper.queryTags;
                await getDataListWithSchema();
            } else {
                state.chartDataList = [];
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
.cloud-service-usage-overview-detail-modal::v-deep {
    .modal-body {
        @apply bg-gray-100;
        display: flex;
        flex-direction: column;
        padding: 1rem 2.5rem;
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

    .p-dynamic-chart-column {
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

    .p-dynamic-widget-chart {
        @apply overflow-visible h-auto;
        min-height: 21.625rem;
    }

    .amcharts-Polyspline {
        @apply hidden;
    }
}

@screen laptop {
    .cloud-service-usage-overview-detail-modal::v-deep {
        .chart-widget-wrapper {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
}

@screen tablet {
    .cloud-service-usage-overview-detail-modal::v-deep {
        .modal-body {
            height: 70vh;
        }
        .chart-widget-wrapper {
            grid-template-columns: 1fr;
        }
    }
}

@screen mobile {
    .cloud-service-usage-overview-detail-modal::v-deep {
        .modal-body {
            padding: 0;
        }
    }
}

</style>
