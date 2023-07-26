<template>
    <div class="widget-view-mode-sidebar">
        <p-sidebar :visible="state.proxyVisible"
                   style-type="primary"
                   size="md"
                   is-fixed-size
                   @close="handleCloseSidebar"
        >
            <main class="main">
                <slot />
            </main>
            <template #title>
                <span class="sidebar-title">{{ $t('DASHBOARDS.VIEW_MODE.EDIT_WIDGET_OPTION') }}</span> <br>
            </template>
            <template #sidebar>
                <div class="sidebar-contents">
                    <dashboard-widget-input-form :widget-config-id="props.widgetConfigId"
                                                 :widget-key="props.widgetKey"
                    />
                </div>
            </template>
            <template #footer>
                <div class="footer-wrapper">
                    <p-button style-type="transparent"
                              @click="handleCloseSidebar"
                    >
                        {{ $t('DASHBOARDS.VIEW_MODE.CANCEL') }}
                    </p-button>
                    <p-button style-type="primary"
                              :disabled="!dashboardDetailStore.isWidgetLayoutValid || !dashboardDetailState.isNameValid"
                              @click="handleClickSaveButton"
                    >
                        {{ $t('DASHBOARDS.VIEW_MODE.SAVE') }}
                    </p-button>
                </div>
            </template>
        </p-sidebar>
    </div>
</template>

<script setup lang="ts">
import {
    defineEmits, onUnmounted, reactive, watch,
} from 'vue';

import {
    PButton, PSidebar,
} from '@spaceone/design-system';

import { store } from '@/store';

import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardWidgetInputForm
    from '@/services/dashboards/shared/dashboard-widget-input-form/DashboardWidgetInputForm.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/store/dashboard-detail-info';
import { useWidgetFormStore } from '@/services/dashboards/store/widget-form';


interface Props {
    visible: boolean;
    widgetKey?: string;
    widgetConfigId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    widgetKey: undefined,
    widgetConfigId: undefined,
});
const emit = defineEmits<{(e: string, value: string): void,
    (e: 'save'): void,
}>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.$state;
const widgetFormStore = useWidgetFormStore();
// const widgetFormState = widgetFormStore.$state;
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});

/* Event */
const handleClickSaveButton = () => {
    emit('save');
    state.proxyVisible = false;
};
const handleCloseSidebar = () => {
    state.proxyVisible = false;
};

watch(() => props.widgetKey, (widgetKey) => {
    if (widgetKey) widgetFormStore.initWidgetForm(widgetKey);
});
onUnmounted(() => {
    store.dispatch('display/hideSidebar');
});
</script>

<style lang="postcss" scoped>
.widget-view-mode-sidebar {
    padding-top: 0.125rem;

    .sidebar-title {
        margin-bottom: 0.75rem;
        font-size: 1.125rem;
        line-height: 125%;
    }
    .sidebar-contents {
        position: relative;
        gap: 1.5625rem;
        font-size: 0.875rem;
        line-height: 125%;
    }
    .footer-wrapper {
        @apply grid grid-cols-12 border-t border-gray-200;
        position: absolute;
        bottom: 6rem;
        width: 100%;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        button {
            @apply col-span-6;
        }
    }
}
$footer-height: 57px;
$header-height: 6rem;

/* custom design-system component - p-sidebar */
:deep(.p-sidebar) {
    .sidebar-wrapper {
        height: calc(100vh - $header-height);
        padding-top: 0;
        padding-bottom: $footer-height;
        .inner {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
    }
}
</style>
