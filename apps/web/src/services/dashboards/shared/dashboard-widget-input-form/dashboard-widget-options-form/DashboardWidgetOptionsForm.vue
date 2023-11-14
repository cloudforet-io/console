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
    uuid: uuidv4(),
});

/* event handlers */
const handleReturnToInitialSettings = () => {
    widgetFormStore.returnToInitialSettings();
    state.uuid = uuidv4();
};
const handleDeleteProperty = (propertyName: string) => {
    widgetFormStore.updateInheritOption(propertyName, false);
    const optionsValidMap = widgetFormState.optionsValidMap;
    delete optionsValidMap[propertyName];
    widgetFormStore.updateOptionsValidMap(optionsValidMap);
};
</script>

<template>
    <div class="dashboard-widget-options-form">
        <p-text-button icon-left="ic_refresh"
                       style-type="highlight"
                       class="return-to-initial-settings-button"
                       @click="handleReturnToInitialSettings"
        >
            {{ $t('DASHBOARDS.FORM.RETURN_TO_INITIAL_SETTINGS') }}
        </p-text-button>
        <p-data-loader class="widget-options-form-wrapper"
                       :loading="!widgetFormGetters.isAllOptionsInitiated"
                       :data="widgetFormGetters.globalOptionInfo ? widgetFormGetters.globalOptionInfo.ready : true"
        >
            <dashboard-widget-option-dropdown v-for="propertyName in widgetFormState.schemaProperties"
                                              :key="`option-dropdown-${propertyName}-${state.uuid}`"
                                              :property-name="propertyName"
                                              :variables-schema="props.variablesSchema"
                                              @delete="handleDeleteProperty(propertyName)"
            />
            <template #no-data>
                <div v-if="widgetFormGetters.globalOptionInfo && widgetFormGetters.globalOptionInfo.initiated"
                     class="no-global-option-wrapper"
                >
                    <p class="no-global-option-header">
                        <p-i name="ic_error-filled"
                             height="1.25rem"
                             width="1.25rem"
                             :color="red[400]"
                        />
                        {{ $t('DASHBOARDS.FORM.UNABLE_TO_ADD_WIDGET') }}
                    </p>
                    <div class="no-global-option-desc">
                        {{ $t('DASHBOARDS.FORM.UNABLE_TO_ADD_WIDGET_DESC', {field: widgetFormGetters.globalOptionInfo?.name}) }} <br>
                        {{ $t('DASHBOARDS.FORM.UNABLE_TO_ADD_WIDGET_DESC2') }}
                    </div>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<style scoped lang="postcss">
.dashboard-widget-options-form {
    display: flex;
    flex-direction: column;
    height: 100%;
    .return-to-initial-settings-button {
        padding: 1rem 0;
        margin-left: auto;
    }
    .widget-options-form-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 15rem;
        .no-global-option-wrapper {
            @apply bg-red-100 text-gray-900;
            align-self: flex-start;
            padding: 1rem;
            .no-global-option-header {
                @apply text-label-lg font-bold;
            }
            .no-global-option-desc {
                @apply text-paragraph-md;
            }
        }
    }
}
</style>
