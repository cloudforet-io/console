<template>
    <fragment>
        <p-card class="cloud-service-usage-overview">
            <template #header>
                Usage Overview
                <p-button size="sm" style-type="primary-dark" :outline="true"
                          font-weight="bold" @click="handleClickShowAll"
                >
                    Show All
                </p-button>
            </template>
            <div v-for="(schema, idx) in summarySchemaList" :key="`${cloudServiceTypeId}-${idx}`" class="stat-summary">
                <p-dynamic-widget :type="schema.type"
                                  :name="schema.name"
                                  :data="data[idx]"
                                  :schema-options="schema.options"
                />
            </div>
        </p-card>
        <cloud-service-usage-overview-detail-modal v-model="usageOverviewDetailModalVisible"
                                                   :cloud-service-type-item="cloudServiceTypeItem"
                                                   :widget-schema-list="widgetSchemaList"
        />
    </fragment>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButton, PCard, PDynamicWidget } from '@spaceone/design-system';
import CloudServiceUsageOverviewDetailModal
    from '@/services/inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewDetailModal.vue';
import { CloudServiceTypeItem } from '@/services/inventory/cloud-service/cloud-service-detail/type';
import { DynamicWidgetSchema } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-widget/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

interface Props {
    cloudServiceTypeItem: CloudServiceTypeItem;
}

interface Data {
    value: number;
}

export default defineComponent<Props>({
    name: 'CloudServiceUsageOverview',
    components: {
        CloudServiceUsageOverviewDetailModal,
        PCard,
        PButton,
        PDynamicWidget,
    },
    props: {
        cloudServiceTypeItem: {
            type: Object as () => CloudServiceTypeItem,
            required: true,
        },
    },
    setup(props) {
        const state = reactive({
            usageOverviewDetailModalVisible: false,
            widgetSchemaList: [] as DynamicWidgetSchema[],
            summarySchemaList: computed<DynamicWidgetSchema[]>(() => state.widgetSchemaList.slice(0, 3)),
            data: [] as Data[],
            loading: false,
            cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeItem.id ?? ''),
        });

        const fetchWidgetSchemaList = async (): Promise<DynamicWidgetSchema[]> => {
            try {
                return await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve([
                            {
                                type: 'card',
                                name: 'Total Server Count',
                            },
                            {
                                type: 'card',
                                name: 'Total Allocated vCPUs Count',
                            },
                            {
                                type: 'card',
                                name: 'Total Allocated Memory Count',
                            },
                            {
                                type: 'card',
                                name: 'Total Allocated Disk Memory',
                            },
                        ] as DynamicWidgetSchema[]);
                    }, 1000);
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        const fetchData = async (): Promise<Data[]> => {
            try {
                return await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve([
                            {
                                value: Math.floor(Math.random() * 10000),
                            },
                            {
                                value: Math.floor(Math.random() * 100000),
                            },
                            {
                                value: Math.floor(Math.random() * 1000000),
                            },
                        ]);
                    }, 1000);
                });
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };


        const cachedSchemaList = {};

        const getSchemaAndData = async () => {
            state.loading = true;

            const schemaList = cachedSchemaList[state.cloudServiceTypeId];
            if (schemaList) state.widgetSchemaList = schemaList;
            else state.widgetSchemaList = await fetchWidgetSchemaList();

            state.data = await fetchData();

            state.loading = false;
        };

        const handleClickShowAll = () => {
            state.usageOverviewDetailModalVisible = true;
        };

        watch(() => state.cloudServiceTypeId, (cloudServiceTypeId) => {
            if (cloudServiceTypeId) getSchemaAndData();
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
    margin: 1rem 0;
}
</style>
