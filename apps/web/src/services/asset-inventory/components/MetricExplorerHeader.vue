<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core/index';
import { computed, reactive, ref } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    useContextMenuController, PHeading, PIconButton, PButton, PContextMenu,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MetricUpdateParameters } from '@/schema/inventory/metric/api-verbs/update';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import MetricExplorerEditNameModal from '@/services/asset-inventory/components/MetricExplorerEditNameModal.vue';
import MetricExplorerSaveAsModal from '@/services/asset-inventory/components/MetricExplorerSaveAsModal.vue';
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
    metricSaveAsModalVisible: false,
    metricEditNameModalVisible: false,
    metricDeleteModalVisible: false,
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
            return metricExplorerPageState.metric.name;
        }
        return i18n.t('INVENTORY.METRIC_EXPLORER.METRIC_EXPLORER');
    }),
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

/* Api */
const deleteMetric = async () => {
    if (!metricExplorerPageState.metric) return;
    try {
        await SpaceConnector.clientV2.inventory.metric.delete({
            metric_id: metricExplorerPageState.metric.metric_id,
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_DELETE_METRIC'), '');
        const otherMetricId = metricExplorerPageState.metricList[0]?.metric_id;
        if (otherMetricId) {
            await router.replace(getProperRouteLocation({
                name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
                params: { id: otherMetricId },
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

/* Event */
const handleSaveQuerySet = async () => {
    if (!metricExplorerPageState.metric) return;
    try {
        await SpaceConnector.clientV2.inventory.metric.update<MetricUpdateParameters, MetricModel>({
            metric_id: metricExplorerPageState.metric.metric_id,
            query_options: {
                ...metricExplorerPageState.metric.query_options, // TODO: Implement query options
            },
        });
        showSuccessMessage(i18n.t('INVENTORY.METRIC_EXPLORER.ALT_S_SAVE_METRIC'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.METRIC_EXPLORER.ALT_E_SAVE_AS_METRIC'));
    }
};
const handleClickMoreMenuButton = () => {
    if (visibleContextMenu.value) hideContextMenu();
    else showContextMenu();
};
const handleClickSaveAsButton = () => {
    state.metricSaveAsModalVisible = true;
};
const handleClickEditMetricName = () => {
    state.metricEditNameModalVisible = true;
};
const handleClickDeleteMetric = () => {
    state.metricDeleteModalVisible = true;
};
const handleDeleteMetric = async () => {
    await deleteMetric();
    state.metricDeleteModalVisible = false;
};
</script>

<template>
    <p-heading :title="state.pageTitle">
        <template #title-right-extra>
            <div v-if="!metricExplorerPageGetters.isManagedMetric"
                 class="title-right-extra icon-wrapper"
            >
                <p-icon-button name="ic_edit-text"
                               size="md"
                               @click.stop="handleClickEditMetricName"
                />
                <p-icon-button name="ic_delete"
                               size="md"
                               @click.stop="handleClickDeleteMetric"
                />
            </div>
            <metric-explorer-edit-name-modal :visible.sync="state.metricEditNameModalVisible" />
            <delete-modal :header-title="$t('INVENTORY.METRIC_EXPLORER.DELETE_METRIC')"
                          :visible.sync="state.metricDeleteModalVisible"
                          :contents="$t('INVENTORY.METRIC_EXPLORER.DELETE_MODAL_DESC')"
                          @confirm="handleDeleteMetric"
            />
        </template>
        <template #extra>
            <div ref="rightPartRef"
                 class="right-part"
            >
                <template v-if="!metricExplorerPageGetters.isManagedMetric">
                    <p-button class="save-button"
                              style-type="tertiary"
                              icon-left="ic_disk-filled"
                              @click="handleSaveQuerySet"
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
                                    @select="handleClickSaveAsButton"
                    />
                </template>
                <template v-else>
                    <p-button style-type="tertiary"
                              icon-left="ic_disk-edit-filled"
                              @click="handleClickSaveAsButton"
                    >
                        {{ $t('INVENTORY.METRIC_EXPLORER.SAVE_AS') }}
                    </p-button>
                </template>
            </div>
            <metric-explorer-save-as-modal :visible.sync="state.metricSaveAsModalVisible" />
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
