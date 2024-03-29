<template>
    <fragment>
        <div class="cloud-service-usage-overview">
            <header>
                {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.USAGE_OVERVIEW') }}
                <p-button style-type="tertiary"
                          size="sm"
                          :disabled="schemaLoading || !chartWidgetSchemaList.length"
                          @click="handleClickShowAll"
                >
                    {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.SHOW_CHARTS') }}
                </p-button>
            </header>
            <cloud-service-usage-overview-summary :schema-loading="schemaLoading"
                                                  :data-loading="dataLoading"
                                                  :data-list="summaryDataList"
                                                  :widget-schema-list="summaryWidgetSchemaList"
                                                  :cloud-service-type-id="cloudServiceTypeId"
                                                  :filters="hiddenFilters"
            />
        </div>
        <cloud-service-usage-overview-detail-modal v-model="usageOverviewDetailModalVisible"
                                                   :schema-list="widgetSchemaList"
                                                   :summary-data-list="summaryDataList"
                                                   :cloud-service-type-info="cloudServiceTypeInfo"
                                                   :filters="filters"
                                                   :period="period"
                                                   :key-item-sets="keyItemSets"
        />
    </fragment>
</template>

<script lang="ts">

import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import {
    PButton,
} from '@spaceone/design-system';
import type {
    DynamicWidgetSchema,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-widget/type';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';
import dayjs from 'dayjs';
import { debounce, isEmpty } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import type { CloudServiceTypeModel } from '@/schema/inventory/cloud-service-type/model';
import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CloudServiceUsageOverviewDetailModal
    from '@/services/asset-inventory/components/CloudServiceUsageOverviewDetailModal.vue';
import CloudServiceUsageOverviewSummary
    from '@/services/asset-inventory/components/CloudServiceUsageOverviewSummary.vue';
import type { Period } from '@/services/asset-inventory/types/type';

interface Props {
    cloudServiceTypeInfo: CloudServiceTypeModel;
    filters?: ConsoleFilter[];
    period?: Period;
    hiddenFilters?: ConsoleFilter[];
    keyItemSets: KeyItemSet[];
}

interface Data {
    value?: number;
}

export default defineComponent<Props>({
    name: 'CloudServiceUsageOverview',
    components: {
        CloudServiceUsageOverviewSummary,
        CloudServiceUsageOverviewDetailModal,
        PButton,

    },
    props: {
        cloudServiceTypeInfo: {
            type: Object as () => CloudServiceTypeModel,
            default: () => ({}),
        },
        filters: {
            type: Array as () => ConsoleFilter[]|undefined,
            default: undefined,
        },
        period: {
            type: Object as () => Period|undefined,
            default: undefined,
        },
        hiddenFilters: {
            type: Array as () => ConsoleFilter[]|undefined,
            default: undefined,
        },
        keyItemSets: {
            type: Array as () => KeyItemSet[],
            default: () => [],
        },
    },
    setup(props) {
        const queryHelper = new QueryHelper();

        const state = reactive({
            usageOverviewDetailModalVisible: false,
            widgetSchemaList: [] as DynamicWidgetSchema[],
            summaryWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => state.widgetSchemaList.filter(({ type }) => ['summary', 'card'].includes(type))),
            chartWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => state.widgetSchemaList.filter(({ type }) => type === 'chart')),
            schemaLoading: true,
            summaryDataList: [] as Data[],
            dataLoading: false,
            cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeInfo.cloud_service_type_id ?? ''),
            apiQuery: computed<{filter: ApiFilter[]; keyword: string}>(() => {
                queryHelper.setFilters([]);
                if (props.filters) {
                    queryHelper.addFilter(...props.filters);
                }
                if (props.hiddenFilters) {
                    queryHelper.addFilter(...props.hiddenFilters);
                }
                const { filter, keyword } = queryHelper.apiQuery;
                return { filter, keyword };
            }),
            dateRange: computed<Period|undefined>(() => {
                if (isEmpty(props.period)) return undefined;
                const period = props.period as Period;
                const dateRange: Period = {};
                if (period.start) dateRange.start = dayjs.utc(period.start).format('YYYY-MM-DD');
                if (period.end) dateRange.end = dayjs.utc(period.end).add(1, 'day').format('YYYY-MM-DD');
                return dateRange;
            }),
        });

        const fetchSchemaList = async (): Promise<DynamicWidgetSchema[]> => {
            try {
                const { provider, group, name } = props.cloudServiceTypeInfo as CloudServiceTypeModel;
                const { widget } = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: 'inventory.CloudService',
                    schema: 'widget',
                    options: {
                        provider,
                        cloud_service_group: group,
                        cloud_service_type: name,
                        // widget_type: 'chart',
                        // limit: 15,
                    },
                });
                return widget ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const fetcherList: any[] = [];
        const fetchDataWithSchema = async (schema: DynamicWidgetSchema, idx: number): Promise<Data> => {
            let _fetcher = fetcherList[idx];
            if (!_fetcher) {
                const cancellableFetcher = getCancellableFetcher<CloudServiceAnalyzeParameters>(SpaceConnector.client.inventory.cloudService.analyze);
                fetcherList[idx] = cancellableFetcher;
                _fetcher = cancellableFetcher;
            }

            try {
                const { status, response } = await _fetcher({
                    ...state.apiQuery,
                    default_query: schema.query,
                    date_range: state.dateRange,
                });
                if (status === 'succeed') {
                    return response.results[0] ?? {};
                }
                return {};
            } catch (e: any) {
                ErrorHandler.handleError(e);
                return {};
            }
        };

        const cachedSchemaList = {};
        const getWidgetSchemaList = async () => {
            const schemaList = cachedSchemaList[state.cloudServiceTypeId];
            if (schemaList) state.widgetSchemaList = schemaList;
            else state.widgetSchemaList = await fetchSchemaList();
        };

        const getDataListWithSchema = debounce(async () => {
            if (!state.dataLoading) state.dataLoading = true;
            const results: any = await Promise.allSettled(state.summaryWidgetSchemaList.map((schema, i) => fetchDataWithSchema(schema, i)));
            state.summaryDataList = results.map((d) => {
                if (d.status === 'fulfilled') return d.value;
                return {};
            });
            state.dataLoading = false;
        }, 300);

        /* Event Handlers */
        const handleClickShowAll = () => {
            state.usageOverviewDetailModalVisible = true;
        };

        /* Watchers */
        watch([() => state.apiQuery, () => state.dateRange], () => {
            if (state.cloudServiceTypeId) {
                getDataListWithSchema();
            }
        });

        watch(() => state.cloudServiceTypeId, async (cloudServiceTypeId) => {
            if (cloudServiceTypeId) {
                state.schemaLoading = true;
                state.dataLoading = true;
                await getWidgetSchemaList();
                await getDataListWithSchema();
                state.schemaLoading = false;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleClickShowAll,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-usage-overview {
    padding: 0 1rem 1.5rem;

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: bold;
        font-size: 1rem;
        line-height: 1.25rem;
        margin-bottom: 0.625rem;
    }
}
</style>
