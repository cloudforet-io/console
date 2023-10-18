<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PDataLoader, PTextButton, PJsonSchemaForm, PToggleButton, PIconButton,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { isEmpty, isEqual } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import { getDefaultWidgetFormData } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/helper';
import {
    getReferenceHandler,
} from '@/services/dashboards/shared/dashboard-widget-input-form/helpers/reference-handler-helper';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type { InheritOptions } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetFilterSchemaPropertyName } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';
import { getWidgetInheritOptionsErrorMap } from '@/services/dashboards/widgets/_helpers/widget-validation-helper';

const props = defineProps<{
    loading?: boolean;
    projectId?: string;
    variablesSchema?: DashboardVariablesSchema;
    schema: JsonSchema;
    formData: Record<string, any>;
}>();

const emit = defineEmits<{(e: 'delete-property', propertyName: string): void;
    (e: 'toggle-inherit', propertyName: string, isInherit: boolean): void;
    (e: 'init-schema-form'): void;
    (e: 'validate', isValid: boolean): void;
    (e: 'update:form-data', formData: Record<string, any>): void;
}>();
const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;

const state = reactive({
    fixedProperties: computed<string[]>(() => {
        const fixedProperties = widgetFormStore.widgetConfig?.options_schema?.fixed_properties ?? [];
        if (props.projectId) {
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
            props.variablesSchema,
        );
        const errorMessageMap: Record<string, string> = {};
        Object.keys(errorMap).forEach((propertyName) => {
            errorMessageMap[propertyName] = errorText;
        });
        return errorMessageMap;
    }),
    //
    defaultWidgetFormData: computed(() => (widgetFormState.widgetConfigId ? getDefaultWidgetFormData(widgetFormState.widgetConfigId) : {})),
    isFormDataChanged: computed(() => !isEqual(props.formData, state.defaultWidgetFormData)),
});

const referenceHandler = getReferenceHandler();

/* utils */
const isSelected = (selectedItem: SelectDropdownMenuItem): boolean => {
    if (Array.isArray(selectedItem)) return !!selectedItem.length;
    return selectedItem && !isEmpty(selectedItem);
};
const isInheritDisabled = (propertyName: string): boolean => {
    const inputDisabled = !!props.schema.properties?.[propertyName]?.disabled;
    const nonInheritable = !!widgetFormStore.widgetConfig?.options_schema?.non_inheritable_properties?.includes(propertyName);
    return inputDisabled || nonInheritable;
};

const handleUpdateFormData = (formData: Record<string, any>) => {
    emit('update:form-data', formData);
    widgetFormStore.updateInheritOptionsAndWidgetOptionsByFormData(formData);
};
</script>

<template>
    <p-data-loader :loading="props.loading"
                   class="widget-options-form-wrapper"
    >
        <p-text-button icon-left="ic_refresh"
                       style-type="highlight"
                       :disabled="!state.isFormDataChanged"
                       class="return-to-initial-settings-button"
                       @click="emit('init-schema-form')"
        >
            {{ $t('DASHBOARDS.FORM.RETURN_TO_INITIAL_SETTINGS') }}
        </p-text-button>
        <p-json-schema-form v-if="props.schema.properties"
                            :key="`${widgetFormStore.widgetConfigId}-${widgetFormStore.widgetKey}`"
                            :schema="props.schema"
                            :form-data="props.formData"
                            :custom-error-map="state.inheritOptionsErrorMessageMap"
                            :validation-mode="widgetFormStore.widgetKey ? 'all' : 'input'"
                            use-fixed-menu-style
                            uniform-width
                            :language="store.state.user.language"
                            :reference-handler="referenceHandler"
                            class="widget-options-form"
                            @validate="emit('validate', $event)"
                            @update:form-data="handleUpdateFormData"
        >
            <template #label-extra="{ propertyName }">
                <div class="inherit-toggle-button-wrapper">
                    <span class="text"
                          :class="{inherit: state.inheritableProperties.includes(propertyName)}"
                    >{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.INHERIT') }}</span>
                    <p-toggle-button :value="state.inheritableProperties.includes(propertyName)"
                                     :disabled="isInheritDisabled(propertyName)"
                                     @change-toggle="emit('toggle-inherit', propertyName, $event)"
                    />
                </div>
            </template>
            <template #input-extra="{ propertyName }">
                <p-icon-button v-if="!state.fixedProperties.includes(propertyName)"
                               class="delete-button"
                               shape="square"
                               style-type="negative-secondary"
                               name="ic_delete"
                               @click="emit('delete-property', propertyName)"
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
</template>

<style scoped lang="postcss">
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
}
</style>
