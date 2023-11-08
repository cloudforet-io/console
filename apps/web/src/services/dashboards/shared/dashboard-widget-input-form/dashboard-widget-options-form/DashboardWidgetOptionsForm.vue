<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PDataLoader, PTextButton, PI } from '@spaceone/design-system';
import { v4 as uuidv4 } from 'uuid';

import { red } from '@/styles/colors';

import type { DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardWidgetOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardWidgetOptionDropdown.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import type {
    WidgetOptionsSchema,
    WidgetOptionsSchemaProperty,
} from '@/services/dashboards/widgets/_configs/widget-options-schema';

const props = defineProps<{
    projectId?: string;
    variablesSchema?: DashboardVariablesSchema;
}>();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.state;
const widgetFormGetters = widgetFormStore.getters;

const state = reactive({
    properties: computed<WidgetOptionsSchema['properties']>(() => widgetFormGetters.widgetConfig?.options_schema?.properties ?? {}),
    optionsValidMap: {} as Record<string, boolean>,
    globalOptionTuple: computed<[optionKey: string, schema: WidgetOptionsSchemaProperty] | undefined>(() => {
        const globalOptionTuple = Object.entries(state.properties).find(([, property]) => {
            if ((property as WidgetOptionsSchemaProperty).scope === 'GLOBAL') {
                return true;
            }
            return false;
        });
        return globalOptionTuple;
    }),
    globalOptionName: computed<string | undefined>(() => {
        if (!state.globalOptionTuple) return undefined;
        return state.globalOptionTuple[1].name;
    }),
    globalOptionHasValue: computed<boolean>(() => {
        if (!state.globalOptionTuple) return true;
        const optionKey = state.globalOptionTuple[0];
        return !!widgetFormState.widgetOptions[optionKey];
    }),
    uuid: uuidv4(),
});

/* event handlers */
const handleReturnToInitialSettings = () => {
    widgetFormStore.returnToInitialSettings();
    state.uuid = uuidv4();
};
const handleDeleteProperty = (propertyName: string) => {
    widgetFormStore.updateInheritOption(propertyName, false);
    delete state.optionsValidMap[propertyName];
    widgetFormStore.updateOptionsValidMap({ ...state.optionsValidMap });
};
const handleUpdateIsValid = (propertyName: string, isValid: boolean) => {
    state.optionsValidMap[propertyName] = isValid;
    widgetFormStore.updateOptionsValidMap({ ...state.optionsValidMap });
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
        <template v-if="state.globalOptionHasValue">
            <dashboard-widget-option-dropdown v-for="propertyName in widgetFormState.schemaProperties"
                                              :key="`option-dropdown-${propertyName}-${state.uuid}`"
                                              :property-name="propertyName"
                                              :variables-schema="props.variablesSchema"
                                              :is-valid="state.optionsValidMap[propertyName]"
                                              @update:is-valid="handleUpdateIsValid(propertyName, $event)"
                                              @delete="handleDeleteProperty(propertyName)"
            />
        </template>
        <div v-else
             class="no-global-option-wrapper"
        >
            <p class="no-global-option-header">
                <p-i name="ic_error-filled"
                     height="1.25rem"
                     width="1.25rem"
                     :color="red[400]"
                />
                Unable to add the widget.
            </p>
            <div class="no-global-option-desc">
                There's currently no available {{ state.globalOptionName }} in this domain. <br>
                Please contact the system administrator.
            </div>
        </div>
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
    .no-global-option-wrapper {
        @apply bg-red-100;
        padding: 1rem;
        .no-global-option-header {
            @apply text-label-lg font-bold;
        }
        .no-global-option-desc {
            @apply text-paragraph-md;
        }
    }
}
</style>
