<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PFieldGroup, PTextInput, PTextEditor, PButton, POverlayLayout,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MetricCreateParameters } from '@/schema/inventory/metric/api-verbs/create';
import type { MetricUpdateParameters } from '@/schema/inventory/metric/api-verbs/update';
import { METRIC_TYPE } from '@/schema/inventory/metric/constant';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import AssetAnalysisNameFormModal from '@/services/asset-inventory/components/AssetAnalysisNameFormModal.vue';
import { NAME_FORM_MODAL_TYPE } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';


const router = useRouter();
const route = useRoute();
const { getProperRouteLocation } = useProperRouteLocation();
const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const assetAnalysisPageGetters = assetAnalysisPageStore.getters;

const storeState = reactive({
    metricNameList: computed(() => assetAnalysisPageGetters.metrics.map((metric) => metric.name)),
});

const state = reactive({
    loading: false,
    currentMetricId: computed<string>(() => route.params.metricId),
    sidebarTitle: computed<TranslateResult>(() => {
        if (assetAnalysisPageState.metricQueryFormMode === 'CREATE') return i18n.t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.ADD_TITLE');
        return i18n.t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.UPDATE_TITLE');
    }),
    disableConfirmButton: computed<boolean>(() => {
        if (state.loading) return true;
        if (assetAnalysisPageState.metricQueryFormMode === 'CREATE') return !isAllValid;
        return !!invalidState.name;
    }),
    saveAsModalVisible: false,
    visibleSaveModal: false,
});

const {
    forms: {
        name,
        unit,
        code,
    },
    invalidState,
    invalidTexts,
    isAllValid,
    setForm,
    initForm,
} = useFormValidator({
    name: '',
    unit: '',
    code: '',
}, {
    name: (value: string) => {
        if (!value.length) return i18n.t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.REQUIRED_FIELD');
        if (storeState.metricNameList.includes(value)) return i18n.t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.DUPLICATED');
        return true;
    },
    code: (value: string) => {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    },
});

/* Api */
const createCustomMetric = async () => {
    try {
        state.loading = true;
        const jsonParsedQuery = JSON.parse(code.value.trim());
        const createdMetric = await SpaceConnector.clientV2.inventory.metric.create<MetricCreateParameters, MetricModel>({
            name: name.value,
            unit: unit.value,
            metric_type: METRIC_TYPE.GAUGE,
            resource_type: 'inventory.CloudService',
            query_options: jsonParsedQuery,
            namespace_id: assetAnalysisPageGetters.namespaceId || '',
        });
        showSuccessMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.ALT_S_CREATE_METRIC'), '');
        assetAnalysisPageStore.setShowMetricQueryFormSidebar(false);
        await assetAnalysisPageStore.loadMetric(state.currentMetricId);
        await router.replace(getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL._NAME,
            params: {
                metricId: createdMetric.metric_id,
            },
        })).catch(() => {});
    } catch (e) {
        showErrorMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.ALT_E_CREATE_METRIC'), e);
    } finally {
        state.loading = false;
    }
};
const updateCustomMetric = async () => {
    try {
        state.loading = true;
        const jsonParsedQuery = JSON.parse(code.value.trim());
        await SpaceConnector.clientV2.inventory.metric.update<MetricUpdateParameters, MetricModel>({
            metric_id: state.currentMetricId,
            unit: unit.value,
            query_options: jsonParsedQuery,
        });
        showSuccessMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.ALT_S_UPDATE_METRIC'), '');
        assetAnalysisPageStore.setShowMetricQueryFormSidebar(false);
        await assetAnalysisPageStore.loadMetric(state.currentMetricId);
    } catch (e) {
        showErrorMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.ALT_E_UPDATE_METRIC'), e);
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleClose = () => {
    assetAnalysisPageStore.setShowMetricQueryFormSidebar(false);
};
const handleCreateCustomMetric = async () => {
    await createCustomMetric();
};
const handleSaveAsCustomMetric = async (_name: string) => {
    setForm('name', _name);
    await createCustomMetric();
};
const handleOpenCustomMetricNameFormModal = () => {
    state.saveAsModalVisible = true;
};
const handleSaveCustomMetric = async () => {
    await updateCustomMetric();
    state.visibleSaveModal = false;
};

watch(() => assetAnalysisPageState.showMetricQueryFormSidebar, (visible) => {
    if (visible) {
        if (assetAnalysisPageState.metricQueryFormMode === 'UPDATE') {
            setForm('code', JSON.stringify(assetAnalysisPageState.metric?.query_options));
            setForm('unit', assetAnalysisPageState.metric?.unit || '');
        }
    } else {
        initForm();
    }
});
</script>

<template>
    <div class="asset-analysis-query-form-overlay">
        <p-overlay-layout :visible="assetAnalysisPageState.showMetricQueryFormSidebar"
                          style-type="primary"
                          size="lg"
                          :title="state.sidebarTitle"
                          @update:visible="handleClose"
        >
            <div class="sidebar-contents">
                <p-field-group v-if="assetAnalysisPageState.metricQueryFormMode === 'CREATE'"
                               :label="$t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.NAME')"
                               required
                               :invalid="invalidState.name"
                               :invalid-text="invalidTexts.name"
                               class="col-span-8"
                >
                    <p-text-input :value="name"
                                  :invalid="invalidState.name"
                                  @update:value="setForm('name', $event)"
                    />
                </p-field-group>
                <p-field-group :label="$t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.UNIT')"
                               class="col-span-8"
                >
                    <p-text-input :value="unit"
                                  @update:value="setForm('unit', $event)"
                    />
                </p-field-group>
                <p-field-group class="query-field"
                               required
                >
                    <p-text-editor :code="code"
                                   @update:code="setForm('code', $event)"
                    />
                </p-field-group>
            </div>
            <template #footer>
                <div class="footer-wrapper">
                    <p-button style-type="transparent"
                              @click="handleClose"
                    >
                        {{ $t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.CANCEL') }}
                    </p-button>
                    <template v-if="assetAnalysisPageState.metricQueryFormMode === 'CREATE'">
                        <p-button style-type="primary"
                                  :disabled="state.disableConfirmButton"
                                  @click="handleCreateCustomMetric"
                        >
                            {{ $t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.CONFIRM') }}
                        </p-button>
                    </template>
                    <template v-else>
                        <p-button style-type="tertiary"
                                  :disabled="state.disableConfirmButton"
                                  @click="handleOpenCustomMetricNameFormModal"
                        >
                            {{ $t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.SAVE_AS') }}
                        </p-button>
                        <p-button style-type="primary"
                                  :disabled="state.disableConfirmButton"
                                  @click="() => {state.visibleSaveModal = true}"
                        >
                            {{ $t('INVENTORY.ASSET_ANALYSIS.CUSTOM_METRIC.SAVE') }}
                        </p-button>
                    </template>
                </div>
            </template>
        </p-overlay-layout>
        <asset-analysis-name-form-modal :visible.sync="state.saveAsModalVisible"
                                        :type="NAME_FORM_MODAL_TYPE.SAVE_AS_CUSTOM_METRIC"
                                        @save-as="handleSaveAsCustomMetric"
        />
        <delete-modal :header-title="$t('INVENTORY.ASSET_ANALYSIS.DETAIL.SAVE_TITLE')"
                      :visible.sync="state.visibleSaveModal"
                      :disabled="state.loading"
                      @confirm="handleSaveCustomMetric"
        >
            {{ $t('INVENTORY.ASSET_ANALYSIS.DETAIL.SAVE_DESC') }}
        </delete-modal>
    </div>
</template>

<style scoped lang="postcss">
.asset-analysis-query-form-overlay {
    .sidebar-contents {
        width: 100%;
        padding: 0 1.5rem;
        :deep(.p-text-input) {
            width: 100%;
        }

        .query-field {
            @apply border rounded-lg col-span-12;
            overflow: hidden;

            :deep(.p-text-editor) {
                .CodeMirror {
                    height: 30rem;
                }
            }
        }
    }
    .footer-wrapper {
        @apply border-t border-gray-200;
        display: flex;
        justify-content: flex-end;
        width: 100%;
        gap: 1rem;
        padding: 0.75rem 1rem;
    }

    @screen lg {
        .footer-wrapper {
            bottom: calc($top-bar-height + $gnb-toolbox-height);
        }
    }
}

$footer-height: 57px;

/* custom design-system component - p-sidebar */
:deep(.p-sidebar) {
    .sidebar-wrapper {
        height: 100%;
        padding-top: 0;
        padding-bottom: $footer-height;
        .inner {
            padding-top: 2rem;
            padding-bottom: 1rem;
        }
    }

    @screen lg {
        .sidebar-wrapper {
            padding-bottom: calc($top-bar-height + $gnb-toolbox-height + $footer-height);
        }
    }
}

/* transition */
.slide-up-enter-active {
    transition: all 0.3s ease;
}
.slide-up-leave-active {
    transition: all 0.3s ease-out;
}
.slide-up-enter, .slide-up-leave-to {
    transform: translateY(100px);
    opacity: 0;
}
.slide-left-leave-active,
.slide-left-enter-active {
    transition: all 0.3s ease;
}
.slide-left-enter {
    transform: translate(100%, 0);
}
.slide-left-leave {
    transform: translate(0, 0);
}
.slide-left-leave-to {
    transform: translate(100%, 0);
}
.slide-left-enter-to {
    transform: translate(0, 0);
}
</style>
