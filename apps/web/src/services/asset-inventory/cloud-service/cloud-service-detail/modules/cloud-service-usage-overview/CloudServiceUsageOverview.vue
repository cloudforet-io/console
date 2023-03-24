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
            />
        </div>
        <cloud-service-usage-overview-detail-modal v-model="usageOverviewDetailModalVisible"
                                                   :schema-list="widgetSchemaList"
                                                   :summary-data-list="summaryDataList"
                                                   :cloud-service-type-info="cloudServiceTypeInfo"
                                                   :filters="filters"
                                                   :period="period"
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
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import dayjs from 'dayjs';
import { debounce, isEmpty } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CloudServiceUsageOverviewDetailModal
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewDetailModal.vue';
import CloudServiceUsageOverviewSummary
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewSummary.vue';
import type {
    CloudServiceTypeInfo,
} from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';
import type { Period } from '@/services/cost-explorer/type';

interface Props {
    cloudServiceTypeInfo: CloudServiceTypeInfo;
    filters?: ConsoleFilter[];
    period?: Period;
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
            type: Object as () => CloudServiceTypeInfo,
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
            apiQuery: computed<{filter?: ApiFilter[]; keyword?: string}>(() => {
                if (props.filters) {
                    const { filter, keyword } = queryHelper.setFilters(props.filters).apiQuery;
                    return { filter, keyword };
                }
                return {};
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
                const { provider, group, name } = props.cloudServiceTypeInfo as CloudServiceTypeInfo;
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

        let fetchDataTokenList: Array<CancelTokenSource|undefined> = [];

        const fetchDataWithSchema = async (schema: DynamicWidgetSchema, idx: number): Promise<Data> => {
            fetchDataTokenList[idx] = axios.CancelToken.source();

            try {
                const { results } = await SpaceConnector.client.inventory.cloudService.analyze({
                    ...state.apiQuery,
                    default_query: schema.query,
                    date_range: state.dateRange,
                });
                fetchDataTokenList[idx] = undefined;
                return results[0] ?? {};
            } catch (e: any) {
                if (!axios.isCancel(e.axiosError)) {
                    ErrorHandler.handleError(e);
                }
                return {};
            }
        };

        const cachedSchemaList = {};
        const getWidgetSchemaList = async () => {
            const schemaList = cachedSchemaList[state.cloudServiceTypeId];
            if (schemaList) state.widgetSchemaList = schemaList;
            else state.widgetSchemaList = await fetchSchemaList();
        };

        const cancelPreviousDataFetchRequests = () => {
            fetchDataTokenList.forEach((fetchDataToken) => {
                if (fetchDataToken) {
                    fetchDataToken.cancel('Next request will called.');
                }
            });
            fetchDataTokenList = [];
        };

        const getDataListWithSchema = debounce(async () => {
            if (!state.dataLoading) state.dataLoading = true;
            cancelPreviousDataFetchRequests();
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
        watch([() => props.filters, () => state.dateRange], () => {
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
