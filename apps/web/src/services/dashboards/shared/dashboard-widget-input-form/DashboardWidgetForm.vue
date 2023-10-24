<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import {
    useReferenceStore,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-reference-store';
import {
    useWidgetMoreOptions,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-widget-more-options';
import {
    useWidgetTitleInput,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-widget-title-input';
import DashboardWidgetOptionsForm
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardWidgetOptionsForm.vue';
import DashboardWidgetMoreOptions
    from '@/services/dashboards/shared/dashboard-widget-input-form/DashboardWidgetMoreOptions.vue';
import {
    getWidgetOptionSchema,
} from '@/services/dashboards/shared/dashboard-widget-input-form/helpers/schema-helper';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import {
    getVariableKeyFromWidgetSchemaProperty,
} from '@/services/dashboards/shared/helpers/dashboard-variable-schema-helper';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

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
    widgetOptions: {},
    isFocused: false,
    // validation
    isWidgetOptionsValid: undefined,
    isAllValid: computed(() => state.isWidgetOptionsValid && isTitleValid.value),
});


/* title form validation */
const {
    title, resetTitle, updateTitle, isTitleValid, isTitleInvalid, titleInvalidText,
} = useWidgetTitleInput();

/* reference store */
const { referenceStoreState } = useReferenceStore();

/* more options */
const { handleSelectWidgetOptions, handleDeleteProperty } = useWidgetMoreOptions(state);

/* validation */
const handleFormValidate = (isValid) => {
    state.isWidgetOptionsValid = isValid;
};
watch(() => state.isAllValid, (_isAllValid) => {
    widgetFormStore.$patch({ isValid: _isAllValid });
}, { immediate: true });

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
    const formData = { ...state.widgetOptions, [propertyName]: undefined };

    // set schema and form data
    state.widgetOptionsJsonSchema = schema;
    state.widgetOptions = formData;
};


/* states init */
const initSchemaAndFormData = (widgetConfigId: string, widgetKey?: string) => {
    // init widgetInfo - refined widget info
    widgetFormStore.initWidgetForm(widgetKey, widgetConfigId);

    // init title
    updateTitle(widgetFormStore.mergedWidgetInfo?.title);


    // TODO: update initial widget options after updating widget config options_schema
    state.widgetOptions = {};
};
watch([() => props.widgetConfigId, () => props.widgetKey, () => referenceStoreState.loading], ([widgetConfigId, widgetKey, loading]) => {
    // do nothing if still loading
    if (loading || !widgetConfigId) return;

    // reset states
    widgetFormStore.$reset();
    state.widgetOptions = {};
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

        <!-- TODO: update props binding after updating widget config options_schema -->
        <dashboard-widget-options-form :loading="referenceStoreState.loading"
                                       :project-id="dashboardDetailState.projectId"
                                       :variables-schema="dashboardDetailState.variablesSchema"
                                       :options-schema="[]"
                                       :widget-options="state.widgetOptions"
                                       :inherit-options="widgetFormState.inheritOptions"
                                       @delete-property="handleDeleteProperty"
                                       @validate="handleFormValidate"
                                       @toggle-inherit="handleChangeInheritToggle"
                                       @update:widget-options="state.widgetOptions = $event"
        />

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

    .more-option-container {
        z-index: 2;
    }
}
</style>
