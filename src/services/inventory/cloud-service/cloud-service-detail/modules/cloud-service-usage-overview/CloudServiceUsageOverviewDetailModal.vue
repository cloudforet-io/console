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
            <p-divider class="flex-shrink-0" />
            <p-query-search-tags :tags="queryTags" read-only />
            <p-data-loader v-if="cloudServiceTypeId" :loading="layoutLoading"
                           :disable-empty-case="layoutLoading || dataLoading"
                           :data="widgetSchemaList" class="widget-wrapper"
            >
                <template v-for="(schema, idx) in widgetSchemaList">
                    <p-dynamic-widget :key="`${cloudServiceTypeId}-${idx}`"
                                      :type="schema.type"
                                      :name="schema.name"
                                      :data="dataList[idx]"
                                      :loading="dataLoading"
                                      :schema-options="schema.options"
                                      :field-handler="fieldHandler"
                                      :class="{'line-break': widgetSchemaList[idx + 1] && widgetSchemaList[idx + 1].type !== schema.type}"
                    />
                </template>
            </p-data-loader>
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
    PButtonModal, PDataLoader, PDivider, PDynamicWidget, PQuerySearchTags,
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


interface Props {
    visible: boolean;
    cloudServiceTypeInfo?: CloudServiceTypeInfo;
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
        CloudServicePeriodFilter,
        PButtonModal: PButtonModal as any,
        PDataLoader,
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
        cloudServiceTypeInfo: {
            type: Object as () => CloudServiceTypeInfo|undefined,
            default: undefined,
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
            layoutLoading: true,
            dataList: [] as Data[][],
            dataLoading: true,
            cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeInfo?.cloud_service_type_id ?? ''),
            queryTags: [] as QueryTag[],
            apiFilter: [] as Filter[],
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
                const options: any = {};
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

        const fetchDataWithSchema = async (schema: DynamicWidgetSchema): Promise<Data[]> => {
            try {
                const { results } = await SpaceConnector.client.inventory[props.isServer ? 'server' : 'cloudService'].analyze({
                    default_query: schema.query,
                    filter: state.apiFilter,
                    limit: schema.options?.limit,
                    date_range: state.dateRange,
                });
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const cachedSchemaList = {};
        const getWidgetSchemaList = async () => {
            state.layoutLoading = true;
            const schemaList = cachedSchemaList[state.cloudServiceTypeId];
            if (schemaList) state.widgetSchemaList = schemaList;
            else {
                state.widgetSchemaList = await fetchSchemaList();
                cachedSchemaList[state.cloudServiceTypeId] = state.widgetSchemaList;
            }
            state.layoutLoading = false;
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
        watch(() => props.filters, (filters) => {
            const { filter } = queryHelper.setFilters(filters).apiQuery;

            state.apiFilter = filter;
            state.queryTags = queryHelper.queryTags;
        }, { immediate: true });

        watch(() => props.visible, (visible) => {
            if (visible !== state.proxyVisible) state.proxyVisible = visible;
        });

        watch(() => state.proxyVisible, async (visible) => {
            if (visible && state.cloudServiceTypeId) {
                await getWidgetSchemaList();
                await getDataListWithSchema();
            } else {
                state.widgetSchemaList = [];
                state.dataList = [];
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
        display: flex;
        flex-direction: column;
        height: 744px;
        padding: 1rem 2.5rem;
    }
    .widget-wrapper {
        padding: 0.5rem 0;
        flex: 1;
        > .data-loader-container > .data-wrapper {
            height: 100%;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            grid-gap: 0.5rem;
        }
    }
}

@screen laptop {
    .cloud-service-usage-overview-detail-modal::v-deep {
        .widget-wrapper {
            > .data-loader-container > .data-wrapper {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
    }
}

@screen tablet {
    .cloud-service-usage-overview-detail-modal::v-deep {
        .modal-body {
            height: 70vh;
        }
        .widget-wrapper {
            > .data-loader-container > .data-wrapper {
                grid-template-columns: 1fr;
            }
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
