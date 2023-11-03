<script setup lang="ts">
import { computed, reactive } from 'vue';

import { getTextHighlightRegex, PDataLoader, PTextButton } from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import { get } from 'lodash';

import type { VariableModelConfig } from '@/lib/variable-models';
import { VariableModel } from '@/lib/variable-models';
import type { IBaseVariableModel } from '@/lib/variable-models/_base/types';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardWidgetOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardWidgetOptionDropdown.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type {
    WidgetOptionsSchema,
    WidgetOptionsSchemaProperty,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';
import { getWidgetOptionKeyByVariableKey } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const props = defineProps<{
    projectId?: string;
    variablesSchema?: DashboardVariablesSchema;
}>();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;

const state = reactive({
    properties: computed<WidgetOptionsSchema['properties']>(() => widgetFormStore.widgetConfig?.options_schema?.properties ?? {}),
    propertySchemaTuples: computed<[propertyName: string, schema: WidgetOptionsSchemaProperty][]>(() => {
        const schemaProperties = widgetFormState.schemaProperties.filter((propertyName) => !!state.properties[propertyName]);
        return schemaProperties.map((propertyName) => [propertyName, state.properties[propertyName]]);
    }),
    selectedList: [] as SelectDropdownMenuItem[][],
    variableModelsMap: computed<Record<string, IBaseVariableModel[]>>(() => {
        const _result: Record<string, IBaseVariableModel[]> = {};
        state.propertySchemaTuples.forEach(([propertyName, schema]) => {
            _result[propertyName] = getVariableModels(schema);
        });
        return _result;
    }),
});

const getVariableModels = (schema): IBaseVariableModel[] => {
    const variableModels: IBaseVariableModel[] = [];
    schema.item_options?.forEach((conf: VariableModelConfig) => {
        const variableModel = new VariableModel(conf);
        variableModels.push(variableModel);
    });
    return variableModels;
};
const getInheritOptionMenuHandler = (schema: WidgetOptionsSchemaProperty): AutocompleteHandler => {
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
const getMenuHandlers = (index: number, schema: WidgetOptionsSchemaProperty): AutocompleteHandler[] => {
    if (widgetFormState.inheritOptions?.[schema.key]?.enabled) {
        return [getInheritOptionMenuHandler(schema)];
    }

    // get options from schema dependencies
    const options = {}; // e.g. { data_source_id: 'ds-1' }
    Object.entries(schema.dependencies ?? {})?.forEach(([optionName, reference]) => {
        options[reference.reference_key] = widgetFormState.widgetOptions[optionName];
    });

    const propertyName = state.propertySchemaTuples[index][0];
    const variableModels = state.variableModelsMap[propertyName];
    return variableModels.map((variableModel) => getVariableModelMenuHandler(variableModel, options));
};
const updateWidgetOptionsBySelected = (propertyName: string, selected?: SelectDropdownMenuItem[]) => {
    const widgetOptions = { ...widgetFormState.widgetOptions };
    if (selected?.length) {
        if (state.properties[propertyName].selection_type === 'SINGLE') {
            widgetOptions[propertyName] = selected[0].name;
        } else {
            widgetOptions[propertyName] = selected.map((item) => item.name);
        }
    } else {
        delete widgetOptions[propertyName];
    }
    widgetFormStore.$patch({ widgetOptions });
};
const updateSchemaProperties = (propertyName: string) => {
    const schemaProperties = [...widgetFormState.schemaProperties];
    const index = schemaProperties.findIndex((item) => item === propertyName);
    if (index >= 0) {
        schemaProperties.splice(index, 1);
    }
    widgetFormStore.$patch({ schemaProperties });
};

/* event handlers */
const handleReturnToInitialSettings = () => {
    // TODO: implement
};

const handleUpdateSelected = (index: number, selected: SelectDropdownMenuItem[]) => {
    state.selectedList.splice(index, 1, selected);

    const propertyName = state.propertySchemaTuples[index][0];
    const isInherit = !!widgetFormState.inheritOptions?.[propertyName]?.enabled;
    if (isInherit) {
        widgetFormStore.updateInheritOption(propertyName, true, selected[0]?.name);
        updateWidgetOptionsBySelected(propertyName);
    } else {
        widgetFormStore.updateInheritOption(propertyName, false);
        updateWidgetOptionsBySelected(propertyName, selected);
    }
};
const handleUpdateInherit = (index: number, isInherit: boolean) => {
    state.selectedList.splice(index, 1, []);

    const propertyName = state.propertySchemaTuples[index][0];
    if (isInherit) {
        widgetFormStore.updateInheritOption(propertyName, true);
        updateWidgetOptionsBySelected(propertyName);
    } else {
        widgetFormStore.updateInheritOption(propertyName, false);
    }
};
const handleDeleteProperty = (propertyName: string) => {
    widgetFormStore.updateInheritOption(propertyName, false);
    updateWidgetOptionsBySelected(propertyName);
    updateSchemaProperties(propertyName);
};

/* Init */
const getInitialSelectedItemByHandlers = async (
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
            console.error(`Failed to fetch data from handler: ${idx}`);
        }
    });
    return _selected;
};
const initSelectedMenuItems = async (index: number, propertyName: string): Promise<SelectDropdownMenuItem[]> => {
    const inheritOption = widgetFormStore.inheritOptions?.[propertyName];
    const optionSchema = state.properties[propertyName];

    // inherit case
    if (inheritOption?.enabled) {
        const variableKey = inheritOption.variable_key;
        if (variableKey) {
            const variableSchema = props.variablesSchema?.properties?.[variableKey];
            if (variableSchema?.use) {
                return [{ name: variableKey, label: variableSchema.name }];
            }
        }

        // TODO: implement no variable_key or not used case
        return [];
    }

    const selected = get(widgetFormState.widgetOptions, propertyName);
    console.debug('selected', selected);
    if (Array.isArray(selected)) {
        let values = selected.map((item) => {
            if (typeof item === 'string') {
                return { name: item };
            }
            // TODO: remove after updating filter type
            return Array.isArray(item.v) ? item.v.map((v) => ({ name: v })) : { name: item.v };
        });
        if (Array.isArray(values[0])) values = values.flat();

        if (!optionSchema.optional) {
            // TODO: init validation state
        }

        return values;
    } if (typeof selected !== 'object') {
        const menuHandlers = getMenuHandlers(index, optionSchema);
        const _selected = await getInitialSelectedItemByHandlers(menuHandlers, [{ name: selected }]);
        return _selected;
    }
    console.warn(new Error(`Invalid selected value: ${selected}`));

    return [];
};

(async () => {
    // init state.selectedList
    const selectedListTuples: Array<[number, SelectDropdownMenuItem[]]> = [];
    await Promise.all(state.propertySchemaTuples.map(async ([propertyName], idx) => {
        const selected = await initSelectedMenuItems(idx, propertyName);
        selectedListTuples.push([idx, selected]);
    }));
    state.selectedList = selectedListTuples.sort((a, b) => a[0] - b[0]).map(([, selected]) => selected);
})();


</script>

<template>
    <p-data-loader :loading="false"
                   class="widget-options-form-wrapper"
    >
        <p-text-button icon-left="ic_refresh"
                       style-type="highlight"
                       class="return-to-initial-settings-button"
                       @click="handleReturnToInitialSettings"
        >
            {{ $t('DASHBOARDS.FORM.RETURN_TO_INITIAL_SETTINGS') }}
        </p-text-button>
        <dashboard-widget-option-dropdown v-for="([propertyName, schema], i) in state.propertySchemaTuples"
                                          :key="propertyName"
                                          :label="schema.name ?? propertyName"
                                          :selected="state.selectedList[i]"
                                          :selection-type="schema.selection_type"
                                          :inherit="widgetFormState.inheritOptions?.[propertyName]?.enabled"
                                          :inheritance-mode="schema.inheritance_mode"
                                          :deletable="!schema.fixed"
                                          :menu-handlers="getMenuHandlers(i, schema)"
                                          :variables-schema="props.variablesSchema"
                                          @update:selected="handleUpdateSelected(i, $event)"
                                          @update:inherit="handleUpdateInherit(i, $event)"
                                          @delete="handleDeleteProperty(propertyName)"
        />
    </p-data-loader>
</template>

<style scoped lang="postcss">
.widget-options-form-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 15rem;
    .return-to-initial-settings-button {
        padding: 1rem 0;
        margin-left: auto;
    }
}
</style>
