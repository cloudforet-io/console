<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup, PSelectDropdown, PButton, PI, PTextInput, PTextarea,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { CONSOLE_WIDGET_CONFIG } from '@/common/modules/widgets/_constants/widget-config-list-constant';
import { getWidgetFieldComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';


const FORM_TITLE_MAP = {
    WIDGET_INFO: 'WIDGET_INFO',
    REQUIRED_FIELDS: 'REQUIRED_FIELDS',
    OPTIONAL_FIELDS: 'OPTIONAL_FIELDS',
};
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const state = reactive({
    chartTypeMenuItems: computed<MenuItem[]>(() => Object.values(CONSOLE_WIDGET_CONFIG).map((d) => ({
        name: d.widgetName,
        label: d.meta?.title || d.widgetName,
    }))),
    widgetConfig: computed(() => getWidgetConfig(widgetGenerateState.selectedWidgetName)),
    widgetRequiredFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.requiredFieldsSchema)),
    widgetOptionalFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.optionalFieldsSchema)),
    fieldValueMap: {
        // [fieldName]: any
    },
    fieldValidationMap: {
        // [fieldName]: boolean
    },
    // display
    collapsedTitleMap: {
        [FORM_TITLE_MAP.WIDGET_INFO]: false,
        [FORM_TITLE_MAP.REQUIRED_FIELDS]: false,
        [FORM_TITLE_MAP.OPTIONAL_FIELDS]: false,
    },
});

/* Util */

/* Event */
const handleSelectWidgetName = (widgetName: string) => {
    widgetGenerateStore.setSelectedWidgetName(widgetName);
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

watch(() => widgetGenerateState.selectedWidgetName, (widgetName) => {
    widgetGenerateStore.initWidgetForm(widgetName);
}, { immediate: true });
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
                <p-select-dropdown :options="[]" />
            </p-field-group>
        </div>
        <div class="basic-field-wrapper">
            <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.CHART_TYPE')"
                           required
            >
                <p-select-dropdown :menu="state.chartTypeMenuItems"
                                   :selected="widgetGenerateState.selectedWidgetName"
                                   @select="handleSelectWidgetName"
                />
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
        <!-- data mapping -->
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
                               :key="`required-field-${fieldName}`"
                               :widget-field-schema="fieldSchema"
                               :required="true"
                    />
                </template>
            </div>
        </div>
        <!-- chart options -->
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
                               :key="`required-field-${fieldName}`"
                               :widget-field-schema="fieldSchema"
                               :required="true"
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
