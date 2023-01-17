<template>
    <div class="dashboard-widget-input-form">
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_NAME')"
                       :invalid="isTitleInvalid"
                       :invalid-text="titleInvalidText"
                       required
        >
            <p-text-input :value="title"
                          :invalid="isTitleInvalid"
                          :placeholder="widgetConfig?.title"
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
                                class="widget-options-form"
                                @validate="handleFormValidate"
            >
                <template #label-extra="{ propertyName }">
                    <div v-if="inheritableProperties.includes(propertyName)"
                         class="inherit-toggle-button"
                    >
                        <span class="text"
                              :class="{inherit: inheritItemMap[propertyName]}"
                        >{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.INHERIT') }}</span>
                        <p-toggle-button :value="inheritItemMap[propertyName]"
                                         @change="handleChangeInheritToggle(propertyName, $event)"
                        />
                    </div>
                </template>
                <template #dropdown-extra="{ propertyName, selectedItem }">
                    <div v-if="isSelected(selectedItem) && inheritItemMap[propertyName]">
                        <span>{{ selectedItem.label }}</span>
                        <span class="suffix-text">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.FROM_DASHBOARD') }}</span>
                    </div>
                </template>
            </p-json-schema-form>
        </p-data-loader>
        <dashboard-widget-more-options :widget-config-id="widgetConfigId"
                                       :inherit-state="inheritItemMap"
                                       @add-schema-property="handleMoreOptionAdd"
                                       @remove-schema-property="handleMoreOptionRemove"
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
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { FilterableDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';
import type { SelectDropdownMenu } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';
import { cloneDeep, isEmpty } from 'lodash';

import type { ReferenceMap } from '@/store/modules/reference/type';


import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import {
    useReferenceStore,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/composables/use-reference-store';
import {
    useWidgetTitleInput,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/composables/use-widget-title-input';
import DashboardWidgetMoreOptions
    from '@/services/dashboards/dashboard-customize/modules/dashboard-widget-input-form/DashboardWidgetMoreOptions.vue';
import { useWidgetFormStore } from '@/services/dashboards/dashboard-customize/stores/widget-form';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import type {
    DashboardLayoutWidgetInfo,
    WidgetFiltersMap,
    WidgetOptionsSchema,
} from '@/services/dashboards/widgets/_configs/config';
import { getWidgetConfig } from '@/services/dashboards/widgets/_helpers/widget-helper';


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
            widgetConfig: computed(() => (props.widgetConfigId ? getWidgetConfig(props.widgetConfigId) : undefined)),
            widgetOptionsJsonSchema: {} as JsonSchema,
            inheritableProperties: computed<string[]>(() => state.widgetConfig?.options_schema?.inheritable_properties || []),
            //
            schemaFormData: {},
            isSchemaFormValid: undefined,
            isAllValid: computed(() => state.isSchemaFormValid && isTitleValid.value),
            inheritItemMap: {} as {[propertyName: string]: boolean},
        });

        /* title form validation */
        const {
            title, resetTitle, updateTitle, isTitleValid, isTitleInvalid, titleInvalidText,
        } = useWidgetTitleInput();

        /* reference store */
        const { referenceStoreState } = useReferenceStore();

        /* more options */
        const handleMoreOptionAdd = (propertyName: string) => {
            const propertySchema = state.widgetConfig?.options_schema?.schema?.properties[propertyName];
            if (!propertySchema) return;
            const _widgetOptionsJsonSchema = cloneDeep(state.widgetOptionsJsonSchema);
            _widgetOptionsJsonSchema.properties[propertyName] = refineOptionSchema(propertyName, propertySchema);
            state.widgetOptionsJsonSchema = _widgetOptionsJsonSchema;
            state.inheritItemMap = { ...state.inheritItemMap, [propertyName]: undefined };
        };
        const handleMoreOptionRemove = (propertyName: string) => {
            const propertySchema = state.widgetConfig?.options_schema?.schema?.properties[propertyName];
            if (!propertySchema) return;
            const _widgetOptionsJsonSchema = cloneDeep(state.widgetOptionsJsonSchema);
            delete _widgetOptionsJsonSchema.properties[propertyName];
            state.widgetOptionsJsonSchema = _widgetOptionsJsonSchema;
            state.inheritItemMap = { ...state.inheritItemMap, [propertyName]: undefined };
        };

        /* Util */
        const isSelected = (selectedItem: SelectDropdownMenu | FilterableDropdownMenuItem[]): boolean => {
            if (Array.isArray(selectedItem)) return !!selectedItem.length;
            return selectedItem && !isEmpty(selectedItem);
        };

        const getFormDataFromWidgetInfo = (widgetInfo:DashboardLayoutWidgetInfo) => {
            const { widget_options, inherit_options } = widgetInfo;
            const formData = {};

            // set schema keywords
            Object.entries(widget_options).forEach(([optionKey, optionValue]) => {
                if (optionKey === 'filters') {
                    Object.entries((optionValue ?? {}) as WidgetFiltersMap).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            formData[`filters.${key}`] = value.map((filter) => filter.v);
                        } else {
                            formData[`filters.${key}`] = value.v;
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
        const getInheritStateFromWidgetInfo = (widgetInfo:DashboardLayoutWidgetInfo) => {
            const { inherit_options } = widgetInfo;
            const inheritState = {};
            Object.entries(inherit_options).forEach(([optionKey, optionValue]) => {
                inheritState[optionKey] = optionValue?.enabled;
            });
            return inheritState;
        };

        /* inherit */
        const handleChangeInheritToggle = (propertyName: string, { value }) => {
            // update inherit state
            state.inheritItemMap = { ...state.inheritItemMap, [propertyName]: value };

            // update widget option schema
            const originPropertySchema = state.widgetConfig?.options_schema?.schema?.properties?.[propertyName] ?? {};
            state.widgetOptionsJsonSchema = {
                ...state.widgetOptionsJsonSchema,
                properties: {
                    ...state.widgetOptionsJsonSchema.properties,
                    [propertyName]: getWidgetOptionSchema(propertyName, originPropertySchema, dashboardDetailState.variablesSchema, value),
                },
            };

            // update form data
            state.schemaFormData = { ...state.schemaFormData, [propertyName]: undefined };
        };

        /* schema refining helpers */
        const refineOptionSchemaByVariablesSchema = (propertySchema: JsonSchema['properties'], variablesSchema: DashboardVariablesSchema) => {
            const enabledVariables = Object.entries(variablesSchema.properties)
                .filter(([, d]) => {
                    if (!d.use) return false;
                    const variableType = d.selection_type === 'MULTI' ? 'array' : 'string';
                    return propertySchema.type === variableType;
                });
            const _enum = enabledVariables.map(([key]) => key);
            return {
                title: propertySchema.title,
                type: 'string',
                enum: _enum.length ? _enum : [null],
                menuItems: enabledVariables.map(([key, val]) => ({
                    name: key, label: val.name,
                })),
                default: undefined,
            };
        };
        const refineFilterOptionSchema = (propertyName: string, propertySchema: JsonSchema['properties']): JsonSchema['properties'] => {
            const referenceType = propertyName.replace('filters.', '');

            // use reference store data if exists
            const referenceData: ReferenceMap = referenceStoreState[referenceType];
            const menuItems: MenuItem[] = Object.values(referenceData).map((d) => ({
                name: d.key, label: d.label,
            }));

            const _enum = Object.keys(referenceData);
            if (propertySchema.type === 'array') {
                return {
                    ...propertySchema,
                    items: { enum: _enum.length ? _enum : [null] },
                    menuItems,
                };
            }
            return {
                ...propertySchema,
                enum: _enum.length ? _enum : [null],
                menuItems,
            };
        };
        const refineOptionSchema = (propertyName: string, propertySchema: JsonSchema['properties']): JsonSchema['properties'] => {
            if (propertyName.startsWith('filters.')) return refineFilterOptionSchema(propertyName, propertySchema);
            return propertySchema;
        };
        const getWidgetOptionSchema = (propertyName: string, propertySchema: JsonSchema['properties'], variablesSchema: DashboardVariablesSchema, inherit: boolean) => {
            let refinedPropertySchema;
            if (inherit) {
                // inherit case
                refinedPropertySchema = refineOptionSchemaByVariablesSchema(propertySchema, variablesSchema);
            } else {
                // non inherit case
                refinedPropertySchema = refineOptionSchema(propertyName, propertySchema);
            }
            return refinedPropertySchema;
        };
        const getRefinedWidgetOptionsSchema = (widgetOptionsSchema: WidgetOptionsSchema, variablesSchema: DashboardVariablesSchema, inheritState: Record<string, boolean>): JsonSchema => {
            const defaultProperties = widgetOptionsSchema?.default_properties ?? [];
            const schema = widgetOptionsSchema?.schema;

            const refinedJsonSchema = {
                type: 'object',
                properties: {},
                required: schema?.required ?? [],
            } as JsonSchema;
            if (!schema?.properties) return refinedJsonSchema;

            // refine each property schema
            Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
                // set properties declared in default_properties only
                if (!defaultProperties.includes(propertyName)) return;
                const inherit = inheritState[propertyName];
                refinedJsonSchema.properties[propertyName] = getWidgetOptionSchema(propertyName, propertySchema, variablesSchema, inherit);
            });

            return refinedJsonSchema;
        };

        /* states settings */
        const resetStates = () => {
            widgetFormStore.$reset();
            state.inheritItemMap = {};
            state.widgetOptionsJsonSchema = {
                type: 'object',
                properties: {},
                required: [],
            };
            state.schemaFormData = {};
            resetTitle();
        };
        const initStatesByWidgetConfig = (widgetConfigId: string) => {
            widgetFormStore.setWidgetConfigId(widgetConfigId);
            state.widgetOptionsJsonSchema = getRefinedWidgetOptionsSchema(state.widgetConfig.options_schema, dashboardDetailState.variablesSchema, state.inheritItemMap);
        };
        const setStatesForEditMode = (widgetKey: string) => {
            widgetFormStore.initWidgetForm(widgetKey);
            const widgetInfo: DashboardLayoutWidgetInfo|undefined = widgetFormState.widgetInfo;
            if (!widgetInfo) return;

            // init title
            updateTitle(widgetInfo.title);
            // init inherit state
            state.inheritItemMap = getInheritStateFromWidgetInfo(widgetInfo);
            // init options schema
            state.widgetOptionsJsonSchema = getRefinedWidgetOptionsSchema(state.widgetConfig.options_schema, dashboardDetailState.variablesSchema, state.inheritItemMap);
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
        });


        /* validation */
        const handleFormValidate = (isValid) => {
            state.isSchemaFormValid = isValid;
        };

        /* sync to widget form store */
        watch(() => state.schemaFormData, (schemaFormData) => {
            widgetFormStore.setFormData(schemaFormData, state.inheritItemMap);
        }, { immediate: true });
        watch(() => state.isAllValid, (_isAllValid) => {
            widgetFormStore.setIsValid(_isAllValid);
        }, { immediate: true });

        return {
            ...toRefs(state),
            /* widget title input */
            title,
            updateTitle,
            isTitleInvalid,
            titleInvalidText,
            /* reference store */
            referenceStoreState,
            /* more options */
            handleMoreOptionAdd,
            handleMoreOptionRemove,
            //
            isSelected,
            handleChangeInheritToggle,
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
}
</style>
