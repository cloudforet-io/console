<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PDataLoader, PTextButton } from '@spaceone/design-system';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardWidgetOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardWidgetOptionDropdown.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type {
    WidgetOptionsSchema,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';

const props = defineProps<{
    projectId?: string;
    variablesSchema?: DashboardVariablesSchema;
}>();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.$state;

const state = reactive({
    properties: computed<WidgetOptionsSchema['properties']>(() => widgetFormStore.widgetConfig?.options_schema?.properties ?? {}),
    optionsValidMap: {} as Record<string, boolean>,
});

/* event handlers */
const handleReturnToInitialSettings = () => {
    // TODO: implement
};
const handleDeleteProperty = (propertyName: string) => {
    widgetFormStore.updateInheritOption(propertyName, false);
    delete state.optionsValidMap[propertyName];
    widgetFormStore.$patch({
        isOptionsValid: Object.values(state.optionsValidMap).every((valid) => valid),
    });
};
const handleUpdateIsValid = (propertyName: string, isValid: boolean) => {
    state.optionsValidMap[propertyName] = isValid;
    widgetFormStore.$patch({
        isOptionsValid: Object.values(state.optionsValidMap).every((valid) => valid),
    });
};
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
        <dashboard-widget-option-dropdown v-for="propertyName in widgetFormState.schemaProperties"
                                          :key="`option-dropdown-${propertyName}`"
                                          :property-name="propertyName"
                                          :variables-schema="props.variablesSchema"
                                          :is-valid="state.optionsValidMap[propertyName]"
                                          @update:is-valid="handleUpdateIsValid(propertyName, $event)"
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
