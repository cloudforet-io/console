<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, POverlayLayout,
} from '@spaceone/design-system';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PrivateWidgetUpdateParameters } from '@/schema/dashboard/private-widget/api-verbs/update';
import type { PrivateWidgetModel } from '@/schema/dashboard/private-widget/model';
import type { PublicWidgetUpdateParameters } from '@/schema/dashboard/public-widget/api-verbs/update';
import type { PublicWidgetModel } from '@/schema/dashboard/public-widget/model';
import { i18n } from '@/translations';

import WidgetFormOverlayStep1 from '@/common/modules/widgets/_components/WidgetFormOverlayStep1.vue';
import WidgetFormOverlayStep2 from '@/common/modules/widgets/_components/WidgetFormOverlayStep2.vue';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';


const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;
const widgetGenerateState = widgetGenerateStore.state;
const state = reactive({
    sidebarTitle: computed(() => {
        if (widgetGenerateState.overlayType === 'ADD') {
            const _title = i18n.t('COMMON.WIDGETS.ADD_WIDGET');
            let _subTitle = i18n.t('COMMON.WIDGETS.SET_DATA_SOURCE');
            if (widgetGenerateState.overlayStep === 2) {
                _subTitle = i18n.t('COMMON.WIDGETS.SET_CHART_OPTIONS');
            }
            return `${_title} - ${_subTitle}`;
        }
        if (widgetGenerateState.overlayType === 'EDIT') return i18n.t('COMMON.WIDGETS.EDIT_WIDGET');
        return i18n.t('COMMON.WIDGETS.EXPAND_WIDGET');
    }),
    buttonText: computed<TranslateResult>(() => {
        if (widgetGenerateState.overlayStep === 1) return i18n.t('COMMON.WIDGETS.CONFIGURE_WIDGET');
        if (widgetGenerateState.overlayType === 'ADD') return i18n.t('COMMON.WIDGETS.ADD_WIDGET_TO_DASHBOARD');
        return i18n.t('COMMON.WIDGETS.SAVE');
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
    const isPrivate = widgetGenerateState.widgetId.startsWith('private');
    const fetcher = isPrivate
        ? SpaceConnector.clientV2.dashboard.privateWidget.update<PrivateWidgetUpdateParameters, PrivateWidgetModel>
        : SpaceConnector.clientV2.dashboard.publicWidget.update<PublicWidgetUpdateParameters, PublicWidgetModel>;
    if (widgetGenerateState.overlayStep === 1) {
        await fetcher({
            widget_id: widgetGenerateState.widgetId,
            widget_type: widgetGenerateState.selectedWidgetName,
            data_table_id: widgetGenerateState.selectedDataTableId,
        });
        widgetGenerateStore.setOverlayStep(2);
        return;
    }
    await fetcher({
        widget_id: widgetGenerateState.widgetId,
        name: widgetGenerateState.title,
        description: widgetGenerateState.description,
        size: widgetGenerateState.size,
        widget_type: widgetGenerateState.selectedWidgetName,
        data_table_id: widgetGenerateState.selectedDataTableId,
        options: widgetGenerateState.widgetValueMap,
    });
    widgetGenerateStore.setShowOverlay(false);
};
const handleUpdateVisible = (value: boolean) => {
    widgetGenerateStore.setShowOverlay(value);
};
const handleCloseOverlay = () => {
    widgetGenerateStore.setShowOverlay(false);
};

watch(() => widgetGenerateState.showOverlay, (val) => {
    if (!val) widgetGenerateStore.reset();
    else widgetGenerateStore.listDataTable();
});

onUnmounted(() => {
    widgetGenerateStore.reset();
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
                    <p-button style-type="transparent"
                              @click="handleCloseOverlay"
                    >
                        {{ $t('COMMON.WIDGETS.CANCEL') }}
                    </p-button>
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
