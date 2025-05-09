<script lang="ts" setup>
import {
    computed, onMounted, reactive,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep, sortBy } from 'lodash';

import {
    PFieldGroup, PSelectDropdown, PButton, PI, PButtonModal, PTooltip,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import NewMark from '@/common/components/marks/NewMark.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { useWidgetQuery } from '@/common/modules/widgets/_composables/use-widget-query';
import { DATA_TABLE_OPERATOR, DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { WIDGET_COMPONENT_ICON_MAP } from '@/common/modules/widgets/_constants/widget-components-constant';
import { CONSOLE_WIDGET_CONFIG } from '@/common/modules/widgets/_constants/widget-config-list-constant';
import { UNSUPPORTED_CHARTS_IN_PIVOT } from '@/common/modules/widgets/_constants/widget-constant';
import {
    getWidgetFieldComponent,
} from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { sanitizeWidgetOptions } from '@/common/modules/widgets/_helpers/widget-options-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type WidgetFieldValueManager from '@/common/modules/widgets/_widget-field-value-manager';
import WidgetHeaderField from '@/common/modules/widgets/_widget-fields/header/WidgetHeaderField.vue';
import tableConfig from '@/common/modules/widgets/_widgets/table/widget-config';

import { gray, red } from '@/styles/colors';




const FORM_TITLE_MAP = {
    DATE_CONFIG: 'DATE_CONFIG',
    WIDGET_HEADER: 'WIDGET_HEADER',
    REQUIRED_FIELDS: 'REQUIRED_FIELDS',
    OPTIONAL_FIELDS: 'OPTIONAL_FIELDS',
};
const DATE_CONFIG_FIELD_KEYS = ['granularity', 'dateFormat', 'dateRange'];

interface Props {
    widgetValidationInvalid?: boolean;
    widgetValidationInvalidText?: string|TranslateResult;
    fieldManager: WidgetFieldValueManager;
}

type DataTableModel = PrivateDataTableModel|PublicDataTableModel;
const props = defineProps<Props>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    fetcher,
    keys,
} = useWidgetQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const queryClient = useQueryClient();

const state = reactive({
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === widgetGenerateState.selectedDataTableId)),
    chartTypeMenuItems: computed<MenuItem[]>(() => Object.values(CONSOLE_WIDGET_CONFIG).map((d) => ({
        name: d.widgetName,
        label: d.meta?.title || d.widgetName,
        icon: WIDGET_COMPONENT_ICON_MAP[d.widgetName ?? ''],
        iconColor: UNSUPPORTED_CHARTS_IN_PIVOT.includes(d.widgetName) && state.selectedDataTable?.operator === DATA_TABLE_OPERATOR.PIVOT ? gray[300] : undefined,
        disabled: UNSUPPORTED_CHARTS_IN_PIVOT.includes(d.widgetName) && state.selectedDataTable?.operator === DATA_TABLE_OPERATOR.PIVOT,
    }))),
    widgetConfig: computed(() => getWidgetConfig(widgetGenerateState.selectedWidgetName)),
    widgetConfigDependencies: computed<{[key:string]: string[]}>(() => state.widgetConfig.dependencies || {}),
    defaultValidationConfig: computed(() => state.widgetConfig.meta?.defaultValidationConfig),
    widgetDefaultValidationModalVisible: false,
    formErrorModalValue: undefined as number|undefined,
    widgetDateConfigSchemaMap: computed(() => {
        const dateConfigFields = Object.entries({
            ...state.widgetConfig.requiredFieldsSchema,
            ...state.widgetConfig.optionalFieldsSchema,
        })
            .filter(([key]) => DATE_CONFIG_FIELD_KEYS.includes(key));
        return sortBy(dateConfigFields, ([key]) => DATE_CONFIG_FIELD_KEYS.indexOf(key));
    }),
    widgetRequiredFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.requiredFieldsSchema).filter(([key]) => !DATE_CONFIG_FIELD_KEYS.includes(key))),
    widgetOptionalFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.optionalFieldsSchema).filter(([key]) => !DATE_CONFIG_FIELD_KEYS.includes(key))),
    // display
    collapsedTitleMap: {
        [FORM_TITLE_MAP.DATE_CONFIG]: false,
        [FORM_TITLE_MAP.WIDGET_HEADER]: false,
        [FORM_TITLE_MAP.REQUIRED_FIELDS]: false,
        [FORM_TITLE_MAP.OPTIONAL_FIELDS]: false,
    },
    selectableDataTableItems: computed(() => dataTableList.value.map((d) => ({
        name: d.data_table_id,
        label: d.name,
        icon: d.data_type === DATA_TABLE_TYPE.TRANSFORMED ? 'ic_transform-data' : 'ic_service_data-sources',
    }))),
    selectedDataTableId: computed<string|undefined>(() => widgetGenerateState.selectedDataTableId),
    errorModalCurrentType: undefined as 'default'|'geoMap'|undefined,
});

/* Api */
const { mutateAsync: updateWidget } = useMutation({
    mutationFn: fetcher.updateWidgetFn,
    onSuccess: (data) => {
        const widgetQueryKey = widgetGenerateState.widgetId?.startsWith('private')
            ? keys.privateWidgetGetQueryKey
            : keys.publicWidgetGetQueryKey;
        queryClient.setQueryData(widgetQueryKey.value, () => data);
    },
    onError: (e) => {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    },
});
/* Event */
const handleSelectDataTable = async (dataTableId: string) => {
    const selectedDataTable = dataTableList.value.find((d) => d.data_table_id === dataTableId);
    if (!selectedDataTable) return;

    const isPivotDataTable = selectedDataTable.operator === DATA_TABLE_OPERATOR.PIVOT;
    let widgetType = widgetGenerateState.selectedWidgetName;

    if (isPivotDataTable && UNSUPPORTED_CHARTS_IN_PIVOT.includes(widgetType)) {
        widgetType = 'table';
        widgetGenerateStore.setSelectedWidgetName('table');
        widgetGenerateStore.setSize(tableConfig.meta.sizes[0]);
    }

    widgetGenerateStore.setSelectedDataTableId(dataTableId);
    const sanitizedOptions = sanitizeWidgetOptions(props.fieldManager.data, widgetType, selectedDataTable);
    await updateWidget({
        widget_id: widgetGenerateState.widgetId,
        data_table_id: dataTableId,
        widget_type: widgetType,
        state: 'INACTIVE',
        options: sanitizedOptions,
    });

    const _config = getWidgetConfig(widgetType);
    if (!_config) return;
    props.fieldManager.updateWidgetConfig(_config);
    props.fieldManager.updateDataTableAndOriginData(selectedDataTable, sanitizedOptions);
};

const handleSelectWidgetName = (widgetName: string) => {
    changeWidgetType(widgetName);
};

const handleClickEditDataTable = () => {
    widgetGenerateStore.setOverlayStep(1);
    state.widgetDefaultValidationModalVisible = false;
};
const handleClickCollapsibleTitle = (collapsedTitle: string) => {
    state.collapsedTitleMap[collapsedTitle] = !state.collapsedTitleMap[collapsedTitle];
};

/* Utils */
const checkDefaultValidation = () => {
    const selectedChartType = widgetGenerateState.selectedWidgetName;
    const selectedDataTable = state.selectedDataTable ?? {};
    if (!selectedDataTable?.options) return;
    switch (selectedChartType) {
    case 'geoMap': {
        const labelsInfo = cloneDeep(selectedDataTable.labels_info ?? {});
        if (!Object.keys(labelsInfo).includes('Region')) {
            state.errorModalCurrentType = 'geoMap';
            state.widgetDefaultValidationModalVisible = true;
        }
        break;
    }
    default:
        if (state.defaultValidationConfig) {
            const labelsInfo = cloneDeep(selectedDataTable.labels_info ?? {});
            const targetCount = Object.keys(labelsInfo).length;
            state.errorModalCurrentType = 'default';
            if (targetCount < state.defaultValidationConfig?.defaultMaxCount) {
                state.widgetDefaultValidationModalVisible = true;
            }
        }
    }
};
const changeWidgetType = (widgetName: string) => {
    const _config = getWidgetConfig(widgetName);
    if (widgetName === widgetGenerateState.selectedWidgetName || !_config) return;

    const sanitizedOptions = sanitizeWidgetOptions(props.fieldManager.data, widgetName, state.selectedDataTable);
    props.fieldManager.updateWidgetConfig(_config);
    props.fieldManager.updateModifiedData(sanitizedOptions);
    widgetGenerateStore.setSelectedWidgetName(widgetName);
    widgetGenerateStore.setSize(_config.meta.sizes[0]);
    checkDefaultValidation();
};

onMounted(() => {
    if (state.selectedDataTable?.operator === DATA_TABLE_OPERATOR.PIVOT && UNSUPPORTED_CHARTS_IN_PIVOT.includes(widgetGenerateState.selectedWidgetName)) {
        changeWidgetType('table');
    } else checkDefaultValidation();
});
</script>

<template>
    <div class="widget-form">
        <div class="basic-field-wrapper gray">
            <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATA_TABLE')"
                           required
            >
                <template #label-extra>
                    <p-button icon-left="ic_edit"
                              size="sm"
                              style-type="tertiary"
                              @click="handleClickEditDataTable"
                    >
                        {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.EDIT_DATA') }}
                    </p-button>
                </template>
                <p-select-dropdown :menu="state.selectableDataTableItems"
                                   :selected="state.selectedDataTableId"
                                   block
                                   @select="handleSelectDataTable"
                >
                    <template #dropdown-button="item">
                        <p-i :name="item.icon"
                             width="1.25rem"
                             height="1.25rem"
                             color="inherit"
                        />
                        <span>{{ item.label }}</span>
                    </template>
                </p-select-dropdown>
            </p-field-group>
        </div>
        <div class="basic-field-wrapper">
            <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.CHART_TYPE')"
                           required
            >
                <p-select-dropdown :menu="state.chartTypeMenuItems"
                                   :selected="widgetGenerateState.selectedWidgetName"
                                   block
                                   @select="handleSelectWidgetName"
                >
                    <template #dropdown-button>
                        <p-i :name="WIDGET_COMPONENT_ICON_MAP[widgetGenerateState.selectedWidgetName]"
                             width="1.25rem"
                             height="1.25rem"
                             color="inherit"
                        />
                        <span>{{ state.chartTypeMenuItems.find((d) => d.name === widgetGenerateState.selectedWidgetName).label }}</span>
                    </template>
                    <template #menu-item--format="{item}">
                        <p-tooltip :contents="item.disabled ? 'When a Pivot DataTable is selected, this chart type is unavailable.': undefined"
                                   position="bottom"
                        >
                            <span>{{ item.label }}</span>
                        </p-tooltip>
                    </template>
                </p-select-dropdown>
            </p-field-group>
        </div>
        <!-- widget header -->
        <widget-header-field :widget-config="state.widgetConfig"
                             :widget-id="widgetGenerateState.widgetId"
                             :field-manager="props.fieldManager"
        />
        <!-- Date Config -->
        <div class="form-group-wrapper"
             :class="{ 'collapsed': state.collapsedTitleMap[FORM_TITLE_MAP.DATE_CONFIG] }"
        >
            <div class="title-wrapper"
                 @click="handleClickCollapsibleTitle(FORM_TITLE_MAP.DATE_CONFIG)"
            >
                <p-i name="ic_chevron-down"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                     class="arrow-button"
                />
                <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_CONFIG') }}</span>
                <new-mark class="new-mark" />
            </div>
            <div class="form-wrapper">
                <template v-for="[fieldName, fieldSchema] in state.widgetDateConfigSchemaMap">
                    <component :is="getWidgetFieldComponent(fieldName)"
                               :key="`${fieldName}-${widgetGenerateState.selectedWidgetName}`"
                               :widget-field-schema="fieldSchema"
                               :widget-config="state.widgetConfig"
                               :widget-id="widgetGenerateState.widgetId"
                               :field-manager="props.fieldManager"
                    />
                </template>
            </div>
        </div>
        <!-- required fields -->
        <div class="form-group-wrapper"
             :class="{ 'collapsed': state.collapsedTitleMap[FORM_TITLE_MAP.REQUIRED_FIELDS] }"
        >
            <div v-if="props.widgetValidationInvalid"
                 class="widget-validation-warning"
            >
                <div class="warning-title">
                    <p-i name="ic_error-filled"
                         width="1.25rem"
                         height="1.25rem"
                         :color="red[400]"
                    />
                    <span>{{ $t('COMMON.WIDGETS.FORM.WIDGET_VALIDATION_WARNING_TITLE') }}</span>
                </div>
                <p class="warning-description">
                    {{ props.widgetValidationInvalidText }}
                </p>
            </div>

            <div class="title-wrapper"
                 @click="handleClickCollapsibleTitle(FORM_TITLE_MAP.REQUIRED_FIELDS)"
            >
                <p-i name="ic_chevron-down"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                     class="arrow-button"
                />
                <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.REQUIRED_FIELDS') }}</span>
            </div>
            <div class="form-wrapper">
                <template v-for="[fieldName, fieldSchema] in state.widgetRequiredFieldSchemaMap">
                    <component :is="getWidgetFieldComponent(fieldName)"
                               :key="`${fieldName}-${widgetGenerateState.selectedWidgetName}`"
                               :widget-field-schema="fieldSchema"
                               :widget-config="state.widgetConfig"
                               :widget-id="widgetGenerateState.widgetId"
                               :field-manager="props.fieldManager"
                    />
                </template>
            </div>
        </div>
        <!-- optional fields -->
        <div v-if="state.widgetOptionalFieldSchemaMap.length"
             class="form-group-wrapper"
             :class="{ 'collapsed': state.collapsedTitleMap[FORM_TITLE_MAP.OPTIONAL_FIELDS] }"
        >
            <div class="title-wrapper"
                 @click="handleClickCollapsibleTitle(FORM_TITLE_MAP.OPTIONAL_FIELDS)"
            >
                <p-i name="ic_chevron-down"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                     class="arrow-button"
                />
                <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.OPTIONAL_FIELDS') }}</span>
            </div>
            <div class="form-wrapper">
                <template v-for="[fieldName, fieldSchema] in state.widgetOptionalFieldSchemaMap">
                    <component :is="getWidgetFieldComponent(fieldName)"
                               :key="`${fieldName}-${widgetGenerateState.selectedWidgetName}`"
                               :widget-field-schema="fieldSchema"
                               :widget-config="state.widgetConfig"
                               :widget-id="widgetGenerateState.widgetId"
                               :field-manager="props.fieldManager"
                    />
                </template>
            </div>
        </div>
        <p-button-modal size="sm"
                        :header-title="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.VALIDATION_MODAL.TITLE')"
                        theme-color="alert"
                        :visible.sync="state.widgetDefaultValidationModalVisible"
                        hide-footer-confirm-button
        >
            <template #body>
                <p v-if="state.errorModalCurrentType === 'geoMap'">
                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.VALIDATION_MODAL.GEO_MAP_DESC') }}
                </p>
                <p v-else>
                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.VALIDATION_MODAL.DESC', {
                        number: state.formErrorModalValue ?? state.defaultValidationConfig?.defaultMaxCount,
                    }) }}
                </p>
                <p-button style-type="tertiary"
                          size="lg"
                          icon-left="ic_edit"
                          class="mt-4"
                          @click="handleClickEditDataTable"
                >
                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.VALIDATION_MODAL.EDIT_DATA') }}
                </p-button>
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="scss" scoped>
.widget-form {
    display: flex;
    flex-direction: column;
    width: 25%;
    min-width: 2rem;
    overflow-y: auto;
    padding-bottom: 2.5rem;
    .basic-field-wrapper {
        &.gray {
            @apply bg-gray-100 border border-gray-150 rounded-md;

            /* custom design-system component - p-field-group */
            :deep(.p-field-group) {
                .title-wrapper {
                    .title {
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                }
            }
        }
        padding: 0.75rem 1.25rem 0 1.25rem;
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    .p-text-input {
        width: 100%;
    }
}

.form-group-wrapper {
    @apply border-t border-gray-200;
    .arrow-button {
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    .form-wrapper {
        @apply flex flex-col gap-4;
        padding: 1rem 1.25rem 1rem 1.25rem;
    }
    &.collapsed {
        .form-wrapper {
            display: none;
        }
        .arrow-button {
            transform: rotate(-90deg);
        }
        .title-wrapper {
            padding: 1rem 0;
        }
    }
    .title-wrapper {
        @apply text-label-lg;
        font-weight: 700;
        padding-top: 1rem;
        vertical-align: middle;
        cursor: pointer;
        .right-part {
            padding-right: 1.5rem;
        }
        &.disabled {
            cursor: default;
            .arrow-button {
                @apply text-gray-700;
                opacity: 0.5;
            }
        }
    }
    .widget-validation-warning {
        @apply w-full bg-red-100 rounded;
        padding: 0.5rem 1rem;
        margin-top: 0.5rem;
        .warning-title {
            @apply flex items-center gap-1 text-label-lg font-bold text-red-500;
            margin-bottom: 0.25rem;
        }
        .warning-description {
            @apply text-paragraph-md text-gray-900;
            padding-left: 1.5rem;
        }
    }
}
</style>
