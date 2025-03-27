<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PCodeEditor, PButton, POverlayLayout,
} from '@cloudforet/mirinae';


import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { MetricCreateParameters } from '@/schema/inventory/metric/api-verbs/create';
import type { MetricUpdateParameters } from '@/schema/inventory/metric/api-verbs/update';
import { METRIC_TYPE } from '@/schema/inventory/metric/constant';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { useFormValidator } from '@/common/composables/form-validator';

import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


const router = useRouter();
const route = useRoute();

const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    metricNameList: computed(() => metricExplorerPageGetters.metrics.map((metric) => metric.name)),
});

const state = reactive({
    loading: false,
    currentMetricId: computed<string>(() => route.params.metricId),
    sidebarTitle: computed<TranslateResult>(() => {
        if (metricExplorerPageState.metricQueryFormMode === 'CREATE') return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ADD_TITLE');
        if (metricExplorerPageState.metricQueryFormMode === 'UPDATE') return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.UPDATE_TITLE');
        return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.VIEW_TITLE');
    }),
    disableConfirmButton: computed<boolean>(() => {
        if (state.loading) return true;
        if (metricExplorerPageState.metricQueryFormMode === 'CREATE') {
            return !isAllValid.value;
        }
        return !!invalidState.name;
        // || !!invalidState.resourceType;
    }),
    visibleSaveModal: false,
});

const {
    forms: {
        name,
        // resourceType,
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
    // resourceType: '',
    unit: '',
    code: '',
}, {
    name: (value: string) => {
        if (!value.length) return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.REQUIRED_FIELD');
        if (storeState.metricNameList.includes(value)) return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.DUPLICATED');
        return true;
    },
    // resourceType: (value: string) => {
    //     if (assetAnalysisPageState.metricQueryFormMode === 'VIEW') return true;
    //     if (!value.length) return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.REQUIRED_FIELD');
    //     const regex = /^.+?\..+?\..+?$/;
    //     if (!regex.test(value)) return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.INVALID_RESOURCE_TYPE');
    //     return true;
    // },
    code: (value: string) => {
        if (!value.length) return i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.REQUIRED_FIELD');
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
            resource_group: RESOURCE_GROUP.WORKSPACE,
            query_options: jsonParsedQuery,
            namespace_id: metricExplorerPageState.selectedNamespace?.name || '',
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ALT_S_CREATE_METRIC'), '');
        metricExplorerPageStore.setShowMetricQueryFormSidebar(false);
        await metricExplorerPageStore.loadMetric(state.currentMetricId);
        await router.replace({
            name: storeState.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: {
                metricId: createdMetric.metric_id,
            },
        }).catch(() => {});
    } catch (e) {
        showErrorMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ALT_E_CREATE_METRIC'), e);
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
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ALT_S_UPDATE_METRIC'), '');
        metricExplorerPageStore.setShowMetricQueryFormSidebar(false);
        await metricExplorerPageStore.loadMetric(state.currentMetricId);
        metricExplorerPageStore.setRefreshMetricData(true);
    } catch (e) {
        showErrorMessage(i18n.t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.ALT_E_UPDATE_METRIC'), e);
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleClose = () => {
    metricExplorerPageStore.setShowMetricQueryFormSidebar(false);
};
const handleCreateCustomMetric = async () => {
    await createCustomMetric();
};
const handleSaveCustomMetric = async () => {
    await updateCustomMetric();
    state.visibleSaveModal = false;
};

watch(() => metricExplorerPageState.showMetricQueryFormSidebar, (visible) => {
    if (visible) {
        if (metricExplorerPageState.metricQueryFormMode !== 'CREATE') {
            setForm('code', JSON.stringify(metricExplorerPageState.metric?.query_options));
            setForm('unit', metricExplorerPageState.metric?.unit);
        }
    } else {
        initForm();
    }
});
</script>

<template>
    <div class="metric-explorer-query-form-overlay">
        <p-overlay-layout :visible="metricExplorerPageState.showMetricQueryFormSidebar"
                          style-type="primary"
                          size="lg"
                          :title="state.sidebarTitle"
                          @close="handleClose"
        >
            <div class="sidebar-contents">
                <p-field-group v-if="metricExplorerPageState.metricQueryFormMode === 'CREATE'"
                               :label="$t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.NAME')"
                               required
                               :invalid="invalidState.name"
                               :invalid-text="invalidTexts.name"
                               class="col-span-8"
                >
                    <p-text-input :value="name"
                                  :invalid="invalidState.name"
                                  block
                                  @update:value="setForm('name', $event)"
                    />
                </p-field-group>
                <!--                <p-field-group :label="$t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.RESOURCE_TYPE')"-->
                <!--                               required-->
                <!--                               :invalid="invalidState.resourceType"-->
                <!--                               :invalid-text="invalidTexts.resourceType"-->
                <!--                               class="col-span-8"-->
                <!--                >-->
                <!--                    <p-text-input v-if="assetAnalysisPageState.metricQueryFormMode === 'CREATE'"-->
                <!--                                  :value="resourceType"-->
                <!--                                  :invalid="invalidState.resourceType"-->
                <!--                                  placeholder="aws.EC2.Instance"-->
                <!--                                  @update:value="setForm('resourceType', $event)"-->
                <!--                    />-->
                <!--                    <p v-else-->
                <!--                       class="text-label-md"-->
                <!--                    >-->
                <!--                        {{ assetAnalysisPageState.metric?.resource_type }}-->
                <!--                    </p>-->
                <!--                </p-field-group>-->
                <p-field-group :label="$t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.UNIT')"
                               :required="metricExplorerPageState.metricQueryFormMode === 'VIEW'"
                               class="col-span-8"
                >
                    <p-text-input v-if="metricExplorerPageState.metricQueryFormMode !== 'VIEW'"
                                  :value="unit"
                                  placeholder="Count"
                                  block
                                  @update:value="setForm('unit', $event)"
                    />
                    <p v-else
                       class="text-label-md"
                    >
                        {{ metricExplorerPageState.metric?.unit }}
                    </p>
                </p-field-group>
                <p-field-group class="query-field"
                               :label="$t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.QUERY_OPTION')"
                               required
                >
                    <p-code-editor :code="code"
                                   :read-only="metricExplorerPageState.metricQueryFormMode === 'VIEW'"
                                   @update:code="setForm('code', $event)"
                    />
                </p-field-group>
            </div>
            <template v-if="metricExplorerPageState.metricQueryFormMode !== 'VIEW'"
                      #footer
            >
                <div class="footer-wrapper">
                    <p-button style-type="transparent"
                              @click="handleClose"
                    >
                        {{ $t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.CANCEL') }}
                    </p-button>
                    <template v-if="metricExplorerPageState.metricQueryFormMode === 'CREATE'">
                        <p-button style-type="primary"
                                  :disabled="state.disableConfirmButton"
                                  @click="handleCreateCustomMetric"
                        >
                            {{ $t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.CONFIRM') }}
                        </p-button>
                    </template>
                    <template v-else>
                        <p-button style-type="primary"
                                  :disabled="state.disableConfirmButton"
                                  @click="() => {state.visibleSaveModal = true}"
                        >
                            {{ $t('INVENTORY.METRIC_EXPLORER.CUSTOM_METRIC.SAVE') }}
                        </p-button>
                    </template>
                </div>
            </template>
        </p-overlay-layout>
        <delete-modal :header-title="$t('INVENTORY.METRIC_EXPLORER.DETAIL.SAVE_TITLE')"
                      :visible.sync="state.visibleSaveModal"
                      :disabled="state.loading"
                      @confirm="handleSaveCustomMetric"
        >
            {{ $t('INVENTORY.METRIC_EXPLORER.DETAIL.SAVE_DESC') }}
        </delete-modal>
    </div>
</template>

<style scoped lang="postcss">
.metric-explorer-query-form-overlay {
    .sidebar-contents {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0 1.5rem;

        .query-field {
            @apply col-span-12;
            flex: 1;
            overflow: hidden;

            :deep(.p-text-editor) {
                height: 100%;
                .p-data-loader {
                    height: 100%;
                }
                .CodeMirror {
                    height: 100%;
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
