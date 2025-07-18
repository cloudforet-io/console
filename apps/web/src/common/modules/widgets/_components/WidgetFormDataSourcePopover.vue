<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import {
    PButton, PPopover, PSelectCard, PI, PDivider,
} from '@cloudforet/mirinae';

import type { DataTableAddParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/add';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { hideLoadingMessage, showErrorMessage, showLoadingMessage } from '@/lib/helper/notice-alert-helper';
import { MENU_ID } from '@/lib/menu/config';
import getRandomId from '@/lib/random-id-generator';
import type { ListResponse } from '@/lib/variable-models/_base/types';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormAssetSecurityDataSourcePopper
    from '@/common/modules/widgets/_components/WidgetFormAssetSecurityDataSourcePopper.vue';
import WidgetFormCostDataSourcePopper from '@/common/modules/widgets/_components/WidgetFormCostDataSourcePopper.vue';
import WidgetFormUnifiedCostDataSourcePopper
    from '@/common/modules/widgets/_components/WidgetFormUnifiedCostDataSourcePopper.vue';
import { useDataTableAddMutation } from '@/common/modules/widgets/_composables/mutations/use-data-table-add-mutation';
import { useWidgetCreateMutation } from '@/common/modules/widgets/_composables/mutations/use-widget-create-mutation';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import {
    DATA_SOURCE_DOMAIN,
    DATA_TABLE_TYPE, TRANSFORM_DATA_TABLE_DEFAULT_OPTIONS,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { DATA_TABLE_OPERATOR_INFO } from '@/common/modules/widgets/_constants/data-table-operator-constant';
import { getDuplicatedDataTableName } from '@/common/modules/widgets/_helpers/widget-data-table-helper';
import { useWidgetContextStore } from '@/common/modules/widgets/_store/widget-context-store';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DataTableDataType, DataTableSourceType, DataTableOperator, DataTableAddOptions, DataTableTransformOptions,
} from '@/common/modules/widgets/types/widget-model';


const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const widgetContextStore = useWidgetContextStore();
const widgetContextState = widgetContextStore.state;
const widgetContextGetters = widgetContextStore.getters;
const userStore = useUserStore();
const dashboardId = computed(() => widgetContextGetters.dashboardId);

/* Reference Data Model */
const referenceMap = useAllReferenceDataModel();
const costDataSourceMap = referenceMap.costDataSource;
const metricMap = referenceMap.metric;
const namespaceMap = referenceMap.namespace;


const emit = defineEmits<{(e: 'scroll'): void;}>();

const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);

/* Query */
const {
    dataTableList,
    keys: dataTableKeys,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const queryClient = useQueryClient();

const state = reactive({
    showPopover: false,
    selectedPopperCondition: undefined as undefined|DataTableDataType,
    selectedDataSourceDomain: undefined as undefined|DataTableSourceType,
    disableConfirmButton: computed(() => {
        if (state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST) {
            return !state.selectedCostDataSourceId || !state.selectedCostDataType;
        }
        if (state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.UNIFIED_COST) {
            return !state.selectedUnifiedCostDataType;
        }
        if ([DATA_SOURCE_DOMAIN.ASSET, DATA_SOURCE_DOMAIN.SECURITY].includes(state.selectedDataSourceDomain)) {
            return !state.selectedMetricId;
        }
        return true;
    }),
    // cost
    selectedCostDataSourceId: undefined as undefined|string,
    selectedCostDataType: undefined as undefined|string,
    selectedUnifiedCostDataType: undefined as undefined|string,
    // asset & security
    selectedMetricId: undefined as undefined|string,

    selectedCostDataTypeLabel: computed(() => {
        if (!state.selectedCostDataSourceId || !state.selectedCostDataType) return '';
        const targetCostDataSource = costDataSourceMap[state.selectedCostDataSourceId];
        const costAlias: string|undefined = costDataSourceMap[state.selectedCostDataSourceId]?.data?.plugin_info?.metadata?.cost_info?.name;
        if (state.selectedCostDataType === 'cost') {
            return costAlias ? `Cost (${costAlias})` : 'Cost';
        }
        if (state.selectedCostDataType === 'usage_quantity') {
            return 'Usage';
        }
        return targetCostDataSource?.data?.cost_data_keys?.find((key) => key === state.selectedCostDataType.replace('data.', '')) || '';
    }),
});

/* Computed Selected Data (reference data) */
const selectedCostDataSource = computed(() => costDataSourceMap[state.selectedCostDataSourceId]);
const selectedMetric = computed(() => metricMap[state.selectedMetricId]);
const selectedNamespace = computed(() => namespaceMap[selectedMetric.value?.data?.namespace_id ?? '']);

/* Api */
const { mutateAsync: createWidget, isPending: widgetCreateLoading } = useWidgetCreateMutation({
    onSuccess: (data) => {
        widgetGenerateStore.setWidgetFormInfo(data);
    },
    onError: (e) => {
        ErrorHandler.handleError(e);
    },
});
const { mutateAsync: addDataTable, isPending: dataTableAddLoading } = useDataTableAddMutation({
    widgetId: computed(() => widgetGenerateState.widgetId),
    onSuccess: (data) => {
        widgetGenerateStore.setSelectedDataTableId(data?.data_table_id);
    },
    onError: (e) => {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    },
});


/* Util */
const resetSelectedDataSource = () => {
    state.selectedCostDataSourceId = undefined;
    state.selectedCostDataType = undefined;
    state.selectedUnifiedCostDataType = undefined;
    state.selectedMetricId = undefined;
};

const loadingMessageIdSet = new Set<string>();
const getDataTableBaseName = () => {
    let baseName = '';

    if (state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST) {
        if (!selectedCostDataSource.value) {
            const loadingMessageId = showLoadingMessage('Wait for moment', 'CostDataSource is preparing...');
            loadingMessageIdSet.add(loadingMessageId);
            throw new Error('selectedCostDataSource is undefined');
        }
        baseName = `${selectedCostDataSource.value?.name} - ${state.selectedCostDataTypeLabel}`;
    } else if (state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.UNIFIED_COST) {
        baseName = 'Unified Cost';
    } else {
        if (!selectedNamespace.value || !selectedMetric.value) {
            const loadingMessageId = showLoadingMessage('Wait for moment', 'Namespace or Metric is preparing...');
            loadingMessageIdSet.add(loadingMessageId);
            throw new Error('selectedNamespace or selectedMetric is undefined');
        }
        baseName = `${selectedNamespace.value?.name} - ${selectedMetric.value?.label}`;
    }

    loadingMessageIdSet.forEach((id) => {
        hideLoadingMessage(id);
    });
    loadingMessageIdSet.clear();
    return baseName;
};

/* Event */
const handleClickAddDataSourceButton = () => {
    state.showPopover = !state.showPopover;
};
const handleClickDataSourceDomain = (domainName: DataTableSourceType) => {
    if (state.selectedDataSourceDomain === domainName) return;
    state.selectedDataSourceDomain = domainName;
    resetSelectedDataSource();
};
const handleCreateUnsavedTransform = async (operator: DataTableOperator) => {
    const unsavedTransformData = {
        data_table_id: `UNSAVED-${getRandomId()}`,
        name: getDuplicatedDataTableName(`${operator} Data`, dataTableList.value),
        data_type: DATA_TABLE_TYPE.TRANSFORMED,
        operator,
        options: {
            [operator]: TRANSFORM_DATA_TABLE_DEFAULT_OPTIONS[operator],
        } as DataTableTransformOptions,
        state: 'AVAILABLE',
    } as Partial<DataTableModel>;

    const _isPrivate = widgetGenerateState.widgetId?.startsWith('private');
    const dataTableListQueryKey = _isPrivate ? dataTableKeys.privateDataTableListQueryKey : dataTableKeys.publicDataTableListQueryKey;
    await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<DataTableModel>) => (oldData.results?.length ? {
        ...oldData, results: [...oldData.results, unsavedTransformData],
    } : {
        ...oldData, results: [unsavedTransformData],
    }));

    state.showPopover = false;
    emit('scroll');
};

const handleSelectPopperCondition = (condition: DataTableDataType) => {
    if (condition === DATA_TABLE_TYPE.TRANSFORMED && !dataTableList.value?.length) return;
    state.selectedPopperCondition = condition;
};
const handleConfirmDataSource = async () => {
    if (!dashboardId.value) {
        throw new Error('dashboardId is undefined');
    }


    // create widget
    if (widgetGenerateState.overlayType === 'ADD' && !widgetGenerateState.widgetId) {
        await createWidget({
            dashboard_id: dashboardId.value,
            tags: { created_by: userStore.state.userId },
            widget_type: 'table',
        });
    }

    if (state.selectedPopperCondition === DATA_TABLE_TYPE.ADDED) {
        const dataTableBaseName = getDataTableBaseName();

        // add parameters
        const addParameters = {
            widget_id: widgetGenerateState.widgetId as string,
            source_type: state.selectedDataSourceDomain,
            name: getDuplicatedDataTableName(dataTableBaseName, dataTableList.value),
        } as DataTableAddParameters;
        const dataKey = state.selectedCostDataType?.replace('data.', '');
        const costUnit: string|undefined = selectedCostDataSource.value?.data?.plugin_info?.metadata?.cost_info?.unit;
        const additionalDataInfo: Record<string, { name: string, unit: string }>|undefined = selectedCostDataSource.value?.data?.plugin_info?.metadata?.data_info;
        const additionalDataUnit = dataKey !== 'cost' && additionalDataInfo ? additionalDataInfo[dataKey]?.unit : undefined;

        // data unit
        let dataUnit: string|undefined;
        if (dataKey === 'cost') {
            dataUnit = costUnit;
        } else {
            dataUnit = additionalDataUnit;
        }

        // options
        let options: DataTableAddOptions;
        if (state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST) {
            options = {
                data_name: state.selectedCostDataTypeLabel,
                data_unit: dataUnit,
                COST: {
                    data_source_id: state.selectedCostDataSourceId,
                    data_key: state.selectedCostDataType,
                },
            };
        } else if (state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.UNIFIED_COST) {
            options = {
                data_name: dataTableBaseName,
                UNIFIED_COST: {
                    data_key: state.selectedUnifiedCostDataType,
                },
            };
        } else {
            options = {
                data_name: selectedMetric.value?.label,
                data_unit: selectedMetric.value?.data?.unit,
                ASSET: {
                    metric_id: state.selectedMetricId,
                },
            };
        }

        // NOTE: For DataTable-Create loading
        widgetGenerateStore.setDataTableCreateLoading(true);
        state.showPopover = false;

        const mergedParams = {
            ...addParameters,
            vars: widgetContextState.dashboard?.vars || {},
        };
        mergedParams.options = options;

        await addDataTable(mergedParams);
        emit('scroll');
    }
    widgetGenerateStore.setDataTableCreateLoading(false);
};



watch(() => state.showPopover, (val) => {
    if (!val) {
        state.selectedDataSourceDomain = undefined;
        state.selectedPopperCondition = undefined;
    }
});
</script>

<template>
    <p-popover class="data-source-popover"
               :is-visible.sync="state.showPopover"
               position="right-start"
               hide-close-button
               hide-padding
               trigger="none"
    >
        <button :class="{'add-button': true, opened: state.showPopover}"
                @click="handleClickAddDataSourceButton"
        >
            <p-i class="icon"
                 name="ic_plus"
                 width="2rem"
                 height="2rem"
                 color="inherit"
            />
        </button>
        <template #content>
            <div v-if="!state.selectedPopperCondition"
                 class="data-source-popper-condition-wrapper"
            >
                <p-select-card :label="i18n.t('COMMON.WIDGETS.DATA_TABLE.ADD')"
                               icon="ic_service_data-sources"
                               block
                               :show-select-marker="false"
                               @click="handleSelectPopperCondition(DATA_TABLE_TYPE.ADDED)"
                />
                <p-select-card :label="i18n.t('COMMON.WIDGETS.DATA_TABLE.TRANSFORM')"
                               icon="ic_transform-data"
                               :disabled="!dataTableList?.length"
                               :show-select-marker="false"
                               block
                               @click="handleSelectPopperCondition(DATA_TABLE_TYPE.TRANSFORMED)"
                />
            </div>
            <div v-else-if="state.selectedPopperCondition === DATA_TABLE_TYPE.ADDED"
                 class="data-source-popover-content"
            >
                <div class="top-part">
                    <div class="data-source-domain-col">
                        <p class="data-source-domain-title">
                            {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST_EXPLORER') }}
                        </p>
                        <p-select-card :class="{'custom-select-card': true, 'selected': state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST }"
                                       :value="DATA_SOURCE_DOMAIN.COST"
                                       @click="handleClickDataSourceDomain(DATA_SOURCE_DOMAIN.COST)"
                        >
                            <div class="domain-contents">
                                <p-i v-if="state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST"
                                     class="selected-marker"
                                     name="ic_checkbox-circle-selected"
                                     width="1.25rem"
                                     height="1.25rem"
                                />
                                <div class="icon-wrapper">
                                    <p-i name="ic_data-domain-cost"
                                         width="1.25rem"
                                         height="1.25rem"
                                    />
                                </div>
                                <p class="name">
                                    {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST') }}
                                </p>
                            </div>
                        </p-select-card>
                        <p-select-card :class="{'custom-select-card': true, 'selected': state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.UNIFIED_COST }"
                                       :value="DATA_SOURCE_DOMAIN.UNIFIED_COST"
                                       @click="handleClickDataSourceDomain(DATA_SOURCE_DOMAIN.UNIFIED_COST)"
                        >
                            <div class="domain-contents">
                                <p-i v-if="state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.UNIFIED_COST"
                                     class="selected-marker"
                                     name="ic_checkbox-circle-selected"
                                     width="1.25rem"
                                     height="1.25rem"
                                />
                                <div class="icon-wrapper">
                                    <p-i name="ic_data-domain-cost"
                                         width="1.25rem"
                                         height="1.25rem"
                                    />
                                </div>
                                <p class="name">
                                    {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.UNIFIED_COST') }}
                                </p>
                            </div>
                        </p-select-card>

                        <template v-if="visibleContents">
                            <p class="data-source-domain-title mt-2">
                                {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.INVENTORY') }}
                            </p>
                            <p-select-card :class="{'custom-select-card': true, 'selected': state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.ASSET }"
                                           :value="DATA_SOURCE_DOMAIN.ASSET"
                                           @click="handleClickDataSourceDomain(DATA_SOURCE_DOMAIN.ASSET)"
                            >
                                <div class="domain-contents">
                                    <p-i v-if="state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.ASSET"
                                         class="selected-marker"
                                         name="ic_checkbox-circle-selected"
                                         width="1.25rem"
                                         height="1.25rem"
                                    />
                                    <div class="icon-wrapper">
                                        <p-i name="ic_data-domain-asset"
                                             width="1.25rem"
                                             height="1.25rem"
                                        />
                                    </div>
                                    <p class="name">
                                        {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.ASSET') }}
                                    </p>
                                </div>
                            </p-select-card>
                        </template>
                    </div>
                    <template v-if="state.selectedDataSourceDomain">
                        <widget-form-cost-data-source-popper
                            v-if="state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST"
                            :selected-cost-data-source-id.sync="state.selectedCostDataSourceId"
                            :selected-cost-data-type.sync="state.selectedCostDataType"
                        />
                        <widget-form-unified-cost-data-source-popper v-if="state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.UNIFIED_COST"
                                                                     :selected-cost-data-type.sync="state.selectedUnifiedCostDataType"
                        />
                        <widget-form-asset-security-data-source-popper
                            v-if="[DATA_SOURCE_DOMAIN.ASSET, DATA_SOURCE_DOMAIN.SECURITY].includes(state.selectedDataSourceDomain)"
                            :data-source-domain="state.selectedDataSourceDomain"
                            :selected-metric-id.sync="state.selectedMetricId"
                        />
                    </template>
                    <template v-else>
                        <div class="empty-wrapper">
                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.SELECT_DATA_SOURCE_TYPE') }}
                        </div>
                    </template>
                </div>
                <div class="popover-footer">
                    <p-button style-type="substitutive"
                              :disabled="state.disableConfirmButton"
                              :loading="widgetCreateLoading || dataTableAddLoading"
                              @click="handleConfirmDataSource"
                    >
                        {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.DONE') }}
                    </p-button>
                </div>
            </div>
            <div v-else
                 class="data-source-popper-operator-wrapper"
            >
                <div class="conetent">
                    <div class="content-header flex items-center justify-between">
                        <div class="part-title">
                            {{ i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.MERGE') }}
                        </div>
                        <div class="part-title">
                            {{ i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.TRANSFORMATIONS') }}
                        </div>
                    </div>
                    <div class="content-part flex">
                        <div class="left-part">
                            <p-select-card v-for="(operatorInfo) in DATA_TABLE_OPERATOR_INFO.slice(0, 2)"
                                           :key="operatorInfo.key"
                                           value="operatorKey"
                                           label="a"
                                           block
                                           @click="handleCreateUnsavedTransform(operatorInfo.key)"
                            >
                                <div class="operator-card-contents">
                                    <p-i :name="operatorInfo.icon"
                                         width="1rem"
                                         height="1rem"
                                         color="inherit"
                                    />
                                    <div class="contents-wrapper">
                                        <p class="name">
                                            {{ operatorInfo.name }}
                                        </p>
                                        <p class="description">
                                            {{ $t(operatorInfo.description) }}
                                        </p>
                                    </div>
                                </div>
                            </p-select-card>
                        </div>
                        <p-divider class="content-divider"
                                   vertical
                        />
                        <div class="right-part">
                            <p-select-card v-for="(operatorInfo) in DATA_TABLE_OPERATOR_INFO.slice(2)"
                                           :key="operatorInfo.key"
                                           value="operatorKey"
                                           label="a"
                                           block
                                           @click="handleCreateUnsavedTransform(operatorInfo.key)"
                            >
                                <div class="operator-card-contents">
                                    <p-i :name="operatorInfo.icon"
                                         width="1rem"
                                         height="1rem"
                                         color="inherit"
                                    />
                                    <div class="contents-wrapper">
                                        <p class="name">
                                            {{ operatorInfo.name }}
                                        </p>
                                        <p class="description">
                                            {{ $t(operatorInfo.description) }}
                                        </p>
                                    </div>
                                </div>
                            </p-select-card>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </p-popover>
</template>

<style lang="scss" scoped>
.data-source-popover {
    width: 4.5rem;
    padding-right: 2rem;
    display: inline-block;
    position: relative;
    :deep(&.p-popover) {
        .popper {
            padding: 0;
        }
    }
    .add-button {
        @apply flex items-center justify-center bg-violet-400 border border-violet-500 text-white rounded-md;
        width: 2.5rem;
        height: 2.5rem;
        box-shadow: 0 0.02rem 0.04rem rgba(0, 0, 0, 0.06);
        .icon {
            transition: transform 0.2s ease;
        }
        &:hover {
            @apply bg-violet-500;
        }
        &.opened {
            @apply bg-white text-violet-500;
            .icon {
                transform: rotate(45deg);
            }
            &:hover {
                @apply bg-violet-200;
            }
        }
    }
    .data-source-popper-condition-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 21.5rem;
        padding: 1rem;
    }
    .data-source-popper-operator-wrapper {
        //display: flex;
        //flex-direction: column;
        width: 43.5rem;
        padding: 1rem;

        .conetent {
            width: 100%;
            height: 24rem;

            .content-header {
                .part-title {
                    @apply text-label-sm text-gray-700;
                    width: calc(50% - 0.25rem);
                    font-weight: bold;
                }
                padding-bottom: 0.5rem;
            }

            .content-part {
                overflow-y: scroll;
                max-height: 22.5rem;
                height: auto;

                .left-part, .right-part {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;

                    /* custom design-system component - p-select-card */
                    :deep(.p-select-card) {
                        height: 5.625rem;
                        padding: 1rem;
                        .select-card-contents {
                            @apply flex justify-start items-center;
                            flex-direction: row;
                            .p-lazy-img {
                                margin-right: 0.25rem;
                                margin-bottom: 0;
                            }
                        }
                    }
                }
                .content-divider {
                    margin: 0 1.125rem;
                    height: 30.125rem;
                }
            }

            .operator-card-contents {
                @apply flex gap-1;
                .contents-wrapper {
                    width: calc(100% - 1.25rem);
                    .name {
                        @apply text-label-md font-bold text-gray-900;
                        margin-bottom: 0.25rem;
                    }
                    .description {
                        @apply text-label-md text-gray-500;
                    }
                }
            }
        }
    }
    .data-source-popover-content {
        display: flex;
        flex-direction: column;
        min-width: 44rem;
        height: 26rem;
        .top-part {
            display: flex;
            width: 100%;
            flex: 1;
            .data-source-domain-col {
                @apply border-r border-gray-200;
                display: flex;
                flex-direction: column;
                min-width: 12rem;
                height: 100%;
                padding: 1rem 0.75rem;

                /* custom design-system component - p-select-card */
                :deep(.p-select-card) {
                    padding: 0.75rem 1.25rem;
                }
                .custom-select-card {
                    &.selected {
                        @apply border-blue-600;
                    }
                    .domain-contents {
                        @apply flex items-center gap-1 w-full relative;
                        .icon-wrapper {
                            @apply flex items-center justify-center rounded-md bg-violet-150;
                            width: 1.75rem;
                            height: 1.75rem;
                        }
                        .name {
                            @apply text-label-md font-bold text-gray-900;
                        }

                        .selected-marker {
                            @apply absolute;
                            left: -0.75rem;
                            top: -0.25rem;
                            z-index: 1;
                        }

                        &.selected {
                            .name {
                                @apply text-blue-600;
                            }
                        }
                    }
                }

                .data-source-domain-title {
                    @apply text-label-sm font-bold text-gray-700;
                    margin-bottom: 0.5rem;
                }
                .p-select-card {
                    margin-bottom: 0.5rem;
                }
            }
            .empty-wrapper {
                @apply flex justify-center items-center text-gray-300 text-paragraph-md;
                width: 100%;
                height: 100%;
            }
        }
    }
    .popover-footer {
        @apply border-t border-gray-200;
        text-align: right;
        padding: 0.75rem;
    }
}

/* custom design-system component - p-select-card */
:deep(.p-select-card) {
    padding: 1rem;
    .select-card-contents {
        @apply flex justify-start items-center;
        flex-direction: row;
        .p-lazy-img {
            margin-right: 0.25rem;
            margin-bottom: 0;
        }
    }
}

/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    border: none;
    .menu-container {
        height: 19.25rem;
    }
}
</style>
