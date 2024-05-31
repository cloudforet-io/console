<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core/index';
import { computed, reactive, ref } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    useContextMenuController, PHeading, PIconButton, PButton, PContextMenu, PI,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { MetricExampleDeleteParameters } from '@/schema/inventory/metric-example/api-verbs/delete';
import type { MetricExampleUpdateParameters } from '@/schema/inventory/metric-example/api-verbs/update';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import type { MetricCreateParameters } from '@/schema/inventory/metric/api-verbs/create';
import type { MetricDeleteParameters } from '@/schema/inventory/metric/api-verbs/delete';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { gray } from '@/styles/colors';

import AssetAnalysisNameFormModal from '@/services/asset-inventory/components/AssetAnalysisNameFormModal.vue';
import AssetAnalysisQueryFormSidebar from '@/services/asset-inventory/components/AssetAnalysisQueryFormSidebar.vue';
import { NAME_FORM_MODAL_TYPE } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';


const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const rightPartRef = ref<HTMLElement|null>(null);
const router = useRouter();
const route = useRoute();
const { getProperRouteLocation } = useProperRouteLocation();

const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const assetAnalysisPageGetters = assetAnalysisPageStore.getters;

const state = reactive({
    currentMetricId: computed<string>(() => route.params.metricId),
    currentMetricExampleId: computed<string|undefined>(() => route.params.metricExampleId),
    currentMetricExample: computed<MetricExampleModel|undefined>(() => assetAnalysisPageState.metricExamples.find((d) => d.example_id === state.currentMetricExampleId)),
    isManagedMetric: computed<boolean>(() => (assetAnalysisPageState.metric?.is_managed && !state.currentMetricExampleId) || false),
    metricNameFormModalVisible: false,
    metricDeleteModalVisible: false,
    loadingDuplicate: false,
    selectedNameFormModalType: undefined as string|undefined,
    saveDropdownMenuItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'saveAs',
            icon: 'ic_disk-edit-filled',
            label: `${i18n.t('INVENTORY.ASSET_ANALYSIS.SAVE_AS')}...`,
        },
    ])),
    pageTitle: computed<string|TranslateResult>(() => {
        if (assetAnalysisPageState.metricLoading) return '';
        if (assetAnalysisPageState.metric) {
            return state.currentMetricExample?.name || assetAnalysisPageState.metric.name;
        }
        return i18n.t('INVENTORY.ASSET_ANALYSIS.ASSET_ANALYSIS');
    }),
    deleteModalTitle: computed(() => {
        if (state.currentMetricExampleId) {
            return i18n.t('INVENTORY.ASSET_ANALYSIS.DELETE_METRIC_EXAMPLE');
        }
        return i18n.t('INVENTORY.ASSET_ANALYSIS.DELETE_CUSTOM_METRIC');
    }),
    editQueryTitle: computed<TranslateResult>(() => {
        if (state.isManagedMetric || state.currentMetricExampleId) {
            return i18n.t('INVENTORY.ASSET_ANALYSIS.VIEW_QUERY');
        }
        return i18n.t('INVENTORY.ASSET_ANALYSIS.EDIT_QUERY');
    }),
    editQueryButtonIcon: computed<string>(() => {
        if (state.isManagedMetric || state.currentMetricExampleId) {
            return 'ic_editor-code';
        }
        return 'ic_edit';
    }),
    existingMetricNameList: computed<string[]>(() => assetAnalysisPageGetters.metrics
        .map((metric) => metric.name)),
});

const {
    visibleMenu: visibleContextMenu,
    contextMenuStyle,
    showContextMenu,
    hideContextMenu,
} = useContextMenuController({
    useFixedStyle: false,
    targetRef,
    contextMenuRef,
    menu: state.saveDropdownMenuItems,
});
onClickOutside(rightPartRef, hideContextMenu);

/* Util */
const openNameFormModal = (modalType: string) => {
    state.selectedNameFormModalType = modalType;
    state.metricNameFormModalVisible = true;
};
const getDuplicatedMetricName = (name: string): string => {
    let _name = name;
    const _regex = /^(.*?)\s*copy(\s+(\d+))?$/i;

    while (state.existingMetricNameList.includes(_name)) {
        const match = _regex.exec(_name);
        if (match) {
            const baseName = match[1];
            const numberStr = match[3];
            const newNumber = numberStr ? parseInt(numberStr) + 1 : 2;
            _name = `${baseName} copy ${newNumber}`;
        } else {
            _name = `${_name} copy`;
        }
    }
    return _name;
};

/* Api */
const duplicateMetric = async () => {
    if (!assetAnalysisPageState.metric) return;
    state.loadingDuplicate = true;
    try {
        const duplicatedMetric = await SpaceConnector.clientV2.inventory.metric.create<MetricCreateParameters, MetricModel>({
            name: getDuplicatedMetricName(assetAnalysisPageState.metric.name),
            namespace_id: assetAnalysisPageState.metric.namespace_id || '',
            unit: assetAnalysisPageState.metric.unit,
            metric_type: assetAnalysisPageState.metric.metric_type,
            resource_group: RESOURCE_GROUP.WORKSPACE,
            query_options: assetAnalysisPageState.metric.query_options,
        });
        showSuccessMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_S_DUPLICATE_METRIC'), '');
        await router.replace(getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL._NAME,
            params: { metricId: duplicatedMetric.metric_id },
        }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_E_DUPLICATE_METRIC'));
    } finally {
        state.loadingDuplicate = false;
    }
};
const deleteCustomMetric = async () => {
    if (!assetAnalysisPageState.metric) return;
    try {
        await SpaceConnector.clientV2.inventory.metric.delete<MetricDeleteParameters>({
            metric_id: assetAnalysisPageState.metric.metric_id,
        });
        showSuccessMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_S_DELETE_METRIC'), '');
        const otherMetricId = assetAnalysisPageGetters.metrics[0]?.key;
        if (otherMetricId) {
            await router.replace(getProperRouteLocation({
                name: ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL._NAME,
                params: { metricId: otherMetricId },
            }));
        } else {
            await router.replace(getProperRouteLocation({
                name: ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS._NAME,
            }));
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_E_DELETE_METRIC'));
    }
};
const deleteMetricExample = async () => {
    try {
        await SpaceConnector.clientV2.inventory.metricExample.delete<MetricExampleDeleteParameters>({
            example_id: state.currentMetricExampleId as string,
        });
        await assetAnalysisPageStore.loadMetricExamples(assetAnalysisPageGetters.namespaceId);
        showSuccessMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_S_DELETE_METRIC_EXAMPLE'), '');
        await router.replace(getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL._NAME,
            params: { metricId: state.currentMetricId },
        }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_E_DELETE_METRIC_EXAMPLE'));
    }
};
const updateMetricExample = async () => {
    try {
        await SpaceConnector.clientV2.inventory.metricExample.update<MetricExampleUpdateParameters, MetricExampleModel>({
            example_id: state.currentMetricExampleId as string,
            options: {
                granularity: assetAnalysisPageState.granularity,
                period: assetAnalysisPageState.period,
                relative_period: assetAnalysisPageState.relativePeriod,
                group_by: assetAnalysisPageState.selectedGroupByList,
                filters: assetAnalysisPageState.filters,
                operator: assetAnalysisPageState.selectedOperator,
            },
        });
        showSuccessMessage(i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_S_UPDATE_METRIC_EXAMPLE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.ASSET_ANALYSIS.ALT_E_UPDATE_METRIC_EXAMPLE'));
    }
};

/* Event */
const handleDuplicate = async () => {
    await duplicateMetric();
};
const handleSaveMetricExample = async () => {
    await updateMetricExample();
};
const handleDeleteMetric = async () => {
    if (state.currentMetricExampleId) {
        await deleteMetricExample();
    } else {
        await deleteCustomMetric();
    }
    state.metricDeleteModalVisible = false;
};
const handleClickEditName = () => {
    openNameFormModal(NAME_FORM_MODAL_TYPE.EDIT_NAME);
};
const handleSelectSaveAsExample = () => {
    openNameFormModal(NAME_FORM_MODAL_TYPE.SAVE_AS_EXAMPLE);
};
const handleOpenAddExampleModal = () => {
    openNameFormModal(NAME_FORM_MODAL_TYPE.ADD_EXAMPLE);
};
const handleClickDeleteMetric = () => {
    state.metricDeleteModalVisible = true;
};
const handleClickMoreMenuButton = () => {
    if (visibleContextMenu.value) hideContextMenu();
    else showContextMenu();
};
const handleOpenEditQuery = () => {
    if (state.isManagedMetric || state.currentMetricExampleId) {
        assetAnalysisPageStore.openMetricQueryFormSidebar('VIEW');
    } else {
        assetAnalysisPageStore.openMetricQueryFormSidebar('UPDATE');
    }
};
</script>

<template>
    <p-heading :title="state.pageTitle">
        <template v-if="!assetAnalysisPageState.metricLoading"
                  #title-left-extra
        >
            <p-i v-if="state.currentMetricExampleId"
                 name="ic_example-filled"
                 width="1.5rem"
                 height="1.5rem"
                 :color="gray[700]"
            />
            <p-i v-else
                 :name="state.isManagedMetric ? 'ic_main-filled' : 'ic_sub'"
                 width="1rem"
                 height="1rem"
                 :color="gray[500]"
            />
        </template>
        <template v-if="!assetAnalysisPageState.metricLoading"
                  #title-right-extra
        >
            <div v-if="!state.isManagedMetric"
                 class="title-right-extra icon-wrapper"
            >
                <p-icon-button name="ic_edit-text"
                               size="md"
                               @click.stop="handleClickEditName"
                />
                <p-icon-button name="ic_delete"
                               size="md"
                               style-type="negative-transparent"
                               @click.stop="handleClickDeleteMetric"
                />
            </div>
            <delete-modal :header-title="state.deleteModalTitle"
                          :visible.sync="state.metricDeleteModalVisible"
                          :contents="$t('INVENTORY.ASSET_ANALYSIS.DELETE_MODAL_DESC')"
                          @confirm="handleDeleteMetric"
            />
        </template>
        <template v-if="!assetAnalysisPageState.metricLoading"
                  #extra
        >
            <div ref="rightPartRef"
                 class="right-part"
            >
                <!-- metric case -->
                <p-button class="mr-2"
                          style-type="tertiary"
                          :icon-left="state.editQueryButtonIcon"
                          @click="handleOpenEditQuery"
                >
                    {{ state.editQueryTitle }}
                </p-button>
                <template v-if="!state.currentMetricExampleId">
                    <p-button v-if="assetAnalysisPageState.selectedNamespace?.group !== 'common'"
                              class="mr-2"
                              style-type="tertiary"
                              icon-left="ic_duplicate"
                              :loading="state.loadingDuplicate"
                              @click="handleDuplicate"
                    >
                        {{ $t('INVENTORY.ASSET_ANALYSIS.DUPLICATE') }}
                    </p-button>
                    <p-button style-type="tertiary"
                              icon-left="ic_plus_bold"
                              @click="handleOpenAddExampleModal"
                    >
                        {{ $t('INVENTORY.ASSET_ANALYSIS.ADD_EXAMPLE') }}
                    </p-button>
                </template>
                <!-- example case -->
                <template v-else>
                    <p-button class="save-button"
                              style-type="tertiary"
                              icon-left="ic_disk-filled"
                              @click="handleSaveMetricExample"
                    >
                        {{ $t('INVENTORY.ASSET_ANALYSIS.SAVE') }}
                    </p-button>
                    <p-icon-button ref="targetRef"
                                   class="more-menu-button"
                                   :name="visibleContextMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                                   style-type="tertiary"
                                   shape="square"
                                   size="md"
                                   color="inherit"
                                   @click="handleClickMoreMenuButton"
                    />
                    <p-context-menu v-show="visibleContextMenu"
                                    ref="contextMenuRef"
                                    :menu="state.saveDropdownMenuItems"
                                    :style="contextMenuStyle"
                                    @select="handleSelectSaveAsExample"
                    />
                </template>
            </div>
            <asset-analysis-name-form-modal :visible.sync="state.metricNameFormModalVisible"
                                            :type="state.selectedNameFormModalType"
            />
            <asset-analysis-query-form-sidebar />
        </template>
    </p-heading>
</template>

<style lang="postcss" scoped>
.title-right-extra {
    @apply flex-shrink-0 inline-flex items-center;
    margin-bottom: -0.25rem;
}
.right-part {
    @apply relative;
    display: flex;
    align-items: flex-start;

    .save-button {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
    .more-menu-button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: 0;
    }

    /* custom design-system component - p-context-menu */
    :deep(.p-context-menu) {
        @apply absolute;
        top: 2.125rem;
        margin-top: -1px;
        z-index: 100;
        right: 0;
        .p-context-menu-item {
            min-width: 10rem;
        }
    }
}
</style>
