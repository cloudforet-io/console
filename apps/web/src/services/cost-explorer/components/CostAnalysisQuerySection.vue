<script lang="ts" setup>
import {
    onClickOutside, useElementSize,
} from '@vueuse/core';
import {
    computed, onMounted, reactive, ref, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PContextMenu, PIconButton, PPopover, PBadge, PSelectDropdown, PFieldTitle,
    useContextMenuController, PCheckbox, PButtonModal, PScopedNotification,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { CostQuerySetUpdateParameters } from '@/api-clients/cost-analysis/cost-query-set/schema/api-verbs/update';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { getWorkspaceInfo } from '@/services/advanced/composables/refined-table-data';
import CostAnalysisDataTypeDropdown from '@/services/cost-explorer/components/CostAnalysisDataTypeDropdown.vue';
import CostAnalysisFiltersPopper from '@/services/cost-explorer/components/CostAnalysisFiltersPopper.vue';
import CostAnalysisGranularityPeriodDropdown
    from '@/services/cost-explorer/components/CostAnalysisGranularityPeriodDropdown.vue';
import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import {
    DYNAMIC_COST_QUERY_SET_PARAMS, MANAGED_COST_QUERY_SET_ID_LIST,
} from '@/services/cost-explorer/constants/managed-cost-analysis-query-sets';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import type { Granularity } from '@/services/cost-explorer/types/cost-explorer-query-type';

const CostAnalysisQueryFormModal = () => import('@/services/cost-explorer/components/CostAnalysisQueryFormModal.vue');

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;
const appContextStore = useAppContextStore();

const filtersPopperRef = ref<any|null>(null);
const rightPartRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const { hasReadWriteAccess } = usePageEditableStatus();
const { height: filtersPopperHeight } = useElementSize(filtersPopperRef);
const router = useRouter();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    queryFormModalVisible: false,
    saveDropdownMenuItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'saveAs',
            icon: 'ic_disk-edit-filled',
            label: `${i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.SAVE_AS')}...`,
        },
    ])),
    selectedQuerySetId: computed(() => costAnalysisPageGetters.selectedQueryId),
    isManagedQuerySet: computed(() => costAnalysisPageGetters.managedCostQuerySetList.map((d) => d.cost_query_set_id).includes(state.selectedQuerySetId)),
    isDynamicQuerySet: computed<boolean>(() => costAnalysisPageGetters.selectedQueryId === DYNAMIC_COST_QUERY_SET_PARAMS),
    filtersPopoverVisible: false,
    granularity: undefined as Granularity|undefined,
    isPeriodInvalid: computed<boolean>(() => costAnalysisPageGetters.isPeriodInvalid),
    invalidPeriodMessage: computed(() => i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.INVALID_PERIOD_TEXT')),
    selectedFiltersCount: computed(() => {
        let count = 0;
        Object.values(costAnalysisPageState.filters ?? {}).forEach((filterItems) => {
            count += filterItems.length;
        });
        return count;
    }),
    workspaceScopeLoading: false,
    visibleNotiModal: false,
});

const {
    visibleMenu: visibleContextMenu,
    showContextMenu,
    hideContextMenu,
} = useContextMenuController({
    useFixedStyle: false,
    targetRef,
    contextMenuRef,
    menu: state.saveDropdownMenuItems,
    position: 'right',
});
onClickOutside(rightPartRef, hideContextMenu);

/* event */
const handleSaveQuerySet = async () => {
    try {
        const filters = costAnalysisPageState.isAllWorkspaceSelected ? costAnalysisPageGetters.consoleFilters : costAnalysisPageGetters.consoleFilters.filter((d) => d.k !== GROUP_BY.WORKSPACE);

        await SpaceConnector.clientV2.costAnalysis.costQuerySet.update<CostQuerySetUpdateParameters>({
            cost_query_set_id: costAnalysisPageGetters.selectedQueryId as string,
            options: {
                granularity: costAnalysisPageState.granularity,
                period: costAnalysisPageState.period,
                relative_period: costAnalysisPageState.relativePeriod,
                group_by: costAnalysisPageState.groupBy,
                filters,
                display_data_type: costAnalysisPageState.displayDataType,
                workspace_scope: costAnalysisPageState.workspaceScope,
                is_all_workspace_selected: costAnalysisPageState.isAllWorkspaceSelected,
                metadata: { filters_schema: { enabled_properties: costAnalysisPageState.enabledFiltersProperties ?? [] } },
            },
        });
        await costAnalysisPageStore.listCostQueryList();
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
    await costAnalysisPageStore.listCostQueryList();
    await costAnalysisPageStore.selectQueryId(updatedQueryId);
    await router.push({
        name: storeState.isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME : COST_EXPLORER_ROUTE.COST_ANALYSIS.QUERY_SET._NAME,
        params: {
            dataSourceId: costAnalysisPageGetters.selectedDataSourceId as string,
            costQuerySetId: updatedQueryId,
        },
    }).catch(() => {});
};
const handleClickFilter = () => {
    state.filtersPopoverVisible = !state.filtersPopoverVisible;
};
const handleUpdateWorkspaceScope = (selectedItems: string) => {
    costAnalysisPageStore.setWorkspaceScope(selectedItems);
};
watch([() => costAnalysisPageGetters.selectedQueryId, () => costAnalysisPageGetters.isUnifiedCost, () => costAnalysisPageGetters.selectedDataSourceId], ([updatedQueryId]) => {
    if (updatedQueryId !== '' || MANAGED_COST_QUERY_SET_ID_LIST.includes(updatedQueryId)) {
        state.filtersPopoverVisible = false;
    }
}, { immediate: true });

const handleUpdateIsAllWorkspaceSelected = (isAllWorkspaceSelected: boolean) => {
    if (isAllWorkspaceSelected) {
        state.visibleNotiModal = true;
    } else {
        costAnalysisPageState.isAllWorkspaceSelected = false;
        costAnalysisPageStore.setWorkspaceScope(costAnalysisPageGetters.defaultWorkspaceScope);
        costAnalysisPageState.enabledFiltersProperties = costAnalysisPageState.enabledFiltersProperties?.filter((property) => property !== GROUP_BY.WORKSPACE);

        costAnalysisPageStore.setFilters({
            ...costAnalysisPageState.filters,
            workspace_id: [],
        });
    }
};

const handleConfirmIsAllWorkspaceSelected = () => {
    costAnalysisPageState.isAllWorkspaceSelected = true;
    costAnalysisPageStore.setWorkspaceScope('');
    if (!costAnalysisPageState.enabledFiltersProperties?.includes(GROUP_BY.WORKSPACE)) {
        costAnalysisPageState.enabledFiltersProperties = [
            GROUP_BY.WORKSPACE,
            ...(costAnalysisPageState.enabledFiltersProperties ?? []),
        ];
    }
    costAnalysisPageStore.setFilters({
        ...costAnalysisPageState.filters,
        workspace_id: [],
    });
    state.visibleNotiModal = false;
};

onMounted(async () => {
    if (storeState.isAdminMode) {
        costAnalysisPageStore.setWorkspaceScope('');
    } else if (!costAnalysisPageState.workspaceScope) {
        costAnalysisPageStore.setWorkspaceScope(costAnalysisPageGetters.defaultWorkspaceScope);
    }
});
</script>

<template>
    <div class="cost-analysis-query-section">
        <div v-if="storeState.isAdminMode"
             class="scope-wrapper"
        >
            <p-field-title inline>
                {{ $t('HOME.FORM_SCOPE') }}
            </p-field-title> <p-select-dropdown is-filterable
                                                :menu="costAnalysisPageGetters.workspaceList.map((workspace) => ({
                                                    label: workspace.name,
                                                    name: workspace.workspace_id,
                                                }))"
                                                :selected="costAnalysisPageState.workspaceScope"
                                                :disabled="costAnalysisPageState.isAllWorkspaceSelected"
                                                :page-size="10"
                                                show-select-marker
                                                size="sm"
                                                class="workspace-scope-dropdown"
                                                @update:selected="handleUpdateWorkspaceScope"
            >
                <template #menu-item--format="{item}">
                    <div class="menu-item-wrapper">
                        <div class="label">
                            <workspace-logo-icon :text="item?.label || ''"
                                                 :theme="getWorkspaceInfo(item?.name || '', costAnalysisPageGetters.workspaceList)?.tags?.theme"
                                                 size="xs"
                            />
                            <span class="label-text">{{ item.label }}</span>
                        </div>
                    </div>
                </template>
            </p-select-dropdown><p-checkbox
                :selected="costAnalysisPageState.isAllWorkspaceSelected"
                class="ml-2"
                @change="handleUpdateIsAllWorkspaceSelected"
            >
                {{ $t('COMMON.NAVIGATIONS.TOP_BAR.ALL_WORKSPACE') }}
            </p-checkbox>
        </div>
        <div class="filter-wrapper"
             :style="{ 'margin-bottom': `${filtersPopperHeight ? filtersPopperHeight+40 + 16: 16}px` }"
        >
            <div class="left-part">
                <cost-analysis-granularity-period-dropdown />
                <cost-analysis-data-type-dropdown />
                <p-popover :is-visible.sync="state.filtersPopoverVisible"
                           :class="{ 'open': state.filtersPopoverVisible }"
                           ignore-outside-click
                           trigger="click"
                           boundary=".cost-analysis-query-section"
                           width="100%"
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
                        <cost-analysis-filters-popper ref="filtersPopperRef"
                                                      :visible="state.filtersPopoverVisible"
                        />
                    </template>
                </p-popover>
            </div>
            <div v-if="hasReadWriteAccess"
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
                                    :visible-menu="visibleContextMenu"
                                    :menu="state.saveDropdownMenuItems"
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
                                        request-type="SAVE"
                                        :selected-query-set-id="costAnalysisPageGetters.selectedQueryId"
                                        @update-query="handleUpdateQuery"
        />
        <p-button-modal
            :visible="state.visibleNotiModal"
            :header-title="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.POSSIBLE_PERFORMANCE_DELAY')"
            size="sm"
            @close="state.visibleNotiModal = false"
            @cancel="state.visibleNotiModal = false"
            @confirm="handleConfirmIsAllWorkspaceSelected"
        >
            <template #body>
                <p-scoped-notification type="warning"
                                       icon="ic_warning-filled"
                                       layout="in-section"
                >
                    {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALL_WORKSPACE_SELECTED_WARNING') }}
                </p-scoped-notification>
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-query-section {
    position: relative;
    margin-top: 1.5rem;

    .scope-wrapper {
        margin-bottom: 1rem;
        .workspace-scope-dropdown {
            width: 8.5rem;

            /* custom design-system component - p-select-dropdown */
            &:deep() {
                .selected-item-text {
                    @apply truncate;
                    display: block;
                    width: 6.5rem;
                }
            }
        }

        .menu-item-wrapper {
            @apply flex justify-between;
            max-width: 18rem;

            .label {
                @apply flex items-center gap-2;
            }
            .label-text {
                @apply truncate;
                max-width: 8.375rem;
            }
        }
    }

    .filter-wrapper {
        @apply flex justify-between;
        align-items: flex-start;
        font-size: 0.875rem;
        .left-part {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
            .granularity-dropdown {
                min-width: unset;
            }
        }
        .right-part {
            display: flex;
            align-items: flex-start;
            padding-left: 0.5rem;

            .save-button {
                border-top-right-radius: 0;
                border-bottom-right-radius: 0;
            }
            .more-menu-button {
                border-top-left-radius: 0;
                border-bottom-left-radius: 0;
                border-left: 0;
            }

            .p-context-menu {
                margin-top: -1px;
                min-width: 10rem !important;
            }
        }
        .filters-button {
            .filters-badge {
                margin-left: 0.25rem;
            }
        }
    }
    .invalid-text {
        @apply text-red-400 text-label-md;
        margin-top: 0.5rem;
    }
}
</style>
