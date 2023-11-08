<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    getTextHighlightRegex,
    PFieldGroup, PIconButton, PSelectDropdown, PToggleButton,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { get } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { i18n } from '@/translations';

import type { VariableModelConfig } from '@/lib/variable-models';
import { VariableModel } from '@/lib/variable-models';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardCostWidgetValueOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardCostWidgetValueOptionDropdown.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type {
    InheritanceMode,
    WidgetOptionsSchemaProperty,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';
import {
    COST_VALUE_WIDGET_OPTION_CONFIGS,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';
import { getWidgetOptionKeyByVariableKey } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const props = defineProps<{
    propertyName: string;
    variablesSchema?: DashboardVariablesSchema;
    isValid?: boolean;
}>();
const emit = defineEmits<{(e: 'update:is-valid', isValid: boolean): void;
    (e: 'delete'): void;
}>();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.state;
const widgetFormGetters = widgetFormStore.getters;

const state = reactive({
    // property schema
    schemaProperty: computed<WidgetOptionsSchemaProperty|undefined>(() => widgetFormGetters.widgetConfig?.options_schema?.properties?.[props.propertyName]),
    label: computed(() => state.schemaProperty?.name ?? props.propertyName),
    selectionType: computed<WidgetOptionsSchemaProperty['selection_type']>(() => state.schemaProperty?.selection_type),
    inherit: computed<boolean>(() => !!widgetFormState.inheritOptions?.[props.propertyName]?.enabled),
    inheritanceMode: computed<InheritanceMode>(() => state.schemaProperty?.inheritance_mode),
    //
    selected: [] as SelectDropdownMenuItem[],
    errorMessage: computed<string|undefined>(() => {
        if (state.schemaProperty?.optional) return undefined;
        if (!state.selected?.length) {
            return i18n.t('DASHBOARDS.WIDGET.NO_SELECTED_ITEM') as string;
        }
        return undefined;
    }),
});
const menuState = reactive({
    variableModels: computed<VariableModel[]>(() => getVariableModels(state.schemaProperty)),
    inheritOptionMenuHandler: computed(() => getInheritOptionMenuHandler(state.schemaProperty)),
    menuHandlers: computed(() => {
        if (!state.schemaProperty) return [];

        if (widgetFormState.inheritOptions?.[props.propertyName]?.enabled) {
            return [menuState.inheritOptionMenuHandler];
        }

        // get options from schema dependencies
        const modelOptions: Record<string, any> = {}; // e.g. { cost_data_source: 'ds-1' }
        state.schemaProperty.dependent_properties?.forEach((property) => {
            modelOptions[property] = widgetFormState.widgetOptions[property];
        });

        return menuState.variableModels.map((variableModel) => getVariableModelMenuHandler(variableModel, modelOptions));
    }),
});

/* Util */
const getVariableModels = (schema?: WidgetOptionsSchemaProperty): VariableModel[] => {
    if (!schema?.item_options) return [];

    const variableModels: VariableModel[] = [];
    schema.item_options?.forEach((conf: VariableModelConfig) => {
        const variableModel = new VariableModel(conf);
        variableModels.push(variableModel);
    });
    return variableModels;
};
const getInheritOptionMenuHandler = (schema?: WidgetOptionsSchemaProperty): AutocompleteHandler => {
    if (!schema) return () => ({ results: [] });

    const selectableVariableMenuItems: {name: string; label: string;}[] = [];
    Object.entries(props.variablesSchema?.properties ?? {}).forEach(([propertyName, property]) => {
        if (property.use && property.selection_type === schema.selection_type) {
            selectableVariableMenuItems.push({ name: getWidgetOptionKeyByVariableKey(propertyName), label: property.name });
        }
    });
    return (inputText) => {
        const regex = getTextHighlightRegex(inputText);
        const filteredMenuItems = selectableVariableMenuItems.filter((item) => regex.test(item.label));
        return {
            results: filteredMenuItems,
        };
    };
};
// refine selected item by handlers (e.g. [{ name: 'aws' }] -> [{ name: 'aws', label: 'AWS' }])
const getRefinedSelectedItemByHandlers = async (
    handlers: AutocompleteHandler[],
    selected: SelectDropdownMenuItem|SelectDropdownMenuItem[],
): Promise<SelectDropdownMenuItem[]> => {
    if (!selected) return [];
    let _selected = Array.isArray(selected) ? selected : [selected];
    const promiseResults = await Promise.allSettled(handlers.map((handler) => handler(
        '',
        undefined,
        undefined,
        _selected,
    )));
    promiseResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
            const results = result.value.results;
            _selected = _selected.map((item) => {
                const found = results.find((d) => d.name === item.name);
                if (found) return found;
                return item;
            });
        } else {
            console.error(new Error(`Failed to fetch data from handler: ${idx}`));
        }
    });
    return _selected;
};
// init selected menu items on init or inherit changed
const initSelectedMenuItems = async (): Promise<SelectDropdownMenuItem[]> => {
    const inheritOption = widgetFormState.inheritOptions?.[props.propertyName];

    // 1) inherit case
    if (state.inherit) {
        const variableKey = inheritOption.variable_key;
        const variableProperty = props.variablesSchema?.properties?.[variableKey];
        if (!state.inheritanceMode || state.inheritanceMode === 'KEY_MATCHING') {
            if (!variableKey || !variableProperty?.use) return [];
            return [{ name: variableKey, label: variableProperty.name }];
        }
        if (state.inheritanceMode === 'SELECTION_TYPE_MATCHING') {
            // if variable is available, use it
            if (variableKey && variableProperty?.use) {
                return [{ name: variableKey, label: variableProperty.name }];
            }

            // find variable key from variables schema by selection type
            const matchedPropertyTuples = Object.entries(props.variablesSchema?.properties ?? {})
                .find(([, d]) => d.use && d.selection_type === state.schemaProperty?.selection_type);
            if (matchedPropertyTuples) {
                const matchedVariableKey = matchedPropertyTuples[0];
                const matchedVariableProperty = props.variablesSchema?.properties?.[matchedVariableKey];
                return [{ name: matchedVariableKey, label: matchedVariableProperty?.name }];
            }
        }
        return [];
    }

    // 2) non-inherit case
    const selected: Array<ConsoleFilter|string>|string|undefined = get(widgetFormState.widgetOptions, props.propertyName);

    // 2-1) no selected case
    if (!selected) {
        const menuHandler = menuState.menuHandlers?.[0];
        if (menuHandler) {
            const results = await menuHandler('');
            return [results.results[0]];
        }
        return [];
    }

    // 2-2) selected case
    // 2-2-1) array case (e.g. ['aws', 'gcp'] or [{k: 'product', v: ['AWSDataTransfer'], o: '='}])
    if (Array.isArray(selected)) {
        let values: SelectDropdownMenuItem[] = selected.map((item) => {
            // string[] case
            if (typeof item === 'string') {
                return [{ name: item }];
            }
            // ConsoleFilter[] case
            return Array.isArray(item.v) ? item.v.map((v) => ({ name: v })) : { name: item.v };
        }) as SelectDropdownMenuItem[];
        if (Array.isArray(values[0])) values = values.flat();
        if (menuState.menuHandlers) {
            const refinedSelected = await getRefinedSelectedItemByHandlers(menuState.menuHandlers, values);
            return refinedSelected;
        }
        return values;
    }
    // 2-2-2) string case (e.g. 'aws')
    if (typeof selected !== 'object') {
        if (menuState.menuHandlers) {
            const refinedSelected = await getRefinedSelectedItemByHandlers(menuState.menuHandlers, [{ name: selected }]);
            return refinedSelected;
        }
        return [{ name: selected }];
    }
    console.warn(new Error(`Invalid selected value: ${selected}`));
    return [];
};
const updateWidgetOptionsBySelected = (selected?: SelectDropdownMenuItem[]) => {
    const propertyName = props.propertyName;
    const widgetOptions = { ...widgetFormState.widgetOptions };
    if (selected?.length) {
        if (state.schemaProperty?.selection_type === 'SINGLE') {
            widgetOptions[propertyName] = selected[0].name;
        } else {
            widgetOptions[propertyName] = selected.map((item) => item.name);
        }
    } else {
        delete widgetOptions[propertyName];
    }
    widgetFormStore.updateOptions(widgetOptions);
};
const updateWidgetSchemaProperties = () => {
    const schemaProperties = [...widgetFormState.schemaProperties];
    const index = schemaProperties.findIndex((item) => item === props.propertyName);
    if (index >= 0) {
        schemaProperties.splice(index, 1);
    }
    widgetFormStore.updateSchemaProperties(schemaProperties);
};

/* Event */
const handleUpdateSelected = (selected: SelectDropdownMenuItem[]) => {
    state.selected = selected;

    const isInherit = !!widgetFormState.inheritOptions?.[props.propertyName]?.enabled;
    if (isInherit) {
        widgetFormStore.updateInheritOption(props.propertyName, true, selected[0]?.name);
        updateWidgetOptionsBySelected();
    } else {
        widgetFormStore.updateInheritOption(props.propertyName, false);
        updateWidgetOptionsBySelected(selected);
    }
};
const handleUpdateInherit = async (inherit: boolean) => {
    if (inherit) {
        widgetFormStore.updateInheritOption(props.propertyName, true);
        updateWidgetOptionsBySelected();
    } else {
        widgetFormStore.updateInheritOption(props.propertyName, false);
    }
    state.selected = await initSelectedMenuItems();
};
const handleDeleteProperty = () => {
    state.selected = [];
    updateWidgetOptionsBySelected();
    updateWidgetSchemaProperties();
    emit('delete');
};

watch(() => props.propertyName, async (propertyName) => {
    if (propertyName) state.selected = await initSelectedMenuItems();
}, { immediate: true });
watch(() => state.errorMessage, (errorMessage) => {
    emit('update:is-valid', !errorMessage);
}, { immediate: true });
</script>

<template>
    <div class="dashboard-widget-option-dropdown">
        <p-field-group :label="state.label"
                       :invalid="!!state.errorMessage"
                       :invalid-text="state.errorMessage"
                       required
        >
            <template #label-extra>
                <div class="inherit-toggle-button-wrapper">
                    <span class="text"
                          :class="{inherit: state.inheritanceMode !== 'NONE'}"
                    >{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.INHERIT') }}</span>
                    <p-toggle-button :value="state.inherit"
                                     :disabled="state.inheritanceMode === 'NONE'"
                                     @change-toggle="handleUpdateInherit"
                    />
                </div>
            </template>
            <div>
                <!-- HACK: Modeling it like any other option thereafter -->
                <div v-if="(state.schemaProperty?.key !== COST_VALUE_WIDGET_OPTION_CONFIGS.cost_tag_value.key) &&
                         (state.schemaProperty?.key !== COST_VALUE_WIDGET_OPTION_CONFIGS.cost_additional_info_value.key)"
                     class="select-form-wrapper"
                >
                    <p-select-dropdown use-fixed-menu-style
                                       is-fixed-width
                                       :is-filterable="!state.inherit"
                                       :multi-selectable="state.selectionType === 'MULTI'"
                                       :handler="menuState.menuHandlers"
                                       :selected="state.selected"
                                       :invalid="!!state.errorMessage"
                                       :disabled="state.inheritanceMode === 'KEY_MATCHING' && state.inherit"
                                       @update:selected="handleUpdateSelected"
                    >
                        <template #dropdown-button>
                            <div v-if="state.inheritanceMode !== 'NONE' && state.inherit"
                                 class="dropdown-inner"
                            >
                                <span class="item-label">{{ state.selected?.[0]?.label }}</span>
                                <span class="suffix-text">{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.FROM_DASHBOARD') }}</span>
                            </div>
                        </template>
                    </p-select-dropdown>
                    <p-icon-button v-if="!state.schemaProperty?.fixed"
                                   class="delete-button"
                                   shape="square"
                                   style-type="negative-secondary"
                                   name="ic_delete"
                                   @click="handleDeleteProperty"
                    />
                </div>
                <dashboard-cost-widget-value-option-dropdown
                    v-else
                    :selected="state.selected"
                    :option-key="state.schemaProperty?.key"
                    :invalid="!!state.errorMessage"
                    @update:selected="handleUpdateSelected"
                    @delete="handleDeleteProperty"
                />
            </div>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.dashboard-widget-option-dropdown {
    width: 100%;

    /* custom design-system component - p-field-group */

    /* custom design-system component - p-field-title */
    :deep(.p-field-group) {
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
    }

    .select-form-wrapper {
        display: flex;
        width: 100%;
        .p-select-dropdown {
            flex-grow: 1;
        }
    }

    /*
    custom design-system component - p-select-dropdown
    HACK: remove this when p-select-dropdown is fixed
     */

    :deep(.p-select-dropdown) {
        .dropdown-button {
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

    .delete-button {
        margin-left: 0.25rem;
    }
}
</style>
