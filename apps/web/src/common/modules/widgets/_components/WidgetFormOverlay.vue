<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';

import {
    PButton, PButtonModal, POverlayLayout, PTextButton,
} from '@cloudforet/mirinae';


import type { PrivateWidgetUpdateParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/update';
import type { PublicWidgetUpdateParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/update';
import { i18n } from '@/translations';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormOverlayStep1 from '@/common/modules/widgets/_components/WidgetFormOverlayStep1.vue';
import WidgetFormOverlayStep2 from '@/common/modules/widgets/_components/WidgetFormOverlayStep2.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { useWidgetQuery } from '@/common/modules/widgets/_composables/use-widget-query';
import { UNSUPPORTED_CHARTS_IN_PIVOT } from '@/common/modules/widgets/_constants/widget-constant';
import { sanitizeWidgetOptions } from '@/common/modules/widgets/_helpers/widget-options-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateGetters = widgetGenerateStore.getters;
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    widget,
    api,
    keys,
    fetcher,
} = useWidgetQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const queryClient = useQueryClient();

const state = reactive({
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value?.find((item) => item.data_table_id === widgetGenerateState.selectedDataTableId)),
    sidebarTitle: computed(() => {
        if (widgetGenerateState.overlayType === 'EXPAND') return undefined;
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
        return i18n.t('COMMON.WIDGETS.DONE');
    }),
    isAllValid: computed<boolean>(() => {
        if (widgetGenerateState.overlayStep === 1) return !!widgetGenerateState.selectedDataTableId;
        if (widgetGenerateState.overlayStep === 2) {
            return widgetGenerateGetters.isAllWidgetFormValid;
        }
        return false;
    }),
    warningModalVisible: false,
    warningModalTitle: computed(() => {
        if (widget.value?.state === 'CREATING') return i18n.t('COMMON.WIDGETS.FORM.CREATING_WIDGET_WARNING_MODAL_TITLE');
        if (widget.value?.state === 'INACTIVE' || state.isWidgetOptionsChanged) return i18n.t('COMMON.WIDGETS.FORM.INACTIVE_WIDGET_WARNING_MODAL_TITLE');
        return '';
    }),
    warningModalDescription: computed(() => {
        if (widget.value?.state === 'CREATING') return i18n.t('COMMON.WIDGETS.FORM.CREATING_WIDGET_WARNING_MODAL_DESC');
        if (widget.value?.state === 'INACTIVE' || state.isWidgetOptionsChanged) return i18n.t('COMMON.WIDGETS.FORM.INACTIVE_WIDGET_WARNING_MODAL_DESC');
        return '';
    }),
    isWidgetOptionsChanged: false,
    guideLink: computed(() => {
        const locale = i18n.locale;
        if (locale === 'en') return 'https://cloudforet.io/docs/guides/dashboards';
        return `https://cloudforet.io/${i18n.locale}/docs/guides/dashboards`;
    }),
});

/* Api */
const deleteWidget = async (widgetId: string) => {
    if (!widgetId) return;
    const isPrivate = widgetId?.startsWith('private');
    const _fetcher = isPrivate
        ? api.privateWidgetAPI.delete
        : api.publicWidgetAPI.delete;
    try {
        await _fetcher({
            widget_id: widgetId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const { mutateAsync: updateWidget } = useMutation({
    mutationFn: fetcher.updateWidgetFn,
    onSuccess: (data) => {
        const widgetQueryKey = widgetGenerateState.widgetId?.startsWith('private')
            ? keys.privateWidgetGetQueryKey
            : keys.publicWidgetGetQueryKey;
        queryClient.setQueryData(widgetQueryKey.value, () => data);
    },
    onError: (e) => {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    },
});

/* Event */
const handleClickContinue = async () => {
    if (widgetGenerateState.overlayStep === 1) {
        if (widget.value?.data_table_id !== widgetGenerateState.selectedDataTableId) {
            const _updateParams: PublicWidgetUpdateParameters|PrivateWidgetUpdateParameters = {
                widget_id: widgetGenerateState.widgetId,
                data_table_id: widgetGenerateState.selectedDataTableId,
            };
            if (widget.value?.state === 'ACTIVE') {
                _updateParams.state = 'INACTIVE';
            }
            let widgetType = widget.value?.widget_type ?? 'table';
            if (widgetGenerateState.selectedWidgetName) {
                widgetType = widgetGenerateState.selectedWidgetName;
            }
            if (UNSUPPORTED_CHARTS_IN_PIVOT.includes(widgetType)) {
                widgetType = 'table';
                _updateParams.widget_type = widgetType;
            }
            const _widgetOptions = cloneDeep(widget.value?.options ?? {});
            const sanitizedOptions = sanitizeWidgetOptions(_widgetOptions, widgetType, state.selectedDataTable);
            await updateWidget({
                ..._updateParams,
                options: sanitizedOptions,
            });
        }
        widgetGenerateStore.setOverlayStep(2);
        return;
    }
    if (widget.value?.state === 'CREATING' || widget.value?.state === 'INACTIVE' || state.isWidgetOptionsChanged) {
        state.warningModalVisible = true;
        return;
    }
    widgetGenerateStore.setShowOverlay(false);
};
const handleCloseOverlay = (value: boolean) => {
    if (!value && (widget.value?.state === 'CREATING' || widget.value?.state === 'INACTIVE' || state.isWidgetOptionsChanged)) {
        state.warningModalVisible = true;
        return;
    }
    widgetGenerateStore.setShowOverlay(value);
};
const handleCloseWarningModal = () => {
    state.warningModalVisible = false;
};
const handleConfirmWarningModal = async () => {
    state.warningModalVisible = false;
    if (widget.value?.state === 'CREATING') await deleteWidget(widgetGenerateState.widgetId);
    widgetGenerateStore.reset();
    widgetGenerateStore.setShowOverlay(false);
};
const handleWatchOptionsChanged = (isChanged: boolean) => {
    state.isWidgetOptionsChanged = isChanged;
};
const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Escape' && widgetGenerateState.overlayType === 'EXPAND') {
        widgetGenerateStore.setShowOverlay(false);
    }
};
const handleClickGuideLink = () => { window.open(state.guideLink, '_blank'); };


/* Watcher */
watch(() => widgetGenerateState.showOverlay, async (val) => {
    if (!val && widget.value?.state !== 'CREATING') {
        widgetGenerateStore.setLatestWidgetId(widgetGenerateState.widgetId);
        widgetGenerateStore.reset();
    }
});

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});
</script>

<template>
    <div>
        <p-overlay-layout :visible="widgetGenerateState.showOverlay"
                          :style-type="widgetGenerateState.overlayType === 'EXPAND' ? 'secondary' : 'primary'"
                          size="full"
                          :title="state.sidebarTitle"
                          :hide-header="widgetGenerateState.overlayType === 'EXPAND'"
                          @close="handleCloseOverlay"
        >
            <template #title-right-extra>
                <div v-if="widgetGenerateState.overlayType !== 'EDIT'"
                     class="guide-button-wrapper"
                >
                    <p-text-button style-type="highlight"
                                   icon-right="ic_external-link"
                                   @click="handleClickGuideLink"
                    >
                        {{ $t('COMMON.WIDGETS.DATA_TABLE.GUIDE_LINK_TEXT') }}
                    </p-text-button>
                </div>
            </template>
            <widget-form-overlay-step1 v-if="widgetGenerateState.overlayStep === 1" />
            <widget-form-overlay-step2 v-if="widgetGenerateState.overlayStep === 2"
                                       @watch-options-changed="handleWatchOptionsChanged"
            />
            <template v-if="widgetGenerateState.overlayType !== 'EXPAND'"
                      #footer
            >
                <div class="footer-wrapper">
                    <portal-target name="apply-button" />
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
        <p-button-modal :header-title="state.warningModalTitle"
                        :visible.sync="state.warningModalVisible"
                        size="sm"
                        :fade="true"
                        :backdrop="true"
                        theme-color="alert"
                        @confirm="handleConfirmWarningModal"
                        @cancel="handleCloseWarningModal"
        >
            <template #body>
                <p>{{ state.warningModalDescription }}</p>
            </template>
        </p-button-modal>
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
.guide-button-wrapper {
    padding-left: 0.5rem;
}
</style>
