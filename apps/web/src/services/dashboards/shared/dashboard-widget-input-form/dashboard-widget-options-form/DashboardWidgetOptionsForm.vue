<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PDataLoader, PTextButton } from '@spaceone/design-system';
import { v4 as uuidv4 } from 'uuid';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardWidgetOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardWidgetOptionDropdown.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import type {
    WidgetOptionsSchema,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';
import { mergeBaseWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget/merge-base-widget-state';

const props = defineProps<{
    projectId?: string;
    variablesSchema?: DashboardVariablesSchema;
}>();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.state;
const widgetFormGetters = widgetFormStore.getters;
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;

const state = reactive({
    properties: computed<WidgetOptionsSchema['properties']>(() => widgetFormGetters.widgetConfig?.options_schema?.properties ?? {}),
    optionsValidMap: {} as Record<string, boolean>,
    uuid: uuidv4(),
});

/* event handlers */
const handleReturnToInitialSettings = () => {
    const mergedWidgetState = mergeBaseWidgetState({
        inheritOptions: widgetFormGetters.originWidgetInfo?.inherit_options,
        widgetOptions: widgetFormGetters.originWidgetInfo?.widget_options,
        widgetName: widgetFormGetters.originWidgetInfo?.widget_name ?? '',
        dashboardSettings: dashboardDetailState.settings,
        dashboardVariablesSchema: dashboardDetailState.variablesSchema,
        dashboardVariables: dashboardDetailState.variables,
        title: widgetFormGetters.originWidgetInfo?.title,
        schemaProperties: widgetFormGetters.originWidgetInfo?.schema_properties,
    });
    widgetFormStore.updateTitle(mergedWidgetState.title ?? '');
    widgetFormStore.$patch((s) => {
        s.state.widgetOptions = mergedWidgetState.options ?? {};
        s.state.schemaProperties = mergedWidgetState.schemaProperties ?? [];
        s.state.inheritOptions = mergedWidgetState.inheritOptions ?? {};
    });
    state.uuid = uuidv4();
};
const handleDeleteProperty = (propertyName: string) => {
    widgetFormStore.updateInheritOption(propertyName, false);
    delete state.optionsValidMap[propertyName];
    widgetFormStore.updateOptionsValid(Object.values(state.optionsValidMap).every((valid) => valid));
};
const handleUpdateIsValid = (propertyName: string, isValid: boolean) => {
    state.optionsValidMap[propertyName] = isValid;
    widgetFormStore.updateOptionsValid(Object.values(state.optionsValidMap).every((valid) => valid));
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
                                          :key="`option-dropdown-${propertyName}-${state.uuid}`"
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
