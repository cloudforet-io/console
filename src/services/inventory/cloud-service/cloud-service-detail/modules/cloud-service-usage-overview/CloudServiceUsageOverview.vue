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
            <div v-for="(schema, idx) in widgetSchemaList" :key="`${cloudServiceTypeId}-${idx}`" class="stat-summary">
                <div v-if="loading" class="flex justify-between items-center px-4 w-full">
                    <p-skeleton width="10rem" height="1rem" />
                    <p-skeleton width="2.5rem" height="1rem" />
                </div>
                <template v-else>
                    <p-dynamic-widget :type="schema.type"
                                      :name="schema.name"
                                      :data="data[idx]"
                                      :schema-options="schema.options"
                    />
                </template>
            </div>
        </p-card>
        <cloud-service-usage-overview-detail-modal v-model="usageOverviewDetailModalVisible"
                                                   :cloud-service-type-info="cloudServiceTypeInfo"
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
    PButton, PCard, PDynamicWidget, PSkeleton,
} from '@spaceone/design-system';
import CloudServiceUsageOverviewDetailModal
    from '@/services/inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverviewDetailModal.vue';
import {
    CloudServiceTypeInfo,
} from '@/services/inventory/cloud-service/cloud-service-detail/type';
import { DynamicWidgetSchema } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-widget/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

interface Props {
    cloudServiceTypeInfo?: CloudServiceTypeInfo;
    isServer?: boolean;
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
        PSkeleton,
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
    },
    setup(props) {
        const state = reactive({
            usageOverviewDetailModalVisible: false,
            widgetSchemaList: [] as DynamicWidgetSchema[],
            data: [] as Data[],
            loading: false,
            cloudServiceTypeId: computed<string>(() => props.cloudServiceTypeInfo?.cloud_service_type_id ?? ''),
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
.cloud-service-usage-overview::v-deep {
    margin: 1rem 0;

    header {
        @apply flex items-center;
        .show-button {
            @apply ml-auto;
        }
    }

    .body {
        @apply flex;
        padding: 1.125rem 1.0625rem;
    }

    .stat-summary {
        @apply border-l border-gray-200;
        width: 33.3%;
        &:first-of-type {
            @apply border-0;
        }
        .p-dynamic-widget-card {
            @apply border-0;
            min-height: 1.75rem;
            min-width: auto;
            .name {
                @apply text-gray-700;
                font-size: 1rem;
                line-height: 1.2;
            }
        }
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
