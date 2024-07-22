<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { cloneDeep } from 'lodash';

import {
    PFieldGroup, PSelectDropdown, PButton, PI, PTextInput, PTextarea, PButtonModal, PToggleButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { WIDGET_COMPONENT_ICON_MAP } from '@/common/modules/widgets/_constants/widget-components-constant';
import { CONSOLE_WIDGET_CONFIG } from '@/common/modules/widgets/_constants/widget-config-list-constant';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { getWidgetFieldComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';
import type { DataTableAddOptions } from '@/common/modules/widgets/types/widget-model';

import { red } from '@/styles/colors';


const FORM_TITLE_MAP = {
    WIDGET_HEADER: 'WIDGET_HEADER',
    REQUIRED_FIELDS: 'REQUIRED_FIELDS',
    OPTIONAL_FIELDS: 'OPTIONAL_FIELDS',
};

interface Props {
    widgetValidationInvalid?: boolean;
    widgetValidationInvalidText?: string|TranslateResult;
}

const props = defineProps<Props>();

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
    enableWidgetHeader: false,
    isWidgetTitleValid: computed<boolean>(() => {
        if (widgetGenerateState.widgetFormValueMap.title === undefined) return true;
        return !!widgetGenerateState.widgetFormValueMap.title?.trim();
    }),
    titleInvalidText: computed(() => {
        if (!widgetGenerateState.widgetFormValueMap.title?.trim()?.length) {
            return i18n.t('COMMON.WIDGETS.WIDGET_TITLE_REQUIRED');
        }
        return undefined;
    }),
    // display
    collapsedTitleMap: {
        [FORM_TITLE_MAP.WIDGET_HEADER]: false,
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


/* Event */
const handleSelectDataTable = async (dataTableId: string) => {
    widgetGenerateStore.setSelectedDataTableId(dataTableId);
    await widgetGenerateStore.updateWidget({
        data_table_id: dataTableId,
        state: 'INACTIVE',
    });
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
    if (widgetName === widgetGenerateState.selectedWidgetName) return;
    widgetGenerateStore.setSelectedWidgetName(widgetName);

    const _config = getWidgetConfig(widgetName);
    widgetGenerateStore.setSize(_config.meta.sizes[0]);
    widgetGenerateStore.setWidgetFormValueMap({
        title: _config?.meta.title,
    });
    widgetGenerateStore.setWidgetValidMap({
        title: true,
    });
    checkDefaultValidation();
};
const handleUpdateWidgetTitle = (title?: string) => {
    widgetGenerateStore.setWidgetFormValueMap({
        ...widgetGenerateState.widgetFormValueMap,
        title: title?.trim(),
    });
};
const handleChangeDescription = (description?: string) => {
    widgetGenerateStore.setWidgetFormValueMap({
        ...widgetGenerateState.widgetFormValueMap,
        description,
    });
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
const handleToggleWidgetHeader = (value: boolean) => {
    state.enableWidgetHeader = value;
    state.collapsedTitleMap[FORM_TITLE_MAP.WIDGET_HEADER] = !value;
    const _valueMap = cloneDeep(widgetGenerateState.widgetFormValueMap);
    const _validMap = cloneDeep(widgetGenerateState.widgetValidMap);
    let _title: string | undefined;
    let _description: string | undefined;
    if (value) {
        _title = state.widgetConfig.meta?.title || '';
        _description = '';
    } else {
        _title = undefined;
        _description = undefined;
    }
    widgetGenerateStore.setWidgetFormValueMap({
        ..._valueMap,
        title: _title,
        description: _description,
    });
    widgetGenerateStore.setWidgetValidMap({
        ..._validMap,
        title: true,
        description: true,
    });
};

watch(() => widgetGenerateState.widgetFormValueMap.title, (title) => {
    if (title !== undefined) {
        state.enableWidgetHeader = true;
        state.collapsedTitleMap[FORM_TITLE_MAP.WIDGET_HEADER] = false;
    } else {
        state.enableWidgetHeader = false;
        state.collapsedTitleMap[FORM_TITLE_MAP.WIDGET_HEADER] = true;
    }
}, { immediate: true });
watch(() => state.isWidgetTitleValid, (isValid) => {
    const _validMap = cloneDeep(widgetGenerateState.widgetValidMap);
    const _valueMap = cloneDeep(widgetGenerateState.widgetFormValueMap);
    _validMap.title = isValid;
    _valueMap.title = state.enableWidgetHeader ? _valueMap.title : undefined;
    widgetGenerateStore.setWidgetValidMap(_validMap);
    widgetGenerateStore.setWidgetFormValueMap(_valueMap);
}, { immediate: true });
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
             :class="{ 'collapsed': state.collapsedTitleMap[FORM_TITLE_MAP.WIDGET_HEADER] }"
        >
            <div class="title-wrapper flex justify-between align-middle"
                 :class="{ 'disabled': !state.enableWidgetHeader }"
                 @click="state.enableWidgetHeader ? handleClickCollapsibleTitle(FORM_TITLE_MAP.WIDGET_HEADER) : undefined"
            >
                <div class="left-part">
                    <p-i name="ic_chevron-down"
                         width="1.25rem"
                         height="1.25rem"
                         color="inherit transparent"
                         class="arrow-button"
                    />
                    <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.WIDGET_HEADER') }}</span>
                </div>
                <div class="right-part flex">
                    <p-toggle-button :value="state.enableWidgetHeader"
                                     @update:value="handleToggleWidgetHeader"
                    />
                </div>
            </div>
            <div class="form-wrapper no-gap">
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TITLE')"
                               :invalid-text="state.titleInvalidText"
                               :invalid="!widgetGenerateState.widgetFormValueMap.title"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="widgetGenerateState.widgetFormValueMap.title"
                                      :invalid="invalid"
                                      @update:value="handleUpdateWidgetTitle"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DESCRIPTION')">
                    <p-textarea :value="widgetGenerateState.widgetFormValueMap.description"
                                @update:value="handleChangeDescription"
                    />
                </p-field-group>
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
                               :key="`${fieldName}-${widgetGenerateState.selectedWidgetName}`"
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
