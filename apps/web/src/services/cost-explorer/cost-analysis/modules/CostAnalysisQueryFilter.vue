<script lang="ts" setup>
import { onClickOutside, useElementSize } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';

import {
    PSelectDropdown, PButton, PContextMenu, PIconButton, PPopover, PBadge,
    useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    DYNAMIC_COST_QUERY_SET_PARAMS,
} from '@/services/cost-explorer/cost-analysis/config';
import { REQUEST_TYPE } from '@/services/cost-explorer/cost-analysis/lib/config';
import CostAnalysisFiltersPopper from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisFiltersPopper.vue';
import CostAnalysisPeriodSelectDropdown
    from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisPeriodSelectDropdown.vue';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type { Granularity } from '@/services/cost-explorer/type';


const CostAnalysisQueryFormModal = () => import('@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFormModal.vue');


const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

const filtersPopperRef = ref<any|null>(null);
const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const { height: filtersPopperHeight } = useElementSize(filtersPopperRef);
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
        {
            type: 'item',
            name: GRANULARITY.YEARLY,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.YEARLY'),
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
    showPeriodBadge: computed<boolean>(() => costAnalysisPageStore.selectedQueryId === DYNAMIC_COST_QUERY_SET_PARAMS || !costAnalysisPageState.relativePeriod),
    periodBadgeText: computed<string>(() => {
        if (!costAnalysisPageState.period) return '';
        let startDateFormat = 'MMM D';
        if (costAnalysisPageState.granularity === GRANULARITY.MONTHLY) startDateFormat = 'MMM YYYY';
        else if (costAnalysisPageState.granularity === GRANULARITY.YEARLY) startDateFormat = 'YYYY';
        const endDateFormat = costAnalysisPageState.granularity === GRANULARITY.DAILY ? 'MMM D, YYYY' : startDateFormat;
        //
        const start = dayjs.utc(costAnalysisPageState.period.start);
        let end = dayjs.utc(costAnalysisPageState.period.end);
        if (costAnalysisPageState.granularity === GRANULARITY.DAILY) end = dayjs.utc(costAnalysisPageState.period.end).endOf('month');
        return `${start.format(startDateFormat)} ~ ${end.format(endDateFormat)}`;
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
onClickOutside(containerRef, hideContextMenu);
onClickOutside(contextMenuRef, hideContextMenu);

/* event */
const handleSelectGranularity = async (granularity: Granularity) => {
    costAnalysisPageStore.$patch({ granularity });
    state.granularity = granularity;
};
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
const handleUpdateQuery = (updatedQueryId: string) => {
    costAnalysisPageStore.getCostQueryList();
    costAnalysisPageStore.selectQueryId(updatedQueryId);
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
    <div ref="containerRef"
         class="cost-analysis-query-filter"
    >
        <div class="filter-wrapper"
             :style="{ 'margin-bottom': `${filtersPopperHeight ? filtersPopperHeight+40: 0}px` }"
        >
            <div class="left-part">
                <p-select-dropdown :menu="state.granularityItems"
                                   :selection-label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.GRANULARITY')"
                                   style-type="rounded"
                                   :selected="costAnalysisPageState.granularity"
                                   @select="handleSelectGranularity"
                />
                <cost-analysis-period-select-dropdown :local-granularity="state.granularity" />
                <p-badge v-if="state.showPeriodBadge"
                         badge-type="subtle"
                         style-type="gray200"
                >
                    {{ state.periodBadgeText }}
                </p-badge>
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
            <div class="right-part">
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
        position: relative;
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        .left-part {
            display: flex;
            align-items: center;
            gap: 0.5rem;
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
                right: 0;
                margin-top: -0.15rem;
                z-index: 100;
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

    @screen mobile {
        .filter-wrapper, .left-part {
            @apply flex-col;
        }

        .filters-popover {
            margin-top: 0.5rem;
        }

        .right-part {
            margin-top: 1.5rem;
        }
    }
}
</style>
