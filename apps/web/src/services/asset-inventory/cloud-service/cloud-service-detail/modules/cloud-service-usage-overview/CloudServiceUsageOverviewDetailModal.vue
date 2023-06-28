<script lang="ts" setup>

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';
import {
    PButtonModal, PDynamicWidget, PQuerySearchTags, PDivider,
} from '@spaceone/design-system';
import type {
    DynamicWidgetFieldHandler,
    DynamicWidgetSchema,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-widget/type';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';

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
    hiddenFilters: ConsoleFilter[];
    keyItemSets: KeyItemSet[];
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    schemaList: () => [],
    summaryDataList: () => [],
    cloudServiceTypeInfo: () => ({}) as CloudServiceTypeInfo,
    filters: () => [],
    period: undefined,
    hiddenFilters: () => [],
    keyItemSets: () => [],
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const { t } = useI18n();
const store = useStore();

const queryHelper = new QueryHelper();
const state = reactive({
    proxyVisible: props.visible,
    header: computed(() => t('INVENTORY.CLOUD_SERVICE.MAIN.USAGE_OVERVIEW_OF_RESOURCE', { resource: props.cloudServiceTypeInfo?.name })),
    widgetSchemaList: [] as DynamicWidgetSchema[],
    summaryWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => props.schemaList.filter(({ type }) => ['summary', 'card'].includes(type))),
    chartWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => props.schemaList.filter(({ type }) => type === 'chart')),
    chartDataList: [] as Data[][],
    dataLoading: true,
    cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeInfo?.cloud_service_type_id ?? ''),
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

const queryTagsHelper = useQueryTags({});
const { queryTags } = queryTagsHelper;
watch(() => props.keyItemSets, (keyItemSets) => {
    queryTagsHelper.setKeyItemSets(keyItemSets);
}, { immediate: true });

const setFilters = (filters: ConsoleFilter[], hiddenFilters: ConsoleFilter[]) => {
    queryTagsHelper.setFilters(filters);

    const { filter, keyword } = queryHelper.setFilters(filters).addFilter(...hiddenFilters).apiQuery;
    state.apiQuery.filter = filter;
    state.apiQuery.keyword = keyword;
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
watch(
    [() => state.proxyVisible, () => props.schemaList, () => props.filters, () => props.hiddenFilters],
    async ([visible, schemaList, filters, hiddenFilters], [, prevSchemaList]) => {
        if (!visible) {
            // If the schema is the same, do not flush the data.
            // We can reuse the data if the filters are the same.
            if (schemaList !== prevSchemaList) state.chartDataList = [];

            // Show users loading UI at the first time.
            state.dataLoading = true;
            return;
        }

        // set filters and get data
        if (!state.dataLoading) state.dataLoading = true;
        setFilters(filters, hiddenFilters);
        await getDataListWithSchema();
        state.dataLoading = false;
    },
    { immediate: true },
);

let initiated = false;
watch(() => props.visible, async (visible) => {
    if (visible !== state.proxyVisible) state.proxyVisible = visible;
    if (!initiated) {
        await store.dispatch('reference/loadAll');
        initiated = true;
    }
}, { immediate: true });

</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="state.header"
                    hide-footer-close-button
                    size="lg"
                    class="cloud-service-usage-overview-detail-modal"
                    @update:visible="handleUpdateVisible"
                    @confirm="handleUpdateVisible(false)"
    >
        <template #body>
            <div class="filter-wrapper">
                <span class="filter-label">Filter: </span>
                <span class="period">{{ period ? '' : 'Auto (Overall period)' }}</span>
                <cloud-service-period-filter class="period-filter"
                                             read-only
                                             :period="period"
                />
                <p-divider v-if="queryTags.length"
                           vertical
                />
                <p-query-search-tags :tags="queryTags"
                                     read-only
                />
            </div>
            <div class="modal-inner">
                <cloud-service-usage-overview-summary v-if="summaryDataList.length"
                                                      :data-loading="state.dataLoading"
                                                      :data-list="summaryDataList"
                                                      :widget-schema-list="state.summaryWidgetSchemaList"
                                                      :cloud-service-type-id="state.cloudServiceTypeId"
                />
                <div class="chart-widget-wrapper">
                    <template v-for="(schema, idx) in state.chartWidgetSchemaList"
                              :key="`${state.cloudServiceTypeId}-${idx}`"
                    >
                        <p-dynamic-widget :index="idx"
                                          :type="schema.type"
                                          :name="schema.name"
                                          :data="state.chartDataList[idx]"
                                          :loading="state.dataLoading"
                                          :schema-options="schema.options"
                                          :field-handler="fieldHandler"
                        />
                    </template>
                </div>
            </div>
        </template>
        <template #confirm-button>
            {{ t('INVENTORY.CLOUD_SERVICE.MAIN.CLOSE') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.cloud-service-usage-overview-detail-modal {
    .modal-inner {
        @apply bg-gray-100;
        display: flex;
        flex-direction: column;
        padding: 1rem 1.25rem;
    }
    .filter-wrapper {
        @apply flex items-center mb-3;
        .filter-label {
            @apply text-sm text-gray-900 font-bold;
            margin-right: 0.5rem;
            margin-bottom: 0.75rem;
        }
        .period {
            @apply text-sm text-gray-500;
            margin-bottom: 0.75rem;
        }
        .p-divider {
            height: 1rem;
            margin-left: 1rem;
            margin-right: 1rem;
            margin-bottom: 0.75rem;
        }
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
