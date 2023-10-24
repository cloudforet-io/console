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

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardWidgetOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardWidgetOptionDropdown.vue';
import {
    getWidgetOptionMenuHandlers,
} from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/helpers/widget-option-menu-handler';
import {
    getVariableKeyFromWidgetSchemaProperty,
} from '@/services/dashboards/shared/helpers/dashboard-variable-schema-helper';
import type { InheritOptions } from '@/services/dashboards/widgets/_configs/config';
import type {
    WidgetOptionsSchemaProperty,
} from '@/services/dashboards/widgets/_configs/widget-options-schema-config';
import {
    getWidgetOptionName,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const props = defineProps<{
    loading?: boolean;
    projectId?: string;
    variablesSchema?: DashboardVariablesSchema;
    optionsSchema?: WidgetOptionsSchemaProperty[];
    widgetOptions: Record<string, any>;
    inheritOptions?: InheritOptions;
    schemaProperties?: string[];
}>();

const emit = defineEmits<{(e: 'delete-property', propertyName: string): void;
    (e: 'toggle-inherit', propertyName: string, isInherit: boolean): void;
    (e: 'validate', isValid: boolean): void;
    (e: 'update:widget-options', widgetOptions: Record<string, any>): void;
}>();

const state = reactive({
    // TODO: update to use widget options schema
    schemaList: computed<WidgetOptionsSchemaProperty[]>(() => [{
        key: 'product',
        name: 'Product',
        selection_type: 'MULTI',
        fixed: false,
        item_options: [
            { type: 'SEARCH_RESOURCE', resource_type: 'cost_analysis.Cost', reference_key: 'product' },
        ],
        dependencies: {
            cost_data_source: { key: 'data_source_id' },
        },
    }, {
        key: 'cost_data_type',
        name: 'Data Type',
        selection_type: 'SINGLE',
        fixed: true,
        item_options: [
            { type: 'MANAGED_VARIABLE', variable_key: 'cost_data_type' },
        ],
        dependencies: {
            cost_data_source: { key: 'data_source_id' },
        },
    }]),
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
    if (props.inheritOptions?.[schema.key]?.enabled) {
        return [getInheritOptionMenuHandler(schema)];
    }
    return getWidgetOptionMenuHandlers(schema);
};
const updateWidgetOptions = (widgetOptions: Record<string, any>) => {
    emit('update:widget-options', widgetOptions);
};

/* event handlers */
const handleReturnToInitialSettings = () => {
    // TODO: implement
};

const handleUpdateSelected = (index: number, selected: SelectDropdownMenuItem[]) => {
    const isInherit = !!props.inheritOptions?.[state.schemaList[index].key]?.enabled;
    if (isInherit) {
        // TODO: implement inherit case
        return;
    }

    const widgetOptions = { ...props.widgetOptions };
    const propertyName = state.schemaList[index].key;
    if (selected.length) {
        widgetOptions[propertyName] = selected.map((item) => item.name);
    } else {
        delete widgetOptions[propertyName];
    }
    updateWidgetOptions(widgetOptions);
};
const handleUpdateInherit = (index: number, isInherit: boolean) => {
    emit('toggle-inherit', state.schemaList[index].key, isInherit);
};


/* Init */
const initSelectedMenuItems = (propertyName: string): SelectDropdownMenuItem[] => {
    const isInherit = !!props.inheritOptions?.[propertyName]?.enabled;
    if (isInherit) {
        const variableKey = getVariableKeyFromWidgetSchemaProperty(propertyName);
        const variableSchema = props.variablesSchema?.properties?.[variableKey];
        if (variableSchema?.use) {
            return [{ name: variableKey, label: variableSchema.name }];
        }
    }
    const selected = props.widgetOptions[propertyName];
    if (selected) {
        return selected.map((item: string) => ({ name: item }));
    }
    return [];
};
state.selectedList = state.schemaList.map((schema) => initSelectedMenuItems(schema.key));

</script>

<template>
    <p-data-loader :loading="props.loading"
                   class="widget-options-form-wrapper"
    >
        <p-text-button icon-left="ic_refresh"
                       style-type="highlight"
                       class="return-to-initial-settings-button"
                       @click="handleReturnToInitialSettings"
        >
            {{ $t('DASHBOARDS.FORM.RETURN_TO_INITIAL_SETTINGS') }}
        </p-text-button>
        <dashboard-widget-option-dropdown v-for="(schema, i) in state.schemaList"
                                          :key="schema.key"
                                          :label="schema.name ?? schema.key"
                                          :selected="state.selectedList[i]"
                                          :selection-type="schema.selection_type"
                                          :inherit="props.inheritOptions?.[schema.key]?.enabled"
                                          :non-inheritable="schema.non_inheritable"
                                          :deletable="!schema.fixed"
                                          :menu-handlers="getMenuHandlers(schema)"
                                          :variables-schema="props.variablesSchema"
                                          @update:selected="handleUpdateSelected(i, $event)"
                                          @update:inherit="handleUpdateInherit(i, $event)"
                                          @delete="emit('delete-property', schema.key)"
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
