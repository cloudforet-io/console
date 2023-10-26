<script setup lang="ts">
import {
    reactive, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import {
    useWidgetTitleInput,
} from '@/services/dashboards/shared/dashboard-widget-input-form/composables/use-widget-title-input';
import DashboardWidgetOptionsForm
    from '@/services/dashboards/shared/dashboard-widget-input-form/dashboard-widget-options-form/DashboardWidgetOptionsForm.vue';
import DashboardWidgetMoreOptions
    from '@/services/dashboards/shared/dashboard-widget-input-form/DashboardWidgetMoreOptions.vue';
import { useWidgetFormStore } from '@/services/dashboards/shared/dashboard-widget-input-form/widget-form-store';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';

interface Props {
    widgetConfigId?: string;
    widgetKey?: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;
const widgetFormStore = useWidgetFormStore();

const state = reactive({
    isFocused: false,
});


/* title form validation */
const {
    title, resetTitle, updateTitle, isTitleInvalid, titleInvalidText,
} = useWidgetTitleInput();


/* states init */
const initSchemaAndFormData = (widgetConfigId: string, widgetKey?: string) => {
    // init widgetInfo - refined widget info
    widgetFormStore.initWidgetForm(widgetKey, widgetConfigId);

    // init title
    updateTitle(widgetFormStore.mergedWidgetInfo?.title);
};
watch([() => props.widgetConfigId, () => props.widgetKey], ([widgetConfigId, widgetKey]) => {
    // do nothing if still loading
    if (!widgetConfigId) return;

    // reset states
    widgetFormStore.$reset();
    resetTitle();

    initSchemaAndFormData(widgetConfigId, widgetKey);

    // set focus on text input
    state.isFocused = true;
}, { immediate: true });

</script>

<template>
    <div class="dashboard-widget-input-form">
        <p-field-group :label="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.LABEL_NAME')"
                       :invalid="isTitleInvalid"
                       :invalid-text="titleInvalidText"
                       class="name-field"
                       required
        >
            <p-text-input :value="title"
                          :is-focused.sync="state.isFocused"
                          :invalid="isTitleInvalid"
                          :placeholder="$t('DASHBOARDS.CUSTOMIZE.ADD_WIDGET.NAME_PLACEHOLDER')"
                          class="input"
                          @update:value="updateTitle"
            />
        </p-field-group>
        <div v-if="widgetFormStore.widgetConfig?.description?.translation_id"
             class="description-text"
        >
            {{ $t(widgetFormStore.widgetConfig.description.translation_id) }}
        </div>

        <!-- TODO: update props binding after updating widget config options_schema -->
        <dashboard-widget-options-form :project-id="dashboardDetailState.projectId"
                                       :variables-schema="dashboardDetailState.variablesSchema"
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

    .more-option-container {
        z-index: 2;
    }
}
</style>
