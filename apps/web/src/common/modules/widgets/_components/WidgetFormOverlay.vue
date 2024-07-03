<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, POverlayLayout,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import WidgetFormOverlayStep1 from '@/common/modules/widgets/_components/WidgetFormOverlayStep1.vue';
import WidgetFormOverlayStep2 from '@/common/modules/widgets/_components/WidgetFormOverlayStep2.vue';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';


const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;
const widgetGenerateState = widgetGenerateStore.state;
const state = reactive({
    sidebarTitle: computed(() => {
        if (widgetGenerateState.overlayType === 'EXPAND') return i18n.t('COMMON.WIDGETS.EXPAND_WIDGET');
        let _title = i18n.t('COMMON.WIDGETS.ADD_WIDGET');
        if (widgetGenerateState.overlayType === 'EDIT') {
            _title = i18n.t('COMMON.WIDGETS.EDIT_WIDGET');
        }
        let _subTitle = i18n.t('COMMON.WIDGETS.SET_DATA_SOURCE');
        if (widgetGenerateState.overlayStep === 2) {
            _subTitle = i18n.t('COMMON.WIDGETS.SET_CHART_OPTIONS');
        }
        return `${_title} - ${_subTitle}`;
    }),
    buttonText: computed<TranslateResult>(() => {
        if (widgetGenerateState.overlayStep === 1) return i18n.t('COMMON.WIDGETS.CONFIGURE_WIDGET');
        if (widgetGenerateState.overlayType === 'ADD') return i18n.t('COMMON.WIDGETS.ADD_WIDGET_TO_DASHBOARD');
        return i18n.t('COMMON.WIDGETS.DONE');
    }),
    isAllValid: computed<boolean>(() => {
        if (widgetGenerateState.overlayStep === 1) return !!widgetGenerateState.selectedDataTableId;
        if (widgetGenerateState.overlayStep === 2) {
            return widgetGenerateGetters.isAllWidgetFormValid;
        }
        return false;
    }),
});

/* Event */
const handleClickContinue = async () => {
    if (widgetGenerateState.overlayStep === 1) {
        if (widgetGenerateState.widget?.data_table_id !== widgetGenerateState.selectedDataTableId) {
            await widgetGenerateStore.updateWidget({
                widget_id: widgetGenerateState.widgetId,
                data_table_id: widgetGenerateState.selectedDataTableId,
            });
        }
        widgetGenerateStore.setOverlayStep(2);
        return;
    }
    widgetGenerateStore.setShowOverlay(false);
};
const handleUpdateVisible = (value: boolean) => {
    widgetGenerateStore.setShowOverlay(value);
};

/* Watcher */
watch(() => widgetGenerateState.showOverlay, (val) => {
    if (!val) {
        widgetGenerateStore.setLatestWidgetId(widgetGenerateState.widgetId);
        widgetGenerateStore.reset();
    } else if (widgetGenerateState.overlayType !== 'ADD') {
        widgetGenerateStore.listDataTable();
    }
});
</script>

<template>
    <div>
        <p-overlay-layout :visible="widgetGenerateState.showOverlay"
                          style-type="primary"
                          size="full"
                          :title="state.sidebarTitle"
                          @update:visible="handleUpdateVisible"
        >
            <widget-form-overlay-step1 v-if="widgetGenerateState.overlayStep === 1" />
            <widget-form-overlay-step2 v-if="widgetGenerateState.overlayStep === 2" />
            <template v-if="widgetGenerateState.overlayType !== 'EXPAND'"
                      #footer
            >
                <div class="footer-wrapper">
                    <p-button :style-type="widgetGenerateState.overlayStep === 1 ? 'substitutive' : 'primary'"
                              :icon-right="widgetGenerateState.overlayStep === 1 ? 'ic_arrow-right' : undefined"
                              :disabled="!state.isAllValid"
                              @click="handleClickContinue"
                    >
                        {{ state.buttonText }}
                    </p-button>
                </div>
            </template>
        </p-overlay-layout>
    </div>
</template>

<style lang="scss" scoped>
.footer-wrapper {
    @apply border-t border-gray-200;
    display: flex;
    align-items: center;
    justify-content: right;
    gap: 0.5rem;
    padding-right: 1.5rem;
}
</style>
