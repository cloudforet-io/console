<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PDataLoader, PTextButton, PI } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { red } from '@/styles/colors';

import type { DashboardVariables, DashboardVariablesSchema } from '@/services/dashboards/config';
import DashboardWidgetOptionDropdown
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardWidgetOptionDropdown.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';

const props = defineProps<{
    projectId?: string;
    variablesSchema?: DashboardVariablesSchema;
    variables?: DashboardVariables;
}>();

const widgetFormStore = useWidgetFormStore();
const widgetFormState = widgetFormStore.state;
const widgetFormGetters = widgetFormStore.getters;

const state = reactive({
    loading: computed(() => {
        // in global option existing case,
        if (widgetFormGetters.globalOptionInfo) {
            // if global option is not initiated, regard it as loading
            if (!widgetFormGetters.globalOptionInfo.initiated) return true;

            // if global option is initiated and has value,
            if (widgetFormGetters.globalOptionInfo.initiatedAndHasValue) {
                // decide loading state by checking if all options are initiated
                return !widgetFormGetters.isAllOptionsInitiated;
            }

            // if global option is initiated but has no value, regard it as still loading
            return false;
        }

        // in no global option case, decide loading state by checking if all options are initiated
        return !widgetFormGetters.isAllOptionsInitiated;
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
    const _optionsValidMap = cloneDeep(widgetFormState.optionsValidMap);
    delete _optionsValidMap[propertyName];
    widgetFormStore.updateOptionsValidMap(_optionsValidMap);
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
                       :loading="state.loading"
                       :data="widgetFormGetters.globalOptionInfo ? widgetFormGetters.globalOptionInfo.initiatedAndHasValue : true"
        >
            <dashboard-widget-option-dropdown v-for="propertyName in widgetFormState.schemaProperties"
                                              :key="`option-dropdown-${propertyName}-${state.uuid}`"
                                              :property-name="propertyName"
                                              :variables-schema="props.variablesSchema"
                                              :variables="props.variables"
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
                             class="header-icon"
                        />
                        {{ $t('DASHBOARDS.FORM.UNABLE_TO_ADD_WIDGET') }}
                    </p>
                    <div class="no-global-option-desc">
                        {{ $t('DASHBOARDS.FORM.UNABLE_TO_ADD_WIDGET_DESC', {field: widgetFormGetters.globalOptionInfo?.name}) }} <br>
                        {{ $t('DASHBOARDS.FORM.UNABLE_TO_ADD_WIDGET_DESC2') }}
                    </div>
                </div>
                <div v-else />
            </template>
        </p-data-loader>
    </div>
</template>

<style scoped lang="postcss">
.dashboard-widget-options-form {
    display: flex;
    flex-direction: column;
    .return-to-initial-settings-button {
        padding: 1rem 0;
        margin-left: auto;
    }
    .widget-options-form-wrapper {
        min-height: 15rem;
        flex-grow: 1;
        flex-shrink: 0;
        .no-global-option-wrapper {
            @apply bg-red-100 text-gray-900;
            align-self: flex-start;
            padding: 1rem;
            width: 100%;
            .no-global-option-header {
                @apply text-label-lg font-bold;
                display: flex;
                align-items: center;
                margin-bottom: 0.25rem;
                .header-icon {
                    margin-right: 0.25rem;
                }
            }
            .no-global-option-desc {
                @apply text-paragraph-md;
                text-align: left;
            }
        }
    }
}
</style>
