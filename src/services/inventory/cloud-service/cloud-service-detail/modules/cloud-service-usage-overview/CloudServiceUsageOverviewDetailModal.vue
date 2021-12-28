<template>
    <p-button-modal :visible="proxyVisible"
                    :header-title="header"
                    :scrollable="false"
                    size="lg"
                    class="cloud-service-usage-overview-detail-modal"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-data-loader v-if="cloudServiceTypeId" :loading="layoutLoading"
                           :data="widgetSchemaList" class="widget-wrapper"
            >
                <p-dynamic-widget v-for="(schema, idx) in widgetSchemaList" :key="`${cloudServiceTypeId}-${idx}`"
                                  :type="schema.type"
                                  :name="schema.name"
                                  :data="dataList[idx]"
                                  :loading="dataLoading"
                                  :schema-options="schema.options"
                                  :class="schema.type"
                />
            </p-data-loader>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButtonModal, PDataLoader, PDynamicWidget } from '@spaceone/design-system';
import { DynamicWidgetSchema } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-widget/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { Filter } from '@spaceone/console-core-lib/space-connector/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { CloudServiceTypeInfo } from '@/services/inventory/cloud-service/cloud-service-detail/type';
import { Period } from '@/services/billing/cost-management/type';

interface Props {
    visible: boolean;
    cloudServiceTypeInfo?: CloudServiceTypeInfo;
    isServer?: boolean;
    filters?: QueryStoreFilter[];
    period?: Period;
}

interface Data {
    name?: string;
    value?: number;
}

export default defineComponent<Props>({
    name: 'CloudServiceUsageOverviewDetailModal',
    components: {
        PButtonModal: PButtonModal as any,
        PDataLoader,
        PDynamicWidget,
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
    },
    setup(props, { emit }) {
        const queryHelper = new QueryHelper();

        const state = reactive({
            proxyVisible: props.visible,
            header: computed(() => `Usage Overview of ${props.cloudServiceTypeInfo?.name}`),
            widgetSchemaList: [] as DynamicWidgetSchema[],
            layoutLoading: true,
            dataList: [] as Data[][],
            dataLoading: true,
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
                    // eslint-disable-next-line no-nested-ternary
                    mockPath: schema.type === 'card' ? '?type=card' : (schema.options?.limit ? `?limit=${schema.options.limit}` : ''),
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

        const handleUpdateVisible = (visible) => {
            state.proxyVisible = visible;
            emit('update:visible', visible);
        };

        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
        });

        watch(() => state.proxyVisible, async (visible) => {
            if (visible && state.cloudServiceTypeId) {
                await getWidgetSchemaList();
                await getDataListWithSchema();
                if (state.layoutLoading) state.layoutLoading = false;
            }
        }, { immediate: true });
        return {
            ...toRefs(state),
            handleUpdateVisible,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cloud-service-usage-overview-detail-modal {
    .widget-wrapper::v-deep {
        > .data-loader-container > .data-wrapper {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            grid-gap: 1rem;
        }
    }
}
</style>
