<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PFieldGroup, PSelectDropdown, PButton, PI, PTextInput, PTextarea,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateWidgetUpdateParameters } from '@/schema/dashboard/private-widget/api-verbs/update';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetUpdateParameters } from '@/schema/dashboard/public-widget/api-verbs/update';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';

import { WIDGET_COMPONENT_ICON_MAP } from '@/common/modules/widgets/_constants/widget-components-constant';
import { CONSOLE_WIDGET_CONFIG } from '@/common/modules/widgets/_constants/widget-config-list-constant';
import { getWidgetFieldComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { WidgetFieldValues } from '@/common/modules/widgets/types/widget-field-value-type';


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
        icon: WIDGET_COMPONENT_ICON_MAP[d.widgetName],
    }))),
    widgetConfig: computed(() => getWidgetConfig(widgetGenerateState.selectedWidgetName)),
    widgetRequiredFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.requiredFieldsSchema)),
    widgetOptionalFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.optionalFieldsSchema)),
    // display
    collapsedTitleMap: {
        [FORM_TITLE_MAP.WIDGET_INFO]: false,
        [FORM_TITLE_MAP.REQUIRED_FIELDS]: false,
        [FORM_TITLE_MAP.OPTIONAL_FIELDS]: false,
    },
    selectableDataTableItems: computed(() => widgetGenerateState.dataTables.map((d) => ({
        name: d.data_table_id,
        label: d.name,
    }))),
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
});

/* Api */
const updateWidget = async (dataTableId: string) => {
    const isPrivate = widgetGenerateState.widgetId.startsWith('private');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateWidget.update<PrivateWidgetUpdateParameters, PrivateWidgetModel>
        : SpaceConnector.clientV2.dashboard.publicWidget.update<PublicWidgetUpdateParameters, PublicWidgetModel>;
    if (widgetGenerateState.overlayStep === 1) {
        await fetcher({
            widget_id: widgetGenerateState.widgetId,
            widget_type: widgetGenerateState.selectedWidgetName,
            data_table_id: dataTableId,
        });
        widgetGenerateStore.setOverlayStep(2);
    }
};

/* Event */
const handleSelectDataTable = (dataTableId: string) => {
    widgetGenerateStore.setSelectedDataTableId(dataTableId);
    updateWidget(dataTableId);
};
const handleSelectWidgetName = (widgetName: string) => {
    widgetGenerateStore.setSelectedWidgetName(widgetName);
    widgetGenerateStore.setWidgetValueMap({});
    widgetGenerateStore.setWidgetValidMap({});
};
const handleUpdateWidgetTitle = (title: string) => {
    widgetGenerateStore.setTitle(title);
};
const handleClickEditDataTable = () => {
    widgetGenerateStore.setOverlayStep(1);
};
const handleClickCollapsibleTitle = (collapsedTitle: string) => {
    state.collapsedTitleMap[collapsedTitle] = !state.collapsedTitleMap[collapsedTitle];
};
const handleUpdateFieldValue = (fieldName: string, value: WidgetFieldValues) => {
    const _valueMap = cloneDeep(widgetGenerateState.widgetValueMap);
    _valueMap[fieldName] = value;
    widgetGenerateStore.setWidgetValueMap(_valueMap);
};
const handleUpdateFieldValidation = (fieldName: string, isValid: boolean) => {
    const _validMap = cloneDeep(widgetGenerateState.widgetValidMap);
    _validMap[fieldName] = isValid;
    widgetGenerateStore.setWidgetValidMap(_validMap);
};

// eslint-disable-next-line max-len
const keyGenerator = (name:string, type: 'require'|'option') => `${widgetGenerateGetters.selectedDataTable?.data_table_id}-${type}-${name}-${widgetGenerateState.widgetId}-${widgetGenerateState.selectedWidgetName}`;
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
                />
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
            <div class="form-wrapper">
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TITLE')"
                               required
                >
                    <p-text-input :value="widgetGenerateState.title"
                                  @update:value="handleUpdateWidgetTitle"
                    />
                </p-field-group>
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DESCRIPTION')">
                    <p-textarea />
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
                               :value="widgetGenerateState.widgetValueMap[fieldName]"
                               :is-valid="widgetGenerateState.widgetValidMap[fieldName]"
                               @update:value="handleUpdateFieldValue(fieldName, $event)"
                               @update:is-valid="handleUpdateFieldValidation(fieldName, $event)"
                    />
                </template>
            </div>
        </div>
        <!-- optional fields -->
        <div class="form-group-wrapper"
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
                               :value="widgetGenerateState.widgetValueMap[fieldName]"
                               :is-valid="widgetGenerateState.widgetValidMap[fieldName]"
                               @update:value="handleUpdateFieldValue(fieldName, $event)"
                               @update:is-valid="handleUpdateFieldValidation(fieldName, $event)"
                    />
                </template>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.widget-form {
    display: flex;
    flex-direction: column;
    width: 25%;
    min-width: 2rem;
    overflow-y: auto;
    .basic-field-wrapper {
        &.gray {
            @apply bg-gray-150 rounded-md;
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
        padding: 1rem 1.25rem 0 1.25rem;
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
