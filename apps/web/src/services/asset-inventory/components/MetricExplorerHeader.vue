<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core/index';
import { computed, reactive, ref } from 'vue';

import {
    useContextMenuController, PHeading, PIconButton, PButton, PContextMenu,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { MetricUpdateParameters } from '@/schema/inventory/metric/api-verbs/update';
import type { MetricModel } from '@/schema/inventory/metric/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import MetricExplorerSaveAsModal from '@/services/asset-inventory/components/MetricExplorerSaveAsModal.vue';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const rightPartRef = ref<HTMLElement|null>(null);

const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;
const state = reactive({
    metricSaveAsModalVisible: false,
    saveDropdownMenuItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'saveAs',
            icon: 'ic_disk-edit-filled',
            label: `${i18n.t('INVENTORY.METRIC_EXPLORER.SAVE_AS')}...`,
        },
    ])),
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
</script>

<template>
    <p-heading :title="$t('INVENTORY.METRIC_EXPLORER.METRIC_EXPLORER')">
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
