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
import type { ManagedVariableModelKey } from '@/lib/variable-models/managed';
import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardCostWidgetValueOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardCostWidgetValueOptionDropdown.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type { InheritOptions, WidgetFiltersMap } from '@/services/dashboards/widgets/_configs/config';
import type {
    InheritanceMode, WidgetFilterKey, WidgetOptionKey,
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
    globalOptionKey?: string;
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
    readonly: computed<boolean>(() => state.schemaProperty?.readonly),
    label: computed(() => state.schemaProperty?.name ?? props.propertyName),
    selectionType: computed<WidgetOptionsSchemaProperty['selection_type']>(() => state.schemaProperty?.selection_type),
    inherit: computed<boolean>(() => !!widgetFormState.inheritOptions?.[props.propertyName]?.enabled),
    inheritanceMode: computed<InheritanceMode>(() => state.schemaProperty?.inheritance_mode),
    //
    selected: [] as SelectDropdownMenuItem[],
    errorMessage: computed<string|undefined>(() => {
        if (!state.isOptionInitiated) return undefined;
        if (state.schemaProperty?.optional) return undefined;
        if (!state.selected?.length) {
            return i18n.t('DASHBOARDS.WIDGET.NO_SELECTED_ITEM') as string;
        }
        return undefined;
    }),
    isOptionInitiated: false,
});
const menuState = reactive({
    variableModels: computed<VariableModel[]>(() => getVariableModels(state.schemaProperty)),
    inheritOptionMenuHandler: computed(() => getInheritOptionMenuHandler(state.schemaProperty)),
    listQueryOptions: computed<Record<string, any>|undefined>(() => {
        if (!props.globalOptionKey) return undefined;
        return {
            [props.globalOptionKey]: widgetFormState.widgetOptions[props.globalOptionKey],
        }; // e.g. { cost_data_source: 'ds-1' }
    }),
    menuHandlers: computed(() => {
        if (!state.schemaProperty) return [];

        if (widgetFormState.inheritOptions?.[props.propertyName]?.enabled) {
            return [menuState.inheritOptionMenuHandler];
        }

        return menuState.variableModels.map((variableModel) => getVariableModelMenuHandler(variableModel, menuState.listQueryOptions));
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

const initSelectedInInheritCase = (inheritOption: InheritOptions[WidgetOptionKey]): SelectDropdownMenuItem[] => {
    if (!inheritOption) return [];

    const variableKey = inheritOption.variable_key ?? state.schemaProperty.key;
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
    if (state.schemaProperty?.optional) return [];
    const menuHandler = menuState.menuHandlers?.[0];
    if (menuHandler) {
        const results = await menuHandler('');
        return [results.results[0]];
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
    if (menuState.menuHandlers) {
        const refinedSelected = await getRefinedSelectedItemByHandlers(menuState.menuHandlers, values);
        return refinedSelected;
    }
    return values;
};

const initSelectedInStoredOptionPrimitiveTypeCase = async (selected: string): Promise<SelectDropdownMenuItem[]> => {
    if (menuState.menuHandlers) {
        const refinedSelected = await getRefinedSelectedItemByHandlers(menuState.menuHandlers, [{ name: selected }]);
        return refinedSelected;
    }
    return [{ name: selected }];
};


// init selected menu items on init or inherit changed
const initSelectedMenuItems = async (inherit: boolean): Promise<SelectDropdownMenuItem[]> => {
    const inheritOption = widgetFormState.inheritOptions?.[props.propertyName];
    let results: SelectDropdownMenuItem[];
    // 1) inherit case
    if (inherit) {
        results = initSelectedInInheritCase(inheritOption);
    // 2) non-inherit case
    } else {
        const selected: Array<ConsoleFilter|string>|string|undefined = get(widgetFormState.widgetOptions, props.propertyName);

        // 2-1) no stored option case
        if (!selected) {
            results = await initSelectedInNoStoredOptionCase();
        // 2-2) existing stored option case
        // 2-2-1) array case (e.g. ['aws', 'gcp'] or [{k: 'product', v: ['AWSDataTransfer'], o: '='}])
        } else if (Array.isArray(selected)) {
            results = await initSelectedInStoredOptionArrayTypeCase(selected);
        // 2-2-2) primitive type case (e.g. 'aws')
        } else if (typeof selected !== 'object') {
            results = await initSelectedInStoredOptionPrimitiveTypeCase(selected);
        } else {
            console.warn(new Error(`Invalid selected value: ${selected}`));
            results = [];
        }
    }

    state.isOptionInitiated = true;
    return results;
};

const addWidgetFilters = (filterKey: string, value: string|string[], filtersMap: WidgetFiltersMap = {}): WidgetFiltersMap => {
    const modelConf = MANAGED_VARIABLE_MODEL_CONFIGS[filterKey as WidgetFilterKey];
    if (!modelConf) {
        console.error(new Error(`Invalid widget options filter key: ${filterKey}`));
        return filtersMap;
    }
    const idKey = MANAGED_VARIABLE_MODEL_CONFIGS[filterKey as ManagedVariableModelKey].idKey;
    if (!idKey) {
        console.error(new Error(`Invalid referencing idKey of variable model by options filter key: ${filterKey}`));
        return filtersMap;
    }

    const _filtersMap = { ...filtersMap };
    const _value = Array.isArray(value) ? value : [value];
    _filtersMap[filterKey] = [{ k: idKey, v: _value, o: '=' }];
    return _filtersMap;
};
const updateWidgetOptionsBySelected = (selected?: SelectDropdownMenuItem[]) => {
    const propertyName = props.propertyName;
    const widgetOptions = { ...widgetFormState.widgetOptions };
    const dataName = propertyName.replace('filters.', '');

    // add case
    if (selected?.length) {
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
        updateWidgetOptionsBySelected();
    } else {
        updateWidgetOptionsBySelected(selected);
    }
};
const handleUpdateInherit = async (inherit: boolean) => {
    state.isOptionInitiated = false;
    if (inherit) {
        widgetFormStore.updateInheritOption(props.propertyName, true);
    } else {
        widgetFormStore.updateInheritOption(props.propertyName, false);
    }
    const selected = await initSelectedMenuItems(inherit);
    state.selected = selected;
    updateWidgetOptionsBySelected(inherit ? undefined : selected);
};
const handleDeleteProperty = () => {
    state.selected = [];
    updateWidgetOptionsBySelected();
    updateWidgetSchemaProperties();
    emit('delete');
};

watch(() => props.propertyName, async (propertyName) => {
    state.isOptionInitiated = false;
    if (propertyName) state.selected = await initSelectedMenuItems(state.inherit);
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
                <div v-if="state.inheritanceMode !== 'NONE'"
                     class="inherit-toggle-button-wrapper"
                >
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
                                       appearance-type="badge"
                                       is-fixed-width
                                       :is-filterable="!state.inherit"
                                       :multi-selectable="state.selectionType === 'MULTI'"
                                       :handler="menuState.menuHandlers"
                                       :selected="state.selected"
                                       :invalid="!!state.errorMessage"
                                       :disabled="(state.inheritanceMode === 'KEY_MATCHING' && state.inherit) || state.readonly"
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
