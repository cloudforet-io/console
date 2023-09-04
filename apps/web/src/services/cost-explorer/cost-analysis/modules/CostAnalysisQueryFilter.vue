<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core';
import { computed, reactive, ref } from 'vue';

import {
    PSelectDropdown, PButton, PContextMenu, PIconButton, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { managedCostQuerySetIdList } from '@/services/cost-explorer/cost-analysis/config';
import { REQUEST_TYPE } from '@/services/cost-explorer/cost-analysis/lib/config';
import CostAnalysisPeriodSelectDropdown
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisPeriodSelectDropdown.vue';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getInitialDates } from '@/services/cost-explorer/lib/helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity } from '@/services/cost-explorer/type';

const CostAnalysisQueryFormModal = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFormModal.vue');


const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const state = reactive({
    queryFormModalVisible: false,
    granularityItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: GRANULARITY.DAILY,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DAILY'),
        },
        {
            type: 'item',
            name: GRANULARITY.MONTHLY,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.MONTHLY'),
        },
    ])),
    saveDropdownMenuItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'saveAs',
            icon: 'ic_disk-edit-filled',
            label: `${i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_AS')}...`,
        },
    ])),
    isManagedQuerySet: computed(() => managedCostQuerySetIdList.includes(costAnalysisPageStore.selectedQueryId as string)),
});

const {
    visibleMenu: visibleContextMenu,
    contextMenuStyle,
    showContextMenu,
    hideContextMenu,
} = useContextMenuController({
    useFixedStyle: true,
    targetRef,
    contextMenuRef,
    menu: state.saveDropdownMenuItems,
});
onClickOutside(contextMenuRef, hideContextMenu);

/* event */
const handleSelectGranularity = async (granularity: Granularity) => {
    if (granularity !== costAnalysisPageState.granularity) {
        costAnalysisPageStore.$patch((_state) => {
            _state.period = getInitialDates();
        });
    }
    costAnalysisPageStore.$patch({ granularity });
};
const handleSelectedDates = (period) => {
    costAnalysisPageStore.$patch((_state) => {
        _state.period = period;
    });
};
const handleSaveQuerySet = async () => {
    try {
        await SpaceConnector.client.costAnalysis.costQuerySet.update({
            cost_query_set_id: costAnalysisPageStore.selectedQueryId,
            options: {
                granularity: costAnalysisPageState.granularity,
                period: costAnalysisPageState.period,
                group_by: costAnalysisPageState.groupBy,
                filters: costAnalysisPageState.filters,
            },
        });
        await costAnalysisPageStore.getCostQueryList();
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVED_QUERY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_E_SAVED_QUERY'));
    }
};
const handleClickMoreMenuButton = () => {
    if (visibleContextMenu.value) hideContextMenu();
    else showContextMenu();
};
const handleClickSaveAsButton = () => {
    state.queryFormModalVisible = true;
};
const handleUpdateQuery = (updatedQueryId: string) => {
    costAnalysisPageStore.getCostQueryList();
    costAnalysisPageStore.selectQueryId(updatedQueryId);
};
</script>

<template>
    <div class="cost-analysis-query-filter">
        <div class="filter-wrapper">
            <div class="left-part">
                <p-select-dropdown :items="state.granularityItems"
                                   :selected="costAnalysisPageState.granularity"
                                   class="granularity-select-dropdown"
                                   @select="handleSelectGranularity"
                />
                <cost-analysis-period-select-dropdown :fixed-period="costAnalysisPageState.period"
                                                      @update="handleSelectedDates"
                />
            </div>
            <div class="right-part">
                <template v-if="!state.isManagedQuerySet">
                    <p-button class="save-button"
                              style-type="tertiary"
                              icon-left="ic_disk-filled"
                              @click="handleSaveQuerySet"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE') }}
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
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_AS') }}
                    </p-button>
                </template>
            </div>
        </div>
        <cost-analysis-query-form-modal :visible.sync="state.queryFormModalVisible"
                                        :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_TO_COST_ANALYSIS_LIBRARY')"
                                        :request-type="REQUEST_TYPE.SAVE"
                                        :selected-query-set-id="costAnalysisPageStore.selectedQueryId"
                                        @update-query="handleUpdateQuery"
        />
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-query-filter {
    .filter-wrapper {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        .left-part {
            display: flex;
            align-items: center;
            .granularity-select-dropdown {
                margin-right: 0.5rem;
            }
        }
        .right-part {
            display: flex;
            align-items: center;

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
                right: 1.5rem;
                margin-top: -0.15rem;
                .p-context-menu-item {
                    min-width: 9rem;
                }
            }
        }
    }
}
</style>
