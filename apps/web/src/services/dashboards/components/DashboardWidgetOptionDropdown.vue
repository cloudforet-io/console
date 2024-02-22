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
import { cloneDeep, get } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { DashboardVariables, DashboardVariablesSchema } from '@/schema/dashboard/_types/dashboard-type';
import type {
    InheritanceMode, InheritOption,
    InheritOptions, WidgetFilterKey, WidgetFiltersMap,
    WidgetOptionKey,
    WidgetOptionsSchemaProperty,
} from '@/schema/dashboard/_types/widget-type';
import { i18n } from '@/translations';

import getRandomId from '@/lib/random-id-generator';
import type { VariableModelConfig } from '@/lib/variable-models';
import { VariableModel } from '@/lib/variable-models';
import {
    MANAGED_VARIABLE_MODEL_CONFIGS,
    ManagedVariableModelKey
} from '@/lib/variable-models/managed-model-config/base-managed-model-config';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import DashboardCostWidgetValueOptionDropdown
    from '@/services/dashboards/components/DashboardCostWidgetValueOptionDropdown.vue';
import { useWidgetFormStore } from '@/services/dashboards/stores/widget-form-store';
import {
    COST_VALUE_WIDGET_OPTION_CONFIGS,
} from '@/services/dashboards/widgets/_constants/widget-managed-options-schema.js';
import { getWidgetOptionKeyByVariableKey } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const props = defineProps<{
    propertyName: string;
    variablesSchema?: DashboardVariablesSchema;
    variables?: DashboardVariables;
}>();
const emit = defineEmits<{(e: 'delete'): void;
}>();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.state;
const widgetFormGetters = widgetFormStore.getters;

const state = reactive({
    // property schema
    schemaProperty: computed<WidgetOptionsSchemaProperty|undefined>(() => widgetFormGetters.widgetConfig?.options_schema?.properties?.[props.propertyName]),
    readonly: computed<boolean>(() => state.schemaProperty?.readonly),
    label: computed(() => state.schemaProperty?.name ?? props.propertyName),
    selectionType: computed<WidgetOptionsSchemaProperty['selection_type']>(() => {
        if (state.inherit) return 'SINGLE';
        return state.schemaProperty?.selection_type;
    }),
    inherit: computed<boolean>(() => !!widgetFormState.inheritOptions?.[props.propertyName]?.enabled),
    inheritanceMode: computed<InheritanceMode>(() => state.schemaProperty?.inheritance_mode),
    inheritToggleDisabled: computed<boolean>(() => {
        if (state.inheritanceMode === 'NONE') return true;
        if (state.readonly) return true;
        if (state.inherit) return false;
        if (widgetFormGetters.globalOptionInfo?.optionKey !== props.propertyName) return false;
        if (state.inheritanceMode === 'KEY_MATCHING') {
            const variableKey = state.schemaProperty?.key;
            const value = props.variables?.[variableKey];
            if (Array.isArray(value)) return !value.length;
            return value === undefined;
        }
        return false;
    }),
    //
    selected: [] as SelectDropdownMenuItem[],
    errorMessage: computed<string|undefined>(() => {
        if (!state.isOptionInitiated) return undefined;
        if (!state.selected?.length) {
            return i18n.t('DASHBOARDS.WIDGET.NO_SELECTED_ITEM') as string;
        }
        return undefined;
    }),
    isInitiating: false,
    isOptionInitiated: computed<boolean>(() => widgetFormState.optionsInitMap[props.propertyName]),
    isGlobalOptionReady: computed<boolean>(() => {
        if (!widgetFormGetters.globalOptionInfo) return true;

        // if it is global option, it is always ready to init
        if (widgetFormGetters.globalOptionInfo.optionKey === props.propertyName) return true;

        // if global option is initiated with value, it is ready to init
        return !!widgetFormGetters.globalOptionInfo.initiatedAndHasValue;
    }),
    globalOptionValue: computed<any>(() => widgetFormGetters.globalOptionInfo?.value),
});
const menuState = reactive({
    variableModels: computed<VariableModel[]>(() => getVariableModels(state.schemaProperty)),
    inheritOptionMenuHandler: computed(() => getInheritOptionMenuHandler(state.schemaProperty)),
    menuHandler: undefined as AutocompleteHandler|undefined,
    contextKey: getRandomId(),
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
            selectableVariableMenuItems.push({ name: getWidgetOptionKeyByVariableKey(propertyName) as string, label: property.name });
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
    handler: AutocompleteHandler,
    selected: SelectDropdownMenuItem|SelectDropdownMenuItem[],
): Promise<SelectDropdownMenuItem[]> => {
    if (!selected) return [];
    let _selected = Array.isArray(selected) ? selected : [selected];
    let handlerResponses = await handler(
        '',
        undefined,
        undefined,
        _selected,
    );
    handlerResponses = Array.isArray(handlerResponses) ? handlerResponses : [handlerResponses];
    const results = handlerResponses.map((res) => res.results).flat();
    _selected = _selected.map((item) => {
        const found = results.find((d) => d.name === item.name);
        if (found) return found;
        return item;
    });
    return _selected;
};

const initSelectedInInheritCase = (inheritOption: InheritOptions[WidgetOptionKey]): SelectDropdownMenuItem[] => {
    if (!inheritOption) return [];

    const variableKey: string = inheritOption.variable_key ?? state.schemaProperty?.key ?? '';
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
};

const initSelectedInNoStoredOptionCase = async (): Promise<SelectDropdownMenuItem[]> => {
    const menuHandler = menuState.menuHandler;
    if (menuHandler) {
        const res = await menuHandler('', undefined, undefined, undefined, 0);
        const item = Array.isArray(res) ? res[0]?.results[0] : res?.results[0];
        return item ? [item] : [];
    }
    return [];
};

const initSelectedInStoredOptionArrayTypeCase = async (selected: Array<ConsoleFilter|string>): Promise<SelectDropdownMenuItem[]> => {
    let values: SelectDropdownMenuItem[] = selected.map((item) => {
        // string[] case
        if (typeof item === 'string') {
            return [{ name: item }];
        }
        // ConsoleFilter[] case
        return Array.isArray(item.v) ? item.v.map((v) => ({ name: v })) : { name: item.v };
    }) as SelectDropdownMenuItem[];
    if (Array.isArray(values[0])) values = values.flat();
    if (menuState.menuHandler) {
        const refinedSelected = await getRefinedSelectedItemByHandlers(menuState.menuHandler, values);
        return refinedSelected;
    }
    return values;
};

const initSelectedInStoredOptionPrimitiveTypeCase = async (value: string): Promise<SelectDropdownMenuItem[]> => {
    if (menuState.menuHandler) {
        const refinedSelected = await getRefinedSelectedItemByHandlers(menuState.menuHandler, [{ name: value }]);
        return refinedSelected;
    }
    return [{ name: value, label: value }];
};


// init selected menu items on init or inherit changed
const initSelectedMenuItems = async (): Promise<SelectDropdownMenuItem[]> => {
    const inheritOption: InheritOption = widgetFormState.inheritOptions?.[props.propertyName];
    let results: SelectDropdownMenuItem[];
    // 1) inherit case
    if (inheritOption?.enabled) {
        results = initSelectedInInheritCase(inheritOption);
    // 2) non-inherit case
    } else {
        const selected: Array<ConsoleFilter|string>|string|undefined = get(widgetFormGetters.updatedWidgetInfo?.widget_options, props.propertyName)
            ?? get(widgetFormState.widgetOptions, props.propertyName);
        // 2-1) no stored option case
        if (!selected) {
            results = await initSelectedInNoStoredOptionCase();
        // 2-2) existing stored option case
        // 2-2-1) array case (e.g. ['aws', 'gcp'] or [{k: 'product', v: ['AWSDataTransfer'], o: '='}])
        } else if (Array.isArray(selected)) {
            results = await initSelectedInStoredOptionArrayTypeCase(selected);
        // 2-2-2) primitive type case (e.g. 'aws')
        } else if (typeof selected !== 'object') {
            /*
                Here is the compatible code for removing the "." in cases where it is attached to data, such as "additional_info." or "tags."
                This code is designed to set the select dropdown menu item type accordingly.
            */
            if (selected.includes('.')) {
                results = [{ name: selected.split('.')[1], label: selected.split('.')[1] }];
            } else {
                results = await initSelectedInStoredOptionPrimitiveTypeCase(selected);
            }
        } else {
            console.warn(new Error(`Invalid selected value: ${selected}`));
            results = [];
        }
    }
    return results;
};

const getListQueryOptions = (globalOptionValue?: any) => {
    const globalOptionInfo = widgetFormGetters.globalOptionInfo;
    if (!globalOptionInfo?.initiatedAndHasValue) return undefined;
    return {
        [globalOptionInfo.variableKey]: globalOptionValue,
    }; // e.g. { cost_data_source: 'ds-1' }
};
const initMenuHandlers = (globalOptionValue?: any) => {
    if (widgetFormState.inheritOptions?.[props.propertyName]?.enabled) {
        menuState.menuHandler = menuState.inheritOptionMenuHandler;
    } else {
        const listQueryOptions = getListQueryOptions(globalOptionValue);
        const variableModels = menuState.variableModels;
        menuState.menuHandler = getVariableModelMenuHandler(variableModels, listQueryOptions);
    }
    menuState.contextKey = getRandomId();
};

const addWidgetFilters = (filterKey: string, value: string|string[], filtersMap: WidgetFiltersMap = {}): WidgetFiltersMap => {
    const modelConf = MANAGED_VARIABLE_MODEL_CONFIGS[filterKey as WidgetFilterKey];
    if (!modelConf) {
        console.error(new Error(`Invalid widget options filter key: ${filterKey}`));
        return filtersMap;
    }
    const idKey = MANAGED_VARIABLE_MODEL_CONFIGS[filterKey as ManagedVariableModelKey].idKey;
    const referenceKey = MANAGED_VARIABLE_MODEL_CONFIGS[filterKey as ManagedVariableModelKey].referenceKey;
    if (!idKey && !referenceKey) {
        console.error(new Error(`Invalid referencing idKey|referenceKey of variable model by options filter key: ${filterKey}`));
        return filtersMap;
    }

    const _filtersMap = { ...filtersMap };
    const _value = Array.isArray(value) ? value : [value];
    _filtersMap[filterKey] = [{ k: idKey ?? referenceKey, v: _value, o: '=' }];
    return _filtersMap;
};
const updateWidgetOptionsBySelected = (selected?: SelectDropdownMenuItem[]) => {
    const propertyName = props.propertyName;
    const widgetOptions = cloneDeep(widgetFormState.widgetOptions);
    const dataName = propertyName.replace('filters.', '');

    // add case
    if (selected?.length && selected[0] !== undefined) {
        if (state.schemaProperty?.selection_type === 'SINGLE') {
            const value = selected[0].name as string;
            if (propertyName.startsWith('filters.')) {
                widgetOptions.filters = addWidgetFilters(dataName, value, widgetOptions.filters);
            } else {
                widgetOptions[propertyName] = value;
            }
        } else {
            const values = selected.map((item) => item.name) as string[];
            if (propertyName.startsWith('filters.')) {
                widgetOptions.filters = addWidgetFilters(dataName, values, widgetOptions.filters);
            } else {
                widgetOptions[propertyName] = values;
            }
        }
    // delete case
    } else if (!selected?.length) {
        if (propertyName.startsWith('filters.')) {
            delete widgetOptions.filters?.[dataName];
        } else {
            delete widgetOptions[propertyName];
        }
    }

    widgetFormStore.updateOptions(widgetOptions);
};
const deleteWidgetSchemaProperties = () => {
    const schemaProperties = cloneDeep(widgetFormState.schemaProperties);
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
        updateWidgetOptionsBySelected();
    } else {
        updateWidgetOptionsBySelected(selected);
    }

    // update init state in global option case
    if (widgetFormGetters.globalOptionInfo?.optionKey === props.propertyName) {
        // reset all other options' init states to false - except for global option
        widgetFormStore.resetOptionsInitMap(true);
    }
};
const handleUpdateInherit = async (inherit: boolean) => {
    // update inherit state
    if (inherit) {
        widgetFormStore.updateInheritOption(props.propertyName, true);
    } else {
        widgetFormStore.updateInheritOption(props.propertyName, false);
    }

    // update init state
    if (widgetFormGetters.globalOptionInfo?.optionKey === props.propertyName) {
        // reset all options' init states to false - including global option
        widgetFormStore.resetOptionsInitMap();
    } else {
        widgetFormStore.updateOptionInitState(props.propertyName, false);
    }
};
const handleDeleteProperty = () => {
    state.selected = [];
    updateWidgetOptionsBySelected();
    deleteWidgetSchemaProperties();
    emit('delete');
};

watch([
    () => props.propertyName,
    () => state.isGlobalOptionReady,
    () => state.isOptionInitiated,
    () => state.globalOptionValue, // watch globalOptionValue to re-init menu handlers
], async ([propertyName, isGlobalOptionReady, isOptionInitiated, globalOptionValue]) => {
    if (!propertyName) return;
    if (!isGlobalOptionReady) return; // init option after global option is ready
    if (isOptionInitiated) return;
    if (state.isInitiating) return;

    state.isInitiating = true;
    initMenuHandlers(globalOptionValue);
    state.selected = await initSelectedMenuItems();
    updateWidgetOptionsBySelected(widgetFormState.inheritOptions?.[props.propertyName]?.enabled ? undefined : state.selected);
    widgetFormStore.updateOptionInitState(propertyName, true);
    state.isInitiating = false;
}, { immediate: true });
watch(() => state.errorMessage, (errorMessage) => {
    widgetFormStore.updateOptionValidState(props.propertyName, !errorMessage);
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
                <div v-if="state.inheritanceMode !== 'NONE'"
                     class="inherit-toggle-button-wrapper"
                >
                    <span class="text"
                          :class="{inherit: state.inheritanceMode !== 'NONE'}"
                    >{{ $t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.INHERIT') }}</span>
                    <p-toggle-button :value="state.inherit"
                                     :disabled="state.inheritToggleDisabled"
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
                    <p-select-dropdown :key="menuState.contextKey"
                                       use-fixed-menu-style
                                       parent-id="dashboard-widget-option"
                                       appearance-type="badge"
                                       is-fixed-width
                                       :is-filterable="!state.inherit"
                                       :multi-selectable="state.selectionType === 'MULTI'"
                                       :handler="menuState.menuHandler"
                                       :selected="state.selected"
                                       :invalid="!!state.errorMessage"
                                       :disabled="(state.inheritanceMode === 'KEY_MATCHING' && state.inherit) || state.readonly"
                                       show-select-marker
                                       :page-size="10"
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
