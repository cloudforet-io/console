<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput, PJsonSchemaForm, PToggleButton, PDataLoader, PIconButton, PTextButton,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import {
    isEmpty, isEqual,
} from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import {
    getDefaultWidgetFormData,
} from '@/services/dashboards/dashboard-create/modules/dashboard-templates/helper';
import {
    useReferenceStore,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-reference-store';
import {
    useWidgetMoreOptions,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-widget-more-options';
import {
    useWidgetTitleInput,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-widget-title-input';
import DashboardWidgetMoreOptions
    from '@/services/dashboards/shared/dashboard-widget-input-form/DashboardWidgetMoreOptions.vue';
import { getInitialFormData } from '@/services/dashboards/shared/dashboard-widget-input-form/helpers/form-data-helper';
import {
    getReferenceHandler,
} from '@/services/dashboards/shared/dashboard-widget-input-form/helpers/reference-handler-helper';
import {
    getRefinedWidgetOptionsSchema, getWidgetOptionSchema,
} from '@/services/dashboards/shared/dashboard-widget-input-form/helpers/schema-helper';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import {
    getVariableKeyFromWidgetSchemaProperty,
} from '@/services/dashboards/shared/helpers/dashboard-variable-schema-helper';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type {
    InheritOptions,
} from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterSchemaPropertyName,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';
import {
    getWidgetInheritOptionsErrorMap,
} from '@/services/dashboards/widgets/_helpers/widget-validation-helper';


interface Props {
    widgetConfigId?: string;
    widgetKey?: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;
const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;

const state = reactive({
    widgetOptionsJsonSchema: {} as JsonSchema,
    schemaFormData: {},
    isInitialized: computed(() => !isEmpty(state.widgetOptionsJsonSchema)),
    fixedProperties: computed<string[]>(() => {
        const fixedProperties = widgetFormStore.widgetConfig?.options_schema?.fixed_properties ?? [];
        if (dashboardDetailState.projectId) {
            fixedProperties.push(getWidgetFilterSchemaPropertyName('project'));
        }
        return fixedProperties;
    }),
    inheritableProperties: computed(() => Object.entries<InheritOptions[string]>(widgetFormState.inheritOptions ?? {})
        .filter(([, inheritOption]) => !!inheritOption.enabled)
        .map(([propertyName]) => propertyName)),
    inheritOptionsErrorMessageMap: computed<Record<string, string>>(() => {
        const errorText = i18n.t('DASHBOARDS.WIDGET.VALIDATION_PROPERTY_NOT_EXIST') as string;
        const errorMap = getWidgetInheritOptionsErrorMap(
            widgetFormState.schemaProperties,
            widgetFormStore.updatedWidgetInfo?.inherit_options ?? {}, // use updated inherit options not to show error message when updating widget info
            widgetFormStore.widgetConfig?.options_schema?.schema,
            dashboardDetailState.variablesSchema,
        );
        const errorMessageMap: Record<string, string> = {};
        Object.keys(errorMap).forEach((propertyName) => {
            errorMessageMap[propertyName] = errorText;
        });
        return errorMessageMap;
    }),
    isFocused: false,
    //
    defaultWidgetFormData: computed(() => (props.widgetConfigId ? getDefaultWidgetFormData(props.widgetConfigId) : {})),
    isFormDataChanged: computed(() => !isEqual(state.schemaFormData, state.defaultWidgetFormData)),
    // validation
    isSchemaFormValid: undefined,
    isAllValid: computed(() => state.isSchemaFormValid && isTitleValid.value),
});

const referenceHandler = getReferenceHandler();

/* title form validation */
const {
    title, resetTitle, updateTitle, isTitleValid, isTitleInvalid, titleInvalidText,
} = useWidgetTitleInput();

/* reference store */
const { referenceStoreState } = useReferenceStore();

/* more options */
const { handleSelectWidgetOptions, handleDeleteProperty } = useWidgetMoreOptions(state);

/* utils */
const isSelected = (selectedItem: SelectDropdownMenuItem): boolean => {
    if (Array.isArray(selectedItem)) return !!selectedItem.length;
    return selectedItem && !isEmpty(selectedItem);
};
const isInheritDisabled = (propertyName: string): boolean => {
    const inputDisabled = !!state.widgetOptionsJsonSchema.properties?.[propertyName]?.disabled;
    const nonInheritable = !!widgetFormStore.widgetConfig?.options_schema?.non_inheritable_properties?.includes(propertyName);
    return inputDisabled || nonInheritable;
};

/* reset */
const handleReturnToInitialSettings = () => {
    if (!widgetFormState.widgetConfigId) return;
    initSchemaAndFormData(widgetFormState.widgetConfigId);
};

/* inherit */
const handleChangeInheritToggle = (propertyName: string, isInherit: boolean) => {
    widgetFormStore.$patch((_state) => {
        _state.inheritOptions = {
            ..._state.inheritOptions,
            [propertyName]: {
                enabled: isInherit,
                variable_info: isInherit ? { key: getVariableKeyFromWidgetSchemaProperty(propertyName) } : undefined,
            },
        };
    });

    // update widget option schema and form data
    const originPropertySchema = widgetFormStore.widgetConfig?.options_schema?.schema?.properties?.[propertyName] ?? {};
    const newPropertySchema = getWidgetOptionSchema(propertyName, originPropertySchema, dashboardDetailState.variablesSchema, referenceStoreState, isInherit, dashboardDetailState.projectId);
    const schema = {
        ...state.widgetOptionsJsonSchema,
        properties: {
            ...state.widgetOptionsJsonSchema.properties,
            [propertyName]: newPropertySchema,
        },
    };
    const formData = { ...state.schemaFormData, [propertyName]: undefined };

    // set schema and form data
    state.widgetOptionsJsonSchema = schema;
    state.schemaFormData = formData;
};
const handleUpdateFormData = (formData: Record<string, any>) => {
    state.schemaFormData = formData;
    widgetFormStore.updateInheritOptionsAndWidgetOptionsByFormData(formData);
};

/* validation */
const handleFormValidate = (isValid) => {
    state.isSchemaFormValid = isValid;
};
watch(() => state.isAllValid, (_isAllValid) => {
    widgetFormStore.$patch({ isValid: _isAllValid });
}, { immediate: true });

/* states init */
const initSchemaAndFormData = (widgetConfigId: string, widgetKey?: string) => {
    // init widgetInfo - refined widget info
    widgetFormStore.initWidgetForm(widgetKey, widgetConfigId);

    // init title
    updateTitle(widgetFormStore.mergedWidgetInfo?.title);

    // get schema and form data
    const schema = getRefinedWidgetOptionsSchema(
        referenceStoreState,
        widgetFormStore.widgetConfig?.options_schema ?? { schema: {} },
        dashboardDetailState.variablesSchema,
        widgetFormState.inheritOptions ?? {},
        widgetFormState.schemaProperties ?? [],
        dashboardDetailState.projectId,
    );
    const formData = getInitialFormData(widgetFormStore.mergedWidgetInfo, dashboardDetailState.variablesSchema);

    // set schema and form data
    // CAUTION: those two states must be set at the same time not to cause re-rendering of p-json-schema-form
    state.widgetOptionsJsonSchema = schema;
    state.schemaFormData = formData;
};
watch([() => props.widgetConfigId, () => props.widgetKey, () => referenceStoreState.loading], ([widgetConfigId, widgetKey, loading]) => {
    // do nothing if still loading
    if (loading || !widgetConfigId) return;

    // reset states
    widgetFormStore.$reset();
    state.widgetOptionsJsonSchema = {};
    state.schemaFormData = {};
    resetTitle();

    initSchemaAndFormData(widgetConfigId, widgetKey);

    // set focus on text input
    state.isFocused = true;
}, { immediate: true });

</script>

<template>
    <div class="dashboard-widget-input-form">
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_NAME')"
                       :invalid="isTitleInvalid"
                       :invalid-text="titleInvalidText"
                       class="name-field"
                       required
        >
            <p-text-input :value="title"
                          :is-focused.sync="state.isFocused"
                          :invalid="isTitleInvalid"
                          :placeholder="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.NAME_PLACEHOLDER')"
                          class="input"
                          @update:value="updateTitle"
            />
        </p-field-group>
        <div v-if="widgetFormStore.widgetConfig?.description?.translation_id"
             class="description-text"
        >
            {{ $t(widgetFormStore.widgetConfig.description.translation_id) }}
        </div>
        <p-data-loader :loading="referenceStoreState.loading || !state.isInitialized"
                       class="widget-options-form-wrapper"
        >
            <p-text-button icon-left="ic_refresh"
                           style-type="highlight"
                           :disabled="!state.isFormDataChanged"
                           class="return-to-initial-settings-button"
                           @click="handleReturnToInitialSettings"
            >
                {{ $t('DASHBOARDS.FORM.RETURN_TO_INITIAL_SETTINGS') }}
            </p-text-button>
            <p-json-schema-form v-if="state.widgetOptionsJsonSchema.properties"
                                :key="`${widgetFormStore.widgetConfigId}-${widgetFormStore.widgetKey}`"
                                :schema="state.widgetOptionsJsonSchema"
                                :form-data="state.schemaFormData"
                                :custom-error-map="state.inheritOptionsErrorMessageMap"
                                :validation-mode="widgetKey ? 'all' : 'input'"
                                use-fixed-menu-style
                                uniform-width
                                :language="store.state.user.language"
                                :reference-handler="referenceHandler"
                                class="widget-options-form"
                                @validate="handleFormValidate"
                                @update:form-data="handleUpdateFormData"
            >
                <template #label-extra="{ propertyName }">
                    <div class="inherit-toggle-button-wrapper">
                        <span class="text"
                              :class="{inherit: state.inheritableProperties.includes(propertyName)}"
                        >{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.INHERIT') }}</span>
                        <p-toggle-button :value="state.inheritableProperties.includes(propertyName)"
                                         :disabled="isInheritDisabled(propertyName)"
                                         @change-toggle="handleChangeInheritToggle(propertyName, $event)"
                        />
                    </div>
                </template>
                <template #input-extra="{ propertyName }">
                    <p-icon-button v-if="!state.fixedProperties.includes(propertyName)"
                                   class="delete-button"
                                   shape="square"
                                   style-type="negative-secondary"
                                   name="ic_delete"
                                   @click="handleDeleteProperty(propertyName)"
                    />
                </template>
                <template #dropdown-extra="{ propertyName, selectedItem }">
                    <div v-if="isSelected(selectedItem) && state.inheritableProperties.includes(propertyName)"
                         class="dropdown-inner"
                    >
                        <span class="item-label">{{ selectedItem.label }}</span>
                        <span class="suffix-text">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.FROM_DASHBOARD') }}</span>
                    </div>
                </template>
            </p-json-schema-form>
        </p-data-loader>
        <dashboard-widget-more-options class="more-option-container"
                                       :widget-config-id="widgetConfigId"
                                       :selected-properties="widgetFormState.schemaProperties"
                                       @update:selected-properties="handleSelectWidgetOptions"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-widget-input-form {
    @apply flex flex-col overflow-hidden;
    height: 100%;
    gap: 1rem;
    overflow-y: auto;

    /* custom design-system component - p-field-group */

    /* custom design-system component - p-field-title */
    :deep(.name-field) {
        &.p-field-group {
            margin: 0;
            .p-field-title {
                .title-wrapper .title {
                    @apply text-label-md;
                    display: flex;
                    align-items: center;
                }
            }
            .input {
                width: 100%;
            }
        }
    }
    .description-text {
        @apply bg-gray-100 text-gray-600 rounded-md;
        font-size: 0.875rem;
        font-weight: 400;
        padding: 0.75rem;
    }

    .widget-options-form-wrapper {
        height: 100%;
        min-height: 15rem;
        .return-to-initial-settings-button {
            float: right;
            padding: 1rem 0;
        }
        .delete-button {
            margin-left: 0.25rem;
        }
    }

    .widget-options-form {
        width: 100%;
    }

    /* custom design-system component - p-json-schema-form */
    :deep(.widget-options-form) {
        /* custom design-system component - p-field-group */

        /* custom design-system component - p-field-title */
        .p-field-group {
            .form-label {
                width: 100%;
                > .title-wrapper .title {
                    @apply text-label-md;
                    display: flex;
                    width: 100%;
                    justify-content: space-between;
                    align-items: center;
                }
            }

            /* HACK: remove this when p-select-dropdown is fixed */
            .input-wrapper {
                width: calc(100% - 2.5rem);
            }
        }

        /*
        custom design-system component - p-select-dropdown
        HACK: remove this when p-select-dropdown is fixed
         */
        .p-select-dropdown .dropdown-button {
            > .text {
                @apply truncate;
                max-width: calc(100% - 1.5rem);
            }
        }
    }
    .dropdown-inner {
        display: flex;
        .item-label {
            @apply truncate;
            flex-shrink: 0;
        }
        .suffix-text {
            @apply truncate text-gray-500;
            padding-left: 0.25rem;
        }
    }
    .inherit-toggle-button-wrapper {
        @apply inline-flex bg-gray-100 rounded;
        line-height: 1.25;
        padding: 0.25rem 0.5rem;
        pointer-events: initial;
        .text {
            @apply text-gray-300;
            font-weight: 400;
            font-size: 0.75rem;
            letter-spacing: 0.02em;
            padding-right: 0.375rem;
            &.inherit {
                @apply text-gray-600;
            }
        }
    }

    .more-option-container {
        z-index: 2;
    }
}
</style>
