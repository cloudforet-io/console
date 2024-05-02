<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core/index';
import { computed, reactive, ref } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    useContextMenuController, PHeading, PIconButton, PButton, PContextMenu, PI,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

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

import MetricExplorerNameFormModal from '@/services/asset-inventory/components/MetricExplorerNameFormModal.vue';
import MetricExplorerQueryFormSidebar from '@/services/asset-inventory/components/MetricExplorerQueryFormSidebar.vue';
import { NAME_FORM_MODAL_TYPE } from '@/services/asset-inventory/constants/metric-explorer-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const rightPartRef = ref<HTMLElement|null>(null);
const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();

const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    metricNameFormModalVisible: false,
    metricQueryFormModalVisible: false,
    metricDeleteModalVisible: false,
    loadingDuplicate: false,
    selectedNameFormModalType: undefined as string|undefined,
    saveDropdownMenuItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'saveAs',
            icon: 'ic_disk-edit-filled',
            label: `${i18n.t('INVENTORY.METRIC_EXPLORER.SAVE_AS')}...`,
        },
    ])),
    pageTitle: computed<string|TranslateResult>(() => {
        if (metricExplorerPageState.metric) {
            if (metricExplorerPageGetters.metricExample) {
                return metricExplorerPageGetters.metricExample.name;
            }
            return metricExplorerPageState.metric.name;
        }
        return i18n.t('INVENTORY.METRIC_EXPLORER.METRIC_EXPLORER');
    }),
    deleteModalTitle: computed(() => {
        if (metricExplorerPageGetters.metricExampleId) {
            return i18n.t('INVENTORY.METRIC_EXPLORER.DELETE_METRIC_EXAMPLE');
        }
        return i18n.t('INVENTORY.METRIC_EXPLORER.DELETE_CUSTOM_METRIC');
    }),
    existingMetricNameList: computed<string[]>(() => metricExplorerPageGetters.metrics
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
    let _count = 2;
    let _name = name;
    while (state.existingMetricNameList.includes(_name)) {
        if (_name.endsWith(' copy')) {
            _name = `${name} copy ${_count}`;
            _count += 1;
        } else {
            _name = `${name} copy`;
        }
    }
    return _name;
};

/* Api */
const duplicateMetric = async () => {
    if (!metricExplorerPageState.metric) return;
    state.loadingDuplicate = true;
    try {
        const duplicatedMetric = await SpaceConnector.clientV2.inventory.metric.create<MetricCreateParameters, MetricModel>({
            name: getDuplicatedMetricName(metricExplorerPageState.metric.name),
            namespace_id: metricExplorerPageState.metric.namespace_id || '',
            unit: metricExplorerPageState.metric.unit,
            metric_type: metricExplorerPageState.metric.metric_type,
            resource_type: 'inventory.CloudService',
            query_options: metricExplorerPageState.metric.query_options,
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_DUPLICATE_METRIC'), '');
        await router.replace(getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: { metricId: duplicatedMetric.metric_id },
        }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_DUPLICATE_METRIC'));
    } finally {
        state.loadingDuplicate = false;
    }
};
const deleteCustomMetric = async () => {
    if (!metricExplorerPageState.metric) return;
    try {
        await SpaceConnector.clientV2.inventory.metric.delete<MetricDeleteParameters>({
            metric_id: metricExplorerPageState.metric.metric_id,
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_DELETE_METRIC'), '');
        const otherMetricId = metricExplorerPageGetters.metrics[0]?.key;
        if (otherMetricId) {
            await router.replace(getProperRouteLocation({
                name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                params: { metricId: otherMetricId },
            }));
        } else {
            await router.replace(getProperRouteLocation({
                name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER._NAME,
            }));
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_DELETE_METRIC'));
    }
};
const deleteMetricExample = async () => {
    try {
        await SpaceConnector.clientV2.inventory.metricExample.delete<MetricExampleDeleteParameters>({
            example_id: metricExplorerPageGetters.metricExampleId,
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_DELETE_METRIC_EXAMPLE'), '');
        await router.replace(getProperRouteLocation({
            name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            params: { metricId: metricExplorerPageGetters.metricId },
        }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_DELETE_METRIC_EXAMPLE'));
    }
};
const updateMetricExample = async () => {
    try {
        await SpaceConnector.clientV2.inventory.metricExample.update<MetricExampleUpdateParameters, MetricExampleModel>({
            example_id: metricExplorerPageGetters.metricExampleId,
            options: {
                granularity: metricExplorerPageState.granularity,
                period: metricExplorerPageState.period,
                relative_period: metricExplorerPageState.relativePeriod,
                group_by: metricExplorerPageState.selectedGroupByList,
                filters: metricExplorerPageState.filters,
            },
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_UPDATE_METRIC_EXAMPLE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_UPDATE_METRIC_EXAMPLE'));
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
    if (metricExplorerPageGetters.metricExampleId) {
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
    metricExplorerPageStore.openMetricQueryFormSidebar('UPDATE');
};
</script>

<template>
    <p-heading :title="state.pageTitle">
        <template #title-left-extra>
            <p-i v-if="metricExplorerPageGetters.metricExampleId"
                 name="ic_example-filled"
                 width="1.5rem"
                 height="1.5rem"
                 :color="gray[700]"
            />
            <p-i v-else
                 :name="metricExplorerPageGetters.isManagedMetric ? 'ic_main-filled' : 'ic_sub'"
                 width="1rem"
                 height="1rem"
                 :color="gray[500]"
            />
        </template>
        <template #title-right-extra>
            <div v-if="!metricExplorerPageGetters.isManagedMetric"
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
                          :contents="$t('INVENTORY.METRIC_EXPLORER.DELETE_MODAL_DESC')"
                          @confirm="handleDeleteMetric"
            />
        </template>
        <template #extra>
            <div ref="rightPartRef"
                 class="right-part"
            >
                <!-- metric case -->
                <template v-if="!metricExplorerPageGetters.metricExampleId">
                    <p-button v-if="!metricExplorerPageGetters.isManagedMetric"
                              class="mr-2"
                              style-type="substitutive"
                              icon-left="ic_editor-code"
                              @click="handleOpenEditQuery"
                    >
                        {{ $t('INVENTORY.METRIC_EXPLORER.EDIT_QUERY') }}
                    </p-button>
                    <p-button class="mr-2"
                              style-type="tertiary"
                              icon-left="ic_duplicate"
                              :loading="state.loadingDuplicate"
                              @click="handleDuplicate"
                    >
                        {{ $t('INVENTORY.METRIC_EXPLORER.DUPLICATE') }}
                    </p-button>
                    <p-button style-type="tertiary"
                              icon-left="ic_plus_bold"
                              @click="handleOpenAddExampleModal"
                    >
                        {{ $t('INVENTORY.METRIC_EXPLORER.ADD_EXAMPLE') }}
                    </p-button>
                </template>
                <!-- example case -->
                <template v-else>
                    <p-button class="save-button"
                              style-type="tertiary"
                              icon-left="ic_disk-filled"
                              @click="handleSaveMetricExample"
                    >
                        {{ $t('INVENTORY.METRIC_EXPLORER.SAVE') }}
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
            <metric-explorer-name-form-modal :visible.sync="state.metricNameFormModalVisible"
                                             :type="state.selectedNameFormModalType"
            />
            <metric-explorer-query-form-sidebar v-show="metricExplorerPageState.showMetricQueryFormSidebar" />
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
