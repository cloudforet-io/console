<template>
    <fragment>
        <p-card class="cloud-service-usage-overview" size="lg">
            <template #header>
                Usage Overview
                <p-button size="sm" style-type="primary-dark" :outline="true"
                          font-weight="bold" class="show-button"
                          @click="handleClickShowAll"
                >
                    Show All
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
import {
    PButton, PCard, PDataLoader, PDynamicWidget,
} from '@spaceone/design-system';
import CloudServiceUsageOverviewDetailModal
    from '@/services/inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewDetailModal.vue';
import {
    CloudServiceTypeInfo,
} from '@/services/inventory/cloud-service/cloud-service-detail/type';
import { DynamicWidgetSchema } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-widget/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { Period } from '@/services/billing/cost-management/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { Filter } from '@spaceone/console-core-lib/space-connector/type';

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
            dataList: [] as Data[][], // statistics api data is always list type.
            dataLoading: false,
            cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeInfo?.cloud_service_type_id ?? ''),
            apiFilter: computed<Filter[]|undefined>(() => {
                if (props.filters) {
                    const { filter } = queryHelper.setFilters(props.filters).apiQuery;
                    return filter;
                }
                return undefined;
            }),
        });

        const fetchSchemaList = async (): Promise<DynamicWidgetSchema[]> => {
            try {
                const { provider, group, name } = props.cloudServiceTypeInfo as CloudServiceTypeInfo;
                const options = props.isServer ? {} : {
                    provider,
                    cloud_service_group: group,
                    cloud_service_type: name,
                };

                return SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: props.isServer ? 'inventory.Server' : 'inventory.CloudService',
                    schema: 'widget',
                    widget_type: 'card',
                    limit: 3,
                    options,
                }, {
                    mockMode: true,
                    mockPath: '?schema=widget',
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const fetchDataWithSchema = async (schema: DynamicWidgetSchema): Promise<Data[]> => {
            try {
                const { results } = await SpaceConnector.client.inventory.cloudService.stat({
                    query: schema.query,
                    filter: state.apiFilter,
                    limit: schema.options?.limit,
                    period: props.period,
                }, {
                    mockMode: true,
                });
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const cachedSchemaList = {};
        const getWidgetSchemaList = async () => {
            const schemaList = cachedSchemaList[state.cloudServiceTypeId];
            if (schemaList) state.widgetSchemaList = schemaList;
            else state.widgetSchemaList = await fetchSchemaList();
        };


        const getDataListWithSchema = async () => {
            state.dataLoading = true;
            const results = await Promise.allSettled(state.widgetSchemaList.map(schema => fetchDataWithSchema(schema)));
            state.dataList = results.map((d) => {
                if (d.status === 'fulfilled') return d.value;
                return [];
            });
            state.dataLoading = false;
        };

        const handleClickShowAll = () => {
            state.usageOverviewDetailModalVisible = true;
        };

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
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-usage-overview::v-deep {
    margin: 1rem 0;
    .stat-wrapper {
        height: 100%;
        min-height: 4rem;
    }
}

@screen tablet {
    .cloud-service-usage-overview::v-deep {
        .body {
            @apply flex-col;
            padding: 0 1.25rem;
        }

        .stat-summary {
            @apply flex items-center w-full border-l-0 border-t;
            min-height: 4.25rem;
            .p-dynamic-widget-card {
                @apply w-full h-full;
                padding: 1.25rem 0;
            }
        }
    }
}

@screen mobile {
    .cloud-service-usage-overview::v-deep {
        .stat-summary {
            .p-dynamic-widget-card {
                @apply flex-col items-start;
                padding: 1rem 0;
            }
        }
    }
}
</style>
