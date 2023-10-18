<script lang="ts" setup>
import {
    onClickOutside, useElementSize,
} from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PButton, PContextMenu, PIconButton, PPopover, PBadge,
    useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import {
    DYNAMIC_COST_QUERY_SET_PARAMS,
} from '@/services/cost-explorer/cost-analysis/config';
import { REQUEST_TYPE } from '@/services/cost-explorer/cost-analysis/lib/config';
import CostAnalysisFiltersPopper from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisFiltersPopper.vue';
import CostAnalysisGranularityPeriodDropdown
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGranularityPeriodDropdown.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity } from '@/services/cost-explorer/type';

const CostAnalysisQueryFormModal = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFormModal.vue');

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const filtersPopperRef = ref<any|null>(null);
const rightPartRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const { height: filtersPopperHeight } = useElementSize(filtersPopperRef);

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    queryFormModalVisible: false,
    saveDropdownMenuItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'saveAs',
            icon: 'ic_disk-edit-filled',
            label: `${i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_AS')}...`,
        },
    ])),
    selectedQuerySetId: computed(() => costAnalysisPageStore.selectedQueryId),
    isManagedQuerySet: computed(() => costAnalysisPageStore.managedCostQuerySetList.map((d) => d.cost_query_set_id).includes(state.selectedQuerySetId)),
    isDynamicQuerySet: computed<boolean>(() => costAnalysisPageStore.selectedQueryId === DYNAMIC_COST_QUERY_SET_PARAMS),
    filtersPopoverVisible: false,
    granularity: undefined as Granularity|undefined,
    isPeriodInvalid: computed<boolean>(() => costAnalysisPageStore.isPeriodInvalid),
    invalidPeriodMessage: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.INVALID_PERIOD_TEXT')),
    selectedFiltersCount: computed(() => {
        let count = 0;
        Object.values(costAnalysisPageState.filters ?? {}).forEach((filterItems) => {
            count += filterItems.length;
        });
        return count;
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

/* event */
const handleSaveQuerySet = async () => {
    try {
        await SpaceConnector.client.costAnalysis.costQuerySet.update({
            cost_query_set_id: costAnalysisPageStore.selectedQueryId,
            options: {
                granularity: costAnalysisPageState.granularity,
                period: costAnalysisPageState.period,
                relative_period: costAnalysisPageState.relativePeriod,
                group_by: costAnalysisPageState.groupBy,
                filters: costAnalysisPageStore.consoleFilters,
                metadata: { filters_schema: { enabled_properties: costAnalysisPageState.enabledFiltersProperties ?? [] } },
            },
        });
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_S_SAVE_QUERY'), '');
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
const handleUpdateQuery = async (updatedQueryId: string) => {
    await costAnalysisPageStore.getCostQueryList();
    await costAnalysisPageStore.selectQueryId(updatedQueryId);
    await SpaceRouter.router.push({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            dataSourceId: costAnalysisPageStore.selectedDataSourceId as string,
            costQuerySetId: updatedQueryId,
        },
    });
};
const handleClickFilter = () => {
    state.filtersPopoverVisible = !state.filtersPopoverVisible;
};

watch(() => costAnalysisPageStore.selectedQueryId, (updatedQueryId) => {
    if (updatedQueryId !== '') {
        state.filtersPopoverVisible = false;
    }
}, { immediate: true });
</script>

<template>
    <div class="cost-analysis-query-filter">
        <div class="filter-wrapper"
             :style="{ 'margin-bottom': `${filtersPopperHeight ? filtersPopperHeight+40: 0}px` }"
        >
            <div class="left-part">
                <cost-analysis-granularity-period-dropdown />
                <p-popover :is-visible.sync="state.filtersPopoverVisible"
                           :class="{ 'open': state.filtersPopoverVisible }"
                           ignore-outside-click
                           trigger="click"
                           relative-style
                           position="bottom-start"
                           class="filters-popover"
                >
                    <p-button style-type="tertiary"
                              class="filters-button"
                              icon-left="ic_filter"
                              @click="handleClickFilter"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.FILTERS') }}
                        <p-badge v-if="state.selectedFiltersCount"
                                 badge-type="subtle"
                                 :style-type="state.filtersPopoverVisible ? 'gray100' : 'gray200'"
                                 class="filters-badge"
                        >
                            {{ state.selectedFiltersCount }}
                        </p-badge>
                    </p-button>
                    <template #content>
                        <cost-analysis-filters-popper ref="filtersPopperRef" />
                    </template>
                </p-popover>
            </div>
            <div v-if="state.hasManagePermission"
                 ref="rightPartRef"
                 class="right-part"
            >
                <template v-if="!state.isManagedQuerySet && !state.isDynamicQuerySet">
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
        <div v-if="state.isPeriodInvalid"
             class="invalid-text"
        >
            {{ state.invalidPeriodMessage }}
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
    margin-top: 1.5rem;
    .filter-wrapper {
        @apply relative flex items-center justify-between;
        font-size: 0.875rem;
        .left-part {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            .granularity-dropdown {
                min-width: unset;
            }
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
        .filters-button {
            .filters-badge {
                margin-left: 0.25rem;
            }
        }

        /* custom design-system component - p-popover */
        :deep(.p-popover) {
            &.open {
                .p-button.filters-button {
                    @apply bg-gray-200;
                }
            }
            .popper {
                width: 100%;
                max-width: 100%;
                left: 2rem;
                transform: translate(0, 3rem) !important;
                .arrow {
                    left: 1.25rem !important;
                }
            }
        }
    }
    .invalid-text {
        @apply text-red-400 text-label-md;
        margin-top: 0.5rem;
    }
}
</style>
