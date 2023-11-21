<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import DashboardWidgetMoreOptions
    from '@/services/dashboards/components/DashboardWidgetMoreOptions.vue';
import DashboardWidgetOptionsForm
    from '@/services/dashboards/components/DashboardWidgetOptionsForm.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import { useWidgetFormStore } from '@/services/dashboards/stores/widget-form-store';

interface Props {
    widgetConfigId?: string;
    widgetKey?: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;
const widgetFormStore = useWidgetFormStore();
const widgetFormGetters = widgetFormStore.getters;

const state = reactive({
    isFocused: false,
});


/* title form validation */
const handleUpdateTitle = (value: string) => {
    if (value === widgetFormGetters.title) return;
    widgetFormStore.updateTitle(value);
};

/* states init */
watch([() => props.widgetConfigId, () => props.widgetKey], ([widgetConfigId, widgetKey]) => {
    // do nothing if still loading
    if (!widgetConfigId) return;

    // reset states
    widgetFormStore.resetAll();

    widgetFormStore.initWidgetForm(widgetKey, widgetConfigId);

    // set focus on text input
    state.isFocused = true;
}, { immediate: true });

</script>

<template>
    <div class="dashboard-widget-input-form">
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_NAME')"
                       :invalid="!widgetFormGetters.isTitleValid"
                       :invalid-text="widgetFormGetters.titleInvalidText"
                       class="name-field"
                       required
        >
            <p-text-input :value="widgetFormGetters.title"
                          :is-focused.sync="state.isFocused"
                          :invalid="!widgetFormGetters.isTitleValid"
                          :placeholder="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.NAME_PLACEHOLDER')"
                          class="input"
                          @update:value="handleUpdateTitle"
            />
        </p-field-group>
        <div v-if="widgetFormGetters.widgetConfig?.description?.translation_id"
             class="description-text"
        >
            {{ $t(widgetFormGetters.widgetConfig.description.translation_id) }}
        </div>

        <dashboard-widget-options-form :key="`${props.widgetConfigId}-${props.widgetKey}`"
                                       :project-id="dashboardDetailState.projectId"
                                       :variables-schema="dashboardDetailState.variablesSchema"
                                       :variables="dashboardDetailState.variables"
        />

        <dashboard-widget-more-options class="more-option-container" />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-widget-input-form {
    @apply flex flex-col overflow-hidden;
    height: 100%;
    gap: 1rem;
    overflow-y: auto;

    /* custom design-system component - p-field-group */

    /* custom design-system component - p-field-title */
    :deep(.name-field) {
        &.p-field-group {
            margin: 0;
            .p-field-title {
                .title-wrapper .title {
                    @apply text-label-md;
                    display: flex;
                    align-items: center;
                }
            }
            .input {
                width: 100%;
            }
        }
    }
    .description-text {
        @apply bg-gray-100 text-gray-600 rounded-md;
        font-size: 0.875rem;
        font-weight: 400;
        padding: 0.75rem;
    }
}
</style>
