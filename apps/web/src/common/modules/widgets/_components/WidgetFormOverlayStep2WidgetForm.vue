<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PSelectDropdown, PButton, PI, PTextInput, PTextarea, PButtonModal,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateWidgetUpdateParameters } from '@/schema/dashboard/private-widget/api-verbs/update';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetUpdateParameters } from '@/schema/dashboard/public-widget/api-verbs/update';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { WIDGET_COMPONENT_ICON_MAP } from '@/common/modules/widgets/_constants/widget-components-constant';
import { CONSOLE_WIDGET_CONFIG } from '@/common/modules/widgets/_constants/widget-config-list-constant';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { getWidgetFieldComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type { DataTableAddOptions } from '@/common/modules/widgets/types/widget-model';


const emit = defineEmits<{(e: 'ready-to-preview'): void}>();
const FORM_TITLE_MAP = {
    WIDGET_INFO: 'WIDGET_INFO',
    REQUIRED_FIELDS: 'REQUIRED_FIELDS',
    OPTIONAL_FIELDS: 'OPTIONAL_FIELDS',
};
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const widgetGenerateGetters = widgetGenerateStore.getters;
const state = reactive({
    chartTypeMenuItems: computed<MenuItem[]>(() => Object.values(CONSOLE_WIDGET_CONFIG).map((d) => ({
        name: d.widgetName,
        label: d.meta?.title || d.widgetName,
        icon: WIDGET_COMPONENT_ICON_MAP[d.widgetName ?? ''],
    }))),
    widgetConfig: computed(() => getWidgetConfig(widgetGenerateState.selectedWidgetName)),
    widgetConfigDependencies: computed<{[key:string]: string[]}>(() => state.widgetConfig.dependencies || {}),
    defaultValidationConfig: computed(() => state.widgetConfig.meta?.defaultValidationConfig),
    widgetDefaultValidationModalVisible: false,
    formErrorModalValue: undefined as number|undefined,
    widgetRequiredFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.requiredFieldsSchema)),
    widgetOptionalFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.optionalFieldsSchema)),
    // display
    isPreviewInitiated: false,
    collapsedTitleMap: {
        [FORM_TITLE_MAP.WIDGET_INFO]: false,
        [FORM_TITLE_MAP.REQUIRED_FIELDS]: false,
        [FORM_TITLE_MAP.OPTIONAL_FIELDS]: false,
    },
    selectableDataTableItems: computed(() => widgetGenerateState.dataTables.map((d) => ({
        name: d.data_table_id,
        label: d.name,
        icon: d.data_type === DATA_TABLE_TYPE.TRANSFORMED ? 'ic_transform-data' : 'ic_service_data-sources',
    }))),
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
    errorModalCurrentType: undefined as 'default'|'geoMap'| 'progressCard'|undefined,
});

/* Api */
const updateWidget = async (dataTableId: string) => {
    const isPrivate = widgetGenerateState.widgetId.startsWith('private');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateWidget.update<PrivateWidgetUpdateParameters, PrivateWidgetModel>
        : SpaceConnector.clientV2.dashboard.publicWidget.update<PublicWidgetUpdateParameters, PublicWidgetModel>;
    try {
        await fetcher({
            widget_id: widgetGenerateState.widgetId,
            widget_type: widgetGenerateState.selectedWidgetName,
            data_table_id: dataTableId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Event */
const handleSelectDataTable = async (dataTableId: string) => {
    widgetGenerateStore.setSelectedDataTableId(dataTableId);
    await updateWidget(dataTableId);
    widgetGenerateStore.setWidgetFormValueMap({});
    widgetGenerateStore.setWidgetValidMap({});
    state.isPreviewInitiated = false;
};

const checkDefaultValidation = () => {
    const selectedChartType = widgetGenerateState.selectedWidgetName;
    const selectedDataTable = widgetGenerateGetters.selectedDataTable ?? {};
    if (!selectedDataTable?.options) return;
    const removeDateField = (labelsInfo: Record<string, object>) => {
        const _labelsInfo = cloneDeep(labelsInfo);
        Object.values(DATE_FIELD).forEach((d) => {
            delete _labelsInfo[d];
        });
        return _labelsInfo;
    };
    switch (selectedChartType) {
    case 'geoMap': {
        const groupBySelection = (selectedDataTable?.options as DataTableAddOptions)?.group_by ?? [];
        const filteredSelection = groupBySelection.filter((item) => (item?.name === 'Region'));
        if (filteredSelection.length === 0) {
            state.errorModalCurrentType = 'geoMap';
            state.widgetDefaultValidationModalVisible = true;
        }
        break;
    }
    case 'progressCard': {
        const dataInfo = selectedDataTable.data_info ?? {};
        if (Object.keys(dataInfo).length < 2) {
            state.errorModalCurrentType = 'progressCard';
            state.widgetDefaultValidationModalVisible = true;
        }
        break;
    }
    default:
        if (state.defaultValidationConfig) {
            const labelsInfo = cloneDeep(selectedDataTable.labels_info ?? {});
            const labelsInfoWithoutDateField = removeDateField(labelsInfo);
            const targetCount = Object.keys(labelsInfoWithoutDateField).length;
            if (targetCount < state.defaultValidationConfig?.defaultMaxCount) {
                state.widgetDefaultValidationModalVisible = true;
            }
        }
    }
};

const handleShowErrorModal = (value:number|undefined) => {
    state.widgetDefaultValidationModalVisible = true;
    state.formErrorModalValue = value;
};

const handleSelectWidgetName = (widgetName: string) => {
    widgetGenerateStore.setSelectedWidgetName(widgetName);

    const _config = getWidgetConfig(widgetName);
    widgetGenerateStore.setSize(_config.meta.sizes[0]);
    widgetGenerateStore.setTitle(_config.meta.title);
    widgetGenerateStore.setWidgetFormValueMap({});
    widgetGenerateStore.setWidgetValidMap({});
    checkDefaultValidation();
    state.isPreviewInitiated = false;
};
const handleUpdateWidgetTitle = (title: string) => {
    widgetGenerateStore.setTitle(title);
};
const handleChangeDescription = (description: string) => {
    widgetGenerateStore.setDescription(description);
};
const handleClickEditDataTable = () => {
    widgetGenerateStore.setOverlayStep(1);
    state.widgetDefaultValidationModalVisible = false;
};
const handleClickCollapsibleTitle = (collapsedTitle: string) => {
    state.collapsedTitleMap[collapsedTitle] = !state.collapsedTitleMap[collapsedTitle];
};

const checkFormDependencies = (changedFieldName: string):string[] => state.widgetConfigDependencies[changedFieldName] || [];
const handleUpdateFieldValue = (fieldName: string, value: WidgetFieldValues) => {
    const _valueMap = cloneDeep(widgetGenerateState.widgetFormValueMap);
    _valueMap[fieldName] = value;
    const changedOptions = checkFormDependencies(fieldName);
    const isValueChanged = (JSON.stringify(value) !== JSON.stringify(widgetGenerateState.widgetFormValueMap[fieldName]));
    if (changedOptions.length && isValueChanged) {
        changedOptions.forEach((option) => {
            _valueMap[option] = undefined;
        });
    }
    widgetGenerateStore.setWidgetFormValueMap(_valueMap);
};
const handleUpdateFieldValidation = (fieldName: string, isValid: boolean) => {
    const _validMap = cloneDeep(widgetGenerateState.widgetValidMap);
    _validMap[fieldName] = isValid;
    widgetGenerateStore.setWidgetValidMap(_validMap);
};

// eslint-disable-next-line max-len
const keyGenerator = (name:string, type: 'require'|'option') => `${widgetGenerateGetters.selectedDataTable?.data_table_id}-${type}-${name}-${widgetGenerateState.widgetId}-${widgetGenerateState.selectedWidgetName}-${widgetGenerateState.widgetFormValueMap[name] === undefined}`;

/* Watcher */
watch(() => widgetGenerateState.widgetValidMap, () => {
    if (state.isPreviewInitiated) return;
    const _requiredField = state.widgetRequiredFieldSchemaMap.map(([d]) => d);
    if (_requiredField.every((d) => widgetGenerateState.widgetValidMap[d])) {
        emit('ready-to-preview');
        state.isPreviewInitiated = true;
    }
}, { deep: true });

onMounted(() => {
    checkDefaultValidation();
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
                </p-select-dropdown>
            </p-field-group>
        </div>
        <!-- widget info -->
        <div class="form-group-wrapper"
             :class="{ 'collapsed': state.collapsedTitleMap[FORM_TITLE_MAP.WIDGET_INFO] }"
        >
            <div class="title-wrapper"
                 @click="handleClickCollapsibleTitle(FORM_TITLE_MAP.WIDGET_INFO)"
            >
                <p-i name="ic_chevron-down"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                     class="arrow-button"
                />
                <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.WIDGET_INFO') }}</span>
            </div>
            <div class="form-wrapper no-gap">
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TITLE')"
                               required
                >
                    <p-text-input :value="widgetGenerateState.title"
                                  @update:value="handleUpdateWidgetTitle"
                    />
                </p-field-group>
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DESCRIPTION')">
                    <p-textarea :value="widgetGenerateState.description"
                                @update:value="handleChangeDescription"
                    />
                </p-field-group>
            </div>
        </div>
        <!-- required fields -->
        <div class="form-group-wrapper"
             :class="{ 'collapsed': state.collapsedTitleMap[FORM_TITLE_MAP.REQUIRED_FIELDS] }"
        >
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
                               :key="keyGenerator(fieldName, 'require')"
                               :widget-field-schema="fieldSchema"
                               :data-table="widgetGenerateGetters.selectedDataTable"
                               :all-value-map="widgetGenerateState.widgetFormValueMap"
                               :value="widgetGenerateState.widgetFormValueMap[fieldName]"
                               :is-valid="widgetGenerateState.widgetValidMap[fieldName]"
                               @update:value="handleUpdateFieldValue(fieldName, $event)"
                               @update:is-valid="handleUpdateFieldValidation(fieldName, $event)"
                               @show-error-modal="handleShowErrorModal"
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
                               :key="keyGenerator(fieldName, 'option')"
                               :widget-field-schema="fieldSchema"
                               :data-table="widgetGenerateGetters.selectedDataTable"
                               :all-value-map="widgetGenerateState.widgetFormValueMap"
                               :value="widgetGenerateState.widgetFormValueMap[fieldName]"
                               :is-valid="widgetGenerateState.widgetValidMap[fieldName]"
                               @update:value="handleUpdateFieldValue(fieldName, $event)"
                               @update:is-valid="handleUpdateFieldValidation(fieldName, $event)"
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
                <p v-else-if="state.errorModalCurrentType === 'progressCard'">
                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.VALIDATION_MODAL.PROGRESS_CARD_DESC') }}
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
    .p-select-dropdown {
        width: 100%;
    }
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
        vertical-align: middle;
        cursor: pointer;
        &.no-gap {
            gap: 0;
        }
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
    }
}
</style>
