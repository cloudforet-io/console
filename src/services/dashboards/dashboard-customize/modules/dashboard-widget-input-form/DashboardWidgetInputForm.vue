<template>
    <div class="dashboard-widget-input-form">
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_NAME')"
                       :invalid="isTitleInvalid"
                       :invalid-text="titleInvalidText"
                       required
        >
            <p-text-input :value="title"
                          :is-focused.sync="isFocused"
                          :invalid="isTitleInvalid"
                          :placeholder="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.NAME_PLACEHOLDER')"
                          class="input"
                          @update:value="updateTitle"
            />
        </p-field-group>
        <div v-if="widgetConfig?.description?.translation_id"
             class="description-text"
        >
            {{ $t(widgetConfig.description.translation_id) }}
        </div>
        <p-data-loader :loading="referenceStoreState.loading"
                       class="widget-options-form-wrapper"
        >
            <p-json-schema-form v-if="widgetOptionsJsonSchema.properties"
                                :schema="widgetOptionsJsonSchema"
                                :form-data.sync="schemaFormData"
                                :custom-error-map="inheritOptionsErrorMap"
                                :validation-mode="widgetKey ? 'all' : 'input'"
                                use-fixed-menu-style
                                :reference-handler="referenceHandler"
                                class="widget-options-form"
                                @validate="handleFormValidate"
            >
                <template #label-extra="{ propertyName }">
                    <div class="inherit-toggle-button">
                        <span class="text"
                              :class="{inherit: inheritableProperties.includes(propertyName)}"
                        >{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.INHERIT') }}</span>
                        <p-toggle-button :value="inheritableProperties.includes(propertyName)"
                                         :disabled="widgetOptionsJsonSchema.properties?.[propertyName]?.disabled"
                                         @change="handleChangeInheritToggle(propertyName, $event)"
                        />
                    </div>
                </template>
                <template #dropdown-extra="{ propertyName, selectedItem }">
                    <div v-if="isSelected(selectedItem) && inheritableProperties.includes(propertyName)">
                        <span>{{ selectedItem.label }}</span>
                        <span class="suffix-text">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.FROM_DASHBOARD') }}</span>
                    </div>
                </template>
            </p-json-schema-form>
        </p-data-loader>
        <dashboard-widget-more-options class="more-option-container"
                                       :widget-config-id="widgetConfigId"
                                       :selected-properties="widgetFormState.defaultSchemaProperties"
                                       @update:selected-properties="handleUpdateDefaultSchemaProperties"
        />
    </div>
</template>
<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput, PJsonSchemaForm, PToggleButton, PDataLoader,
} from '@spaceone/design-system';
import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { cloneDeep, isEmpty, union } from 'lodash';

import {
    useReferenceStore,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/composables/use-reference-store';
import {
    useWidgetTitleInput,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/composables/use-widget-title-input';
import DashboardWidgetMoreOptions
    from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/DashboardWidgetMoreOptions.vue';
import {
    getReferenceHandler,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/reference-handler-helpers';
import {
    getRefinedWidgetInheritOptions,
    getRefinedWidgetOptionsSchema, getWidgetOptionSchema,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/schema-helpers';
import { useWidgetFormStore } from '@/services/dashboards/dashboard-customize/stores/widget-form';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import type {
    DashboardLayoutWidgetInfo, WidgetConfig,
    WidgetFiltersMap,
    WidgetOptionsSchema,
    InheritOptions,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';
import type {
    InheritOptionsErrorMap,
} from '@/services/dashboards/widgets/_helpers/widget-validation-helper';
import {
    getWidgetInheritOptionsErrorMap,
} from '@/services/dashboards/widgets/_helpers/widget-validation-helper';


interface Props {
    widgetConfigId?: string;
    widgetKey?: string;
}

export default defineComponent<Props>({
    name: 'DashboardWidgetInputForm',
    components: {
        DashboardWidgetMoreOptions,
        PTextInput,
        PFieldGroup,
        PJsonSchemaForm,
        PToggleButton,
        PDataLoader,
    },
    props: {
        widgetConfigId: {
            type: String,
            default: undefined,
        },
        widgetKey: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const dashboardDetailStore = useDashboardDetailInfoStore();
        const dashboardDetailState = dashboardDetailStore.state;
        const widgetFormStore = useWidgetFormStore();
        const widgetFormState = widgetFormStore.state;

        const state = reactive({
            widgetConfig: computed<WidgetConfig|undefined>(() => (props.widgetConfigId ? getWidgetConfig(props.widgetConfigId) : undefined)),
            widgetOptionsJsonSchema: {} as JsonSchema,
            schemaFormData: {},
            // inherit
            requiredProperties: computed<string[]>(() => state.widgetConfig.options_schema?.schema.required ?? []),
            inheritableProperties: computed(() => Object.entries<InheritOptions[string]>(widgetFormState.inheritOptions ?? {})
                .filter(([, inheritOption]) => !!inheritOption.enabled)
                .map(([propertyName]) => propertyName)),
            inheritOptionsErrorMap: computed<InheritOptionsErrorMap>(() => getWidgetInheritOptionsErrorMap(
                widgetFormState.inheritOptions,
                state.widgetConfig?.options_schema?.schema,
                dashboardDetailState.variablesSchema,
            )),
            // validation
            isSchemaFormValid: undefined,
            isAllValid: computed(() => state.isSchemaFormValid && isTitleValid.value),

            isFocused: false,
        });

        const referenceHandler = getReferenceHandler();

        /* title form validation */
        const {
            title, resetTitle, updateTitle, isTitleValid, isTitleInvalid, titleInvalidText,
        } = useWidgetTitleInput();

        /* reference store */
        const { referenceStoreState } = useReferenceStore();

        /* more options */
        const handleUpdateDefaultSchemaProperties = (properties: string[]) => {
            widgetFormState.defaultSchemaProperties = properties;

            // update inherit options
            const inheritOptions = {};
            const origin = widgetFormState.inheritOptions ?? {};
            Object.keys(origin).forEach((name) => {
                if (properties.includes(name)) inheritOptions[name] = origin[name];
                else inheritOptions[name] = { enabled: false };
            });
            widgetFormState.inheritOptions = inheritOptions;

            // update schema
            state.widgetOptionsJsonSchema = getRefinedWidgetOptionsSchema(
                referenceStoreState,
                state.widgetConfig?.options_schema ?? {},
                dashboardDetailState.variablesSchema,
                widgetFormState.inheritOptions,
                properties,
                dashboardDetailState.projectId,
            );
        };

        /* utils */
        const isSelected = (selectedItem: SelectDropdownMenu | FilterableDropdownMenuItem[]): boolean => {
            if (Array.isArray(selectedItem)) return !!selectedItem.length;
            return selectedItem && !isEmpty(selectedItem);
        };

        const getFormDataFromWidgetInfo = (widgetInfo: DashboardLayoutWidgetInfo) => {
            const { widget_options, inherit_options } = widgetInfo;
            const formData = {};

            // set schema keywords
            Object.entries(widget_options).forEach(([optionKey, optionValue]) => {
                if (optionKey === 'filters') {
                    Object.entries((optionValue ?? {}) as WidgetFiltersMap).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            formData[`filters.${key}`] = value.map((filter) => filter.v).flat();
                        }
                    });
                } else {
                    formData[optionKey] = cloneDeep(optionValue);
                }
            });

            // override if inherit is enabled
            Object.entries(inherit_options).forEach(([optionKey, optionValue]) => {
                if (optionValue?.enabled) formData[optionKey] = optionValue?.variable_info?.key;
            });
            return formData;
        };
        const getDefaultSchemaPropertiesFromWidgetInfo = (widgetInfo: DashboardLayoutWidgetInfo) => {
            /*
                TODO: After 1.11.0 QA duration, if statement below must be deleted.
                This is compatible code to guard the case when default_schema_properties is undefined.
                After release, this case doesn't needed to be considered.
            */
            if (!widgetInfo.default_schema_properties) {
                return getRefinedDefaultSchemaProperties(state.widgetConfig?.options_schema ?? {});
            }
            return widgetInfo.default_schema_properties ?? [];
        };


        /* inherit */
        const handleChangeInheritToggle = (propertyName: string, { value }) => {
            widgetFormState.inheritOptions = { ...widgetFormState.inheritOptions, [propertyName]: { enabled: value } };

            // update widget option schema
            const originPropertySchema = state.widgetConfig?.options_schema?.schema?.properties?.[propertyName] ?? {};
            state.widgetOptionsJsonSchema = {
                ...state.widgetOptionsJsonSchema,
                properties: {
                    ...state.widgetOptionsJsonSchema.properties,
                    [propertyName]: getWidgetOptionSchema(propertyName, originPropertySchema, dashboardDetailState.variablesSchema, referenceStoreState, value),
                },
            };

            // update form data
            state.schemaFormData = { ...state.schemaFormData, [propertyName]: undefined };
        };

        /* schema refining helpers */
        const getRefinedDefaultSchemaProperties = (widgetOptionsSchema: WidgetOptionsSchema): string[] => {
            const requiredProperties: string[] = widgetOptionsSchema.schema.required ?? [];
            const defaultProperties: string[] = widgetOptionsSchema.default_properties ?? [];
            const allProperties = union(requiredProperties, defaultProperties);

            // generate maps. { [propertyName: string]: number(= index) }
            const requiredIdxMap = {};
            requiredProperties.forEach((name, idx) => { requiredIdxMap[name] = idx; });
            const defaultIdxMap = {};
            defaultProperties.forEach((name, idx) => { defaultIdxMap[name] = idx; });

            return allProperties.sort((a, b) => {
                if (requiredIdxMap[a] !== undefined) {
                    // if both are required, follow required index order
                    if (requiredIdxMap[b] !== undefined) return requiredIdxMap[a] > requiredIdxMap[b] ? 1 : -1;
                    // otherwise, required item comes before
                    return -1;
                }
                // if one is default and one is required, required one comes before
                if (requiredIdxMap[b] !== undefined) return 1;

                // if both are default, follow default index order
                return defaultIdxMap[a] > defaultIdxMap[b] ? 1 : -1;
            });
        };

        /* states settings */
        const resetStates = () => {
            // reset widget form store states
            widgetFormStore.$reset();
            widgetFormState.defaultSchemaProperties = [];
            widgetFormState.inheritOptions = {};
            // reset states
            state.widgetOptionsJsonSchema = {
                type: 'object',
                properties: {},
                required: [],
                order: [],
            };
            state.schemaFormData = {};
            resetTitle();
        };
        const initStatesByWidgetConfig = (widgetConfigId: string) => {
            state.schemaFormData = {};
            const widgetOptionsSchema: WidgetOptionsSchema = state.widgetConfig?.options_schema ?? {};
            // init widget form store states
            widgetFormState.widgetConfigId = widgetConfigId;
            widgetFormState.defaultSchemaProperties = getRefinedDefaultSchemaProperties(widgetOptionsSchema);
            widgetFormState.inheritOptions = {};
            if (!props.widgetKey) {
                widgetFormState.defaultSchemaProperties.filter((d) => !state.requiredProperties.includes(d)).forEach((propertyName) => {
                    widgetFormState.inheritOptions = {
                        ...widgetFormState.inheritOptions,
                        [propertyName]: { enabled: true },
                    };
                    state.schemaFormData[propertyName] = propertyName.replace('filters.', '');
                });
            }
            // init states
            state.widgetOptionsJsonSchema = getRefinedWidgetOptionsSchema(
                referenceStoreState,
                widgetOptionsSchema,
                dashboardDetailState.variablesSchema,
                widgetFormState.inheritOptions,
                widgetFormState.defaultSchemaProperties,
                dashboardDetailState.projectId,
            );
        };
        const setStatesForEditMode = (widgetKey: string) => {
            const widgetOptionsSchema = state.widgetConfig?.options_schema ?? {};

            // set widget form store states
            const widgetInfo = widgetFormStore.initWidgetForm(widgetKey);
            if (!widgetInfo) return;

            // init title
            updateTitle(widgetInfo.title);
            // init widget form store states
            widgetFormState.inheritOptions = getRefinedWidgetInheritOptions(widgetInfo, dashboardDetailState.projectId);
            widgetFormState.defaultSchemaProperties = getDefaultSchemaPropertiesFromWidgetInfo(widgetInfo);
            // init options schema
            state.widgetOptionsJsonSchema = getRefinedWidgetOptionsSchema(
                referenceStoreState,
                widgetOptionsSchema,
                dashboardDetailState.variablesSchema,
                widgetFormState.inheritOptions,
                widgetFormState.defaultSchemaProperties,
                dashboardDetailState.projectId,
            );
            // init form data
            state.schemaFormData = getFormDataFromWidgetInfo(widgetInfo);
        };
        watch([() => props.widgetConfigId, () => props.widgetKey, () => referenceStoreState.loading], ([widgetConfigId, widgetKey, loading]) => {
            // do nothing if still loading
            if (loading) return;

            // reset all states if required props are not given
            if (!widgetConfigId) {
                resetStates();
                return;
            }

            // initiate states by widget config
            initStatesByWidgetConfig(widgetConfigId);

            // set states if widget key exists. this is for updating widget case.
            if (widgetKey) setStatesForEditMode(widgetKey);

            // set focus on text input
            if (widgetConfigId) {
                state.isFocused = true;
            }
        });

        /* validation */
        const handleFormValidate = (isValid) => {
            state.isSchemaFormValid = isValid;
        };

        /* sync to widget form store */
        watch(() => state.schemaFormData, (schemaFormData) => {
            widgetFormStore.setFormData(schemaFormData);
        }, { immediate: true });
        watch(() => state.isAllValid, (_isAllValid) => {
            widgetFormState.isValid = _isAllValid;
        }, { immediate: true });

        return {
            widgetFormState,
            ...toRefs(state),
            referenceHandler,
            /* widget title input */
            title,
            updateTitle,
            isTitleInvalid,
            titleInvalidText,
            /* reference store */
            referenceStoreState,
            /* more options */
            handleUpdateDefaultSchemaProperties,
            /* inherit */
            handleChangeInheritToggle,
            //
            isSelected,
            handleFormValidate,
        };
    },
});
</script>

<style lang="postcss" scoped>
.dashboard-widget-input-form {
    @apply flex flex-col overflow-hidden;
    height: 100%;
    gap: 1rem;
    overflow-y: auto;
    .p-field-group {
        margin: 0;
        .input {
            width: 100%;
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
    }

    /* custom design-system component - p-field-group */
    :deep(.widget-options-form) {
        .field-title-box {
            pointer-events: none;
        }
        .form-label {
            display: -webkit-box;
            width: 100%;
            justify-content: space-between;
            align-content: center;
        }
        .input-form {
            width: 100%;
        }
    }
    .suffix-text {
        @apply text-gray-500;
        padding-left: 0.25rem;
    }
    .inherit-toggle-button {
        @apply bg-gray-100 rounded;
        line-height: 1.25;
        padding: 0.25rem 0.5rem;
        .toggle-button {
            pointer-events: auto;
        }
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
