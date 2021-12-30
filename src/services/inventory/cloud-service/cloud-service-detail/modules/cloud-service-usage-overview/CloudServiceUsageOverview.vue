<template>
    <fragment>
        <p-card class="cloud-service-usage-overview">
            <template #header>
                {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.USAGE_OVERVIEW') }}
                <p-button size="sm" style-type="primary-dark" :outline="true"
                          font-weight="bold" class="show-button"
                          @click="handleClickShowAll"
                >
                    {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.SHOW_ALL') }}
                </p-button>
            </template>
            <p-data-loader :loading="layoutLoading" :data="widgetSchemaList" class="stat-wrapper">
                <p-dynamic-widget v-for="(schema, idx) in widgetSchemaList" :key="`${cloudServiceTypeId}-${idx}`"
                                  class="stat-summary"
                                  :type="schema.type"
                                  :name="schema.name"
                                  :data="dataList[idx]"
                                  :loading="dataLoading"
                                  :schema-options="schema.options"
                                  :field-handler="fieldHandler"
                />
            </p-data-loader>
        </p-card>
        <cloud-service-usage-overview-detail-modal v-model="usageOverviewDetailModalVisible"
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
    PButton, PCard, PDataLoader, PDynamicWidget,
} from '@spaceone/design-system';
import {
    DynamicWidgetFieldHandler,
    DynamicWidgetSchema,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-widget/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { Filter } from '@spaceone/console-core-lib/space-connector/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import CloudServiceUsageOverviewDetailModal
    from '@/services/inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewDetailModal.vue';
import {
    CloudServiceTypeInfo,
} from '@/services/inventory/cloud-service/cloud-service-detail/type';
import { Period } from '@/services/billing/cost-management/type';


interface Props {
    cloudServiceTypeInfo?: CloudServiceTypeInfo;
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
        CloudServiceUsageOverviewDetailModal,
        PDataLoader,
        PCard,
        PButton,
        PDynamicWidget,
    },
    props: {
        cloudServiceTypeInfo: {
            type: Object as () => CloudServiceTypeInfo|undefined,
            default: undefined,
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
            layoutLoading: true,
            dataList: [] as Data[],
            dataLoading: false,
            cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeInfo?.cloud_service_type_id ?? ''),
            apiFilter: computed<Filter[]|undefined>(() => {
                if (props.filters) {
                    const { filter } = queryHelper.setFilters(props.filters).apiQuery;
                    return filter;
                }
                return undefined;
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
                    widget_type: 'card',
                    limit: 3,
                };
                if (!props.isServer) {
                    options.provider = provider;
                    options.cloud_service_group = group;
                    options.cloud_service_type = name;
                }

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
                    default_query: schema.query,
                    filter: state.apiFilter,
                    limit: schema.options?.limit,
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
            state.dataLoading = true;
            cancelPreviousDataFetchRequests();
            const results = await Promise.allSettled(state.widgetSchemaList.map((schema, i) => fetchDataWithSchema(schema, i)));
            state.dataList = results.map((d) => {
                if (d.status === 'fulfilled') return d.value;
                return {};
            });
            state.dataLoading = false;
        }, 300);

        /* Component Props */
        const fieldHandler: DynamicWidgetFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

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
                await getWidgetSchemaList();
                await getDataListWithSchema();
                if (state.layoutLoading) state.layoutLoading = false;
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleClickShowAll,
            fieldHandler,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-usage-overview::v-deep {
    padding: 0 1rem 1.5rem;

    header {
        @apply flex items-center;
        .show-button {
            @apply ml-auto;
        }
    }

    .body {
        padding: 1rem;
    }

    .stat-wrapper {
        height: 100%;
        .data-wrapper {
            @apply flex;
            flex-wrap: wrap;
            row-gap: 1.25rem;
        }
        .stat-summary {
            @apply border-gray-200 rounded-none;
            width: 33.3%;
            min-width: auto;
            height: auto;
            min-height: 1.75rem;
            padding: 0 1rem;
            border-width: 0 0 0 1px;
            &:nth-of-type(3n-2) {
                @apply border-l-0;
            }
            .name {
                @apply text-gray-700 mr-2;
                font-size: 1rem;
                line-height: 1.2;
            }
            .value {
                @apply flex-shrink-0;
            }
        }
    }
}

@screen tablet {
    .cloud-service-usage-overview::v-deep {
        .body {
            padding: 0 1rem;
        }

        .stat-wrapper {
            .data-wrapper {
                @apply flex-col;
                row-gap: 0;
                padding: 0;
            }
            .stat-summary {
                @apply flex items-center w-full border-l-0 border-t;
                min-height: 4.25rem;
                padding: 0;
                &:nth-of-type(1) {
                    @apply border-t-0;
                }
            }
        }
    }
}

@screen mobile {
    .cloud-service-usage-overview::v-deep {
        .stat-wrapper {
            .data-wrapper {
                row-gap: 0;
            }

            .stat-summary {
                @apply flex-col items-start;
                min-height: 5.0625rem;
                padding: 1rem 0;
            }
        }
    }
}
</style>
