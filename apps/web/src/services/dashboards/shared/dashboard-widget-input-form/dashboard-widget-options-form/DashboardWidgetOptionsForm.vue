<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    getTextHighlightRegex,
    PDataLoader, PTextButton,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardWidgetOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardWidgetOptionDropdown.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type {
    WidgetOptionsSchema,
    WidgetOptionsSchemaProperty,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';
import {
    getWidgetOptionName,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const props = defineProps<{
    projectId?: string;
    variablesSchema?: DashboardVariablesSchema;
}>();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;

const state = reactive({
    properties: computed<WidgetOptionsSchema['properties']>(() => widgetFormStore.widgetConfig?.options_schema?.properties ?? {}),
    propertySchemaList: computed<WidgetOptionsSchemaProperty[]>(() => {
        const schemaProperties = widgetFormState.schemaProperties.filter((propertyName) => !!state.properties[propertyName]);
        return schemaProperties.map((propertyName) => state.properties[propertyName]);
    }),
    selectedList: [] as SelectDropdownMenuItem[][],
});

const getInheritOptionMenuHandler = (schema: WidgetOptionsSchemaProperty): AutocompleteHandler => {
    const selectableVariableMenuItems: {name: string; label: string;}[] = [];
    Object.entries(props.variablesSchema?.properties ?? {}).forEach(([propertyName, property]) => {
        if (property.use && property.selection_type === schema.selection_type) {
            selectableVariableMenuItems.push({ name: getWidgetOptionName(propertyName), label: property.name });
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
const getMenuHandlers = (schema: WidgetOptionsSchemaProperty): AutocompleteHandler[] => {
    if (widgetFormState.inheritOptions?.[schema.key]?.enabled) {
        return [getInheritOptionMenuHandler(schema)];
    }
    return schema.item_options?.map((options) => getVariableModelMenuHandler(options)) ?? [];
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

    const propertyName = state.propertySchemaList[index].key;
    const isInherit = !!widgetFormState.inheritOptions?.[state.propertySchemaList[index].key]?.enabled;
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

    const propertyName = state.propertySchemaList[index].key;
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
const initSelectedMenuItems = (propertyName: string): SelectDropdownMenuItem[] => {
    const isInherit = !!widgetFormState.inheritOptions?.[propertyName]?.enabled;
    if (isInherit) {
        const variableKey = state.properties[propertyName]?.key;
        const variableSchema = props.variablesSchema?.properties?.[variableKey];
        if (variableSchema?.use) {
            return [{ name: variableKey, label: variableSchema.name }];
        }
    }
    const selected = widgetFormState.widgetOptions[propertyName];
    if (Array.isArray(selected)) {
        return selected.map((item: string) => ({ name: item }));
    } if (typeof selected !== 'object') {
        return [{ name: selected }];
    }
    console.warn(new Error(`Invalid selected value: ${selected}`));

    return [];
};
state.selectedList = state.propertySchemaList.map((schema) => initSelectedMenuItems(schema.key));

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
        <dashboard-widget-option-dropdown v-for="(schema, i) in state.propertySchemaList"
                                          :key="schema.key"
                                          :label="schema.name ?? schema.key"
                                          :selected="state.selectedList[i]"
                                          :selection-type="schema.selection_type"
                                          :inherit="widgetFormState.inheritOptions?.[schema.key]?.enabled"
                                          :inheritance-mode="schema.inheritance_mode"
                                          :deletable="!schema.fixed"
                                          :menu-handlers="getMenuHandlers(schema)"
                                          :variables-schema="props.variablesSchema"
                                          @update:selected="handleUpdateSelected(i, $event)"
                                          @update:inherit="handleUpdateInherit(i, $event)"
                                          @delete="handleDeleteProperty(schema.key)"
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
