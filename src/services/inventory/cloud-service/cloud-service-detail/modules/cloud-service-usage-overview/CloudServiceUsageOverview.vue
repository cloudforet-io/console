<template>
    <fragment>
        <div class="cloud-service-usage-overview">
            <header>
                {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.USAGE_OVERVIEW') }}
                <p-button size="sm" style-type="gray-border" :outline="true"
                          font-weight="bold"
                          :disabled="schemaLoading || !chartWidgetSchemaList.length"
                          @click="handleClickShowAll"
                >
                    {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.SHOW_CHARTS') }}
                </p-button>
            </header>
            <cloud-service-usage-overview-summary :key="`${cloudServiceResourceType}-summary`"
                                                  :schema-loading="schemaLoading"
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
                                                   :is-server="isServer"
        />
    </fragment>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { debounce, isEmpty } from 'lodash';
import axios, { CancelTokenSource } from 'axios';
import dayjs from 'dayjs';

import {
    PButton,
} from '@spaceone/design-system';
import {
    DynamicWidgetSchema,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-widget/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { Filter } from '@spaceone/console-core-lib/space-connector/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CloudServiceUsageOverviewDetailModal
    from '@/services/inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewDetailModal.vue';
import {
    CloudServiceTypeInfo,
} from '@/services/inventory/cloud-service/cloud-service-detail/type';
import { Period } from '@/services/billing/cost-management/type';
import CloudServiceUsageOverviewSummary
    from '@/services/inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewSummary.vue';


interface Props {
    cloudServiceTypeInfo: CloudServiceTypeInfo;
    isServer?: boolean;
    filters?: QueryStoreFilter[];
    period?: Period;
    disabled?: boolean;
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
        isServer: {
            type: Boolean,
            default: false,
        },
        filters: {
            type: Array as () => QueryStoreFilter[]|undefined,
            default: undefined,
        },
        period: {
            type: Object as () => Period|undefined,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const queryHelper = new QueryHelper();

        const state = reactive({
            usageOverviewDetailModalVisible: false,
            widgetSchemaList: [] as DynamicWidgetSchema[],
            summaryWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => state.widgetSchemaList.filter(({ type }) => type === 'summary')),
            chartWidgetSchemaList: computed<DynamicWidgetSchema[]>(() => state.widgetSchemaList.filter(({ type }) => type === 'chart')),
            schemaLoading: true,
            summaryDataList: [] as Data[],
            dataLoading: false,
            cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeInfo.cloud_service_type_id ?? ''),
            cloudServiceResourceType: computed<string>(() => props.cloudServiceTypeInfo.resource_type), // resource_type is always unique for every cloud service types including servers.
            apiQuery: computed<{filter?: Filter[]; keyword?: string}>(() => {
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
                if (period.end) dateRange.end = dayjs.utc(period.end).format('YYYY-MM-DD');
                return dateRange;
            }),
        });

        const fetchSchemaList = async (): Promise<DynamicWidgetSchema[]> => {
            try {
                const { provider, group, name } = props.cloudServiceTypeInfo as CloudServiceTypeInfo;
                const options: any = {
                    provider,
                    cloud_service_group: group,
                    cloud_service_type: name,
                };

                const { widget } = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: props.isServer ? 'inventory.Server' : 'inventory.CloudService',
                    schema: 'widget',
                    options,
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
                const { results } = await SpaceConnector.client.inventory[props.isServer ? 'server' : 'cloudService'].analyze({
                    ...state.apiQuery,
                    default_query: schema.query,
                    date_range: state.dateRange,
                });
                fetchDataTokenList[idx] = undefined;
                return results[0] ?? {};
            } catch (e) {
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
            if (!props.disabled && state.cloudServiceTypeId) {
                getDataListWithSchema();
            }
        });

        watch(() => state.cloudServiceTypeId, async (cloudServiceTypeId) => {
            if (!props.disabled && cloudServiceTypeId) {
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
