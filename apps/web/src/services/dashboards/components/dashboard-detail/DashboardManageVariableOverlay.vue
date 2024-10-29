<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { cloneDeep, orderBy } from 'lodash';

import {
    PButton, PIconButton, POverlayLayout, PToggleButton, PToolboxTable,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import { getClonedName } from '@cloudforet/utils';

import { SpaceRouter } from '@/router';
import type { DashboardGlobalVariable } from '@/schema/dashboard/_types/dashboard-global-variable-type';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import DashboardManageVariableImportModal
    from '@/services/dashboards/components/dashboard-detail/DashboardManageVariableImportModal.vue';
import DashboardVariablesFormModal
    from '@/services/dashboards/components/dashboard-detail/DashboardVariablesFormModal.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface GlobalVariableTableItem {
    key: string;
    name: string;
    type?: string;
    use?: boolean;
    created_by?: string;
    reference?: string|TranslateResult;
}
interface Props {
    visible: boolean;
}
const props = defineProps<Props>();
const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;

const { getProperRouteLocation } = useProperRouteLocation();
const state = reactive({
    selectedVariableKey: undefined as string|undefined,
    modalType: 'CREATE' as 'CREATE'|'UPDATE',
    formModalVisible: false,
    deleteModalVisible: false,
    deleteModalLoading: false,
    importModalVisible: false,
    thisPage: 1,
    pageSize: 15,
    searchText: '',
    globalVariablesTableItems: computed<GlobalVariableTableItem[]>(() => {
        const _properties: DashboardGlobalVariable[] = Object.values(dashboardDetailGetters.dashboardVarsSchemaProperties);
        const _tableItems: GlobalVariableTableItem[] = _properties.map((d) => ({
            ...d,
            type: d.method === 'manual' ? d.type : undefined,
            reference: d.method === 'dynamic' ? d?.reference?.resourceType : undefined,
        }));
        return orderBy(_tableItems, ['name'], ['asc']);
    }),
    searchedGlobalVariablesTableItems: computed<GlobalVariableTableItem[]>(() => {
        if (!state.searchText.length) return state.globalVariablesTableItems;
        return state.globalVariablesTableItems.filter((d) => d.name.toLowerCase().includes(state.searchText.toLowerCase()));
    }),
    variableFields: [
        { name: 'name', label: 'Name' },
        { name: 'key', label: 'Key' },
        { name: 'type', label: 'Type' },
        { name: 'reference', label: 'Reference' },
        { name: 'use', label: 'Use', width: '90px' },
        { name: 'created_by', label: 'Created By' },
        { name: 'buttons', label: ' ', width: '144px' },
    ] as DataTableField[],
});

/* Util */
const getSlicedVariableItems = (items: GlobalVariableTableItem[], thisPage: number, pageSize: number): GlobalVariableTableItem[] => {
    const _startIndex = (thisPage - 1) * pageSize;
    const _endIndex = thisPage * pageSize;
    return items.slice(_startIndex, _endIndex);
};

/* Api */
const deleteDashboardVarsSchema = async (dashboardId: string, variableKey: string) => {
    try {
        const _varsSchemaProperties = cloneDeep(dashboardDetailGetters.dashboardVarsSchemaProperties);
        delete _varsSchemaProperties[variableKey];
        await dashboardStore.updateDashboard(dashboardId, {
            dashboard_id: dashboardId,
            vars_schema: {
                properties: _varsSchemaProperties,
            },
        });
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_DELETE_DASHBOARD_VARS_SCHEMA'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_DELETE_DASHBOARD_VARS_SCHEMA'));
    }
};
const cloneDashboardVarsSchema = async (dashboardId: string, variableKey: string) => {
    try {
        const _clonedProperty = cloneDeep(dashboardDetailGetters.dashboardVarsSchemaProperties[variableKey]);
        const _varsNameList: string[] = Object.values(dashboardDetailGetters.dashboardVarsSchemaProperties).map((d) => d.name);
        const _varsKeyList: string[] = Object.values(dashboardDetailGetters.dashboardVarsSchemaProperties).map((d) => d.key);
        _clonedProperty.key = getClonedName(_varsKeyList, _clonedProperty.key, 'clone_');
        _clonedProperty.name = getClonedName(_varsNameList, _clonedProperty.name);
        await dashboardStore.updateDashboard(dashboardId, {
            dashboard_id: dashboardId,
            vars_schema: {
                properties: {
                    ...dashboardDetailGetters.dashboardVarsSchemaProperties,
                    [_clonedProperty.key]: {
                        ..._clonedProperty,
                        use: false,
                        created_by: store.state.user.userId,
                    },
                },
            },
        });
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_CLONE_DASHBOARD_VARS_SCHEMA'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_CLONE_DASHBOARD_VARS_SCHEMA'));
    }
};
const updateUseDashboardVarsSchema = async (dashboardId: string, variableKey: string, use: boolean) => {
    try {
        await dashboardStore.updateDashboard(dashboardId, {
            dashboard_id: dashboardId,
            vars_schema: {
                properties: {
                    ...dashboardDetailGetters.dashboardVarsSchemaProperties,
                    [variableKey]: {
                        ...dashboardDetailGetters.dashboardVarsSchemaProperties[variableKey],
                        use,
                    },
                },
            },
        });
        showSuccessMessage(i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_UPDATE_DASHBOARD_VARS_SCHEMA'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_UPDATE_DASHBOARD_VARS_SCHEMA'));
    }
};

/* Event */
const handleClickCreateButton = () => {
    state.modalType = 'CREATE';
    state.formModalVisible = true;
};
const handleClickImportButton = () => {
    state.importModalVisible = true;
};
const handleClickDeleteButton = (variableKey: string) => {
    state.selectedVariableKey = variableKey;
    state.deleteModalVisible = true;
};
const handleClickEditButton = (variableKey: string) => {
    state.modalType = 'UPDATE';
    state.selectedVariableKey = variableKey;
    state.formModalVisible = true;
};
const handleClickCloneButton = (variableKey: string) => {
    if (!dashboardDetailState.dashboardId) return;
    cloneDashboardVarsSchema(dashboardDetailState.dashboardId, variableKey);
};
const handleToggleUse = (variableKey: string, val: boolean) => {
    if (!dashboardDetailState.dashboardId) return;
    updateUseDashboardVarsSchema(dashboardDetailState.dashboardId, variableKey, val);
};
const handleCloseOverlay = () => {
    SpaceRouter.router.replace(getProperRouteLocation({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: { dashboardId: dashboardDetailState.dashboardId ?? '' },
    }));
};
const handleConfirmDelete = () => {
    if (!dashboardDetailState.dashboardId || !state.selectedVariableKey) return;
    deleteDashboardVarsSchema(dashboardDetailState.dashboardId, state.selectedVariableKey);
    state.deleteModalVisible = false;
};
</script>

<template>
    <p-overlay-layout :visible="props.visible"
                      style-type="secondary"
                      size="full"
                      :title="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE')"
                      class="dashboard-manage-variable-overlay"
                      @close="handleCloseOverlay"
    >
        <p-toolbox-table :fields="state.variableFields"
                         :loading="dashboardDetailState.loadingDashboard"
                         :items="getSlicedVariableItems(state.searchedGlobalVariablesTableItems, state.thisPage, state.pageSize)"
                         :page-size-options="[15, 30, 45]"
                         :page-size.sync="state.pageSize"
                         :this-page.sync="state.thisPage"
                         :total-count="state.searchedGlobalVariablesTableItems.length"
                         searchable
                         :search-text.sync="state.searchText"
                         :refreshable="false"
                         class="content-wrapper"
        >
            <template #toolbox-left>
                <p-button icon-left="ic_plus_bold"
                          style-type="primary"
                          class="mr-4"
                          @click="handleClickCreateButton"
                >
                    {{ $t('DASHBOARDS.DETAIL.VARIABLES.CREATE') }}
                </p-button>
                <p-button icon-left="ic_collect"
                          style-type="substitutive"
                          @click="handleClickImportButton"
                >
                    {{ $t('DASHBOARDS.DETAIL.VARIABLES.IMPORT') }}
                </p-button>
            </template>
            <template #col-type-format="{ value }">
                {{ value || '-' }}
            </template>
            <template #col-reference-format="{ value }">
                {{ value || '-' }}
            </template>
            <template #col-use-format="{ value, item }">
                <p-toggle-button :value="value"
                                 :disabled="item.disabled || item.required || item.fixed || item.readonly"
                                 @change-toggle="handleToggleUse(item.key, $event)"
                />
            </template>
            <template #col-buttons-format="{ item }">
                <div class="button-wrapper">
                    <p-icon-button name="ic_clone"
                                   size="sm"
                                   @click="handleClickCloneButton(item.key)"
                    />
                    <p-icon-button name="ic_edit"
                                   size="sm"
                                   @click="handleClickEditButton(item.key)"
                    />
                    <p-icon-button name="ic_delete"
                                   size="sm"
                                   style-type="negative-transparent"
                                   @click="handleClickDeleteButton(item.key)"
                    />
                </div>
            </template>
        </p-toolbox-table>
        <dashboard-variables-form-modal :modal-type="state.modalType"
                                        :variable-key="state.selectedVariableKey"
                                        :visible.sync="state.formModalVisible"
        />
        <delete-modal :header-title="$t('DASHBOARDS.DETAIL.VARIABLES.DELETE_MODAL_TITLE')"
                      :visible.sync="state.deleteModalVisible"
                      :loading="state.deleteModalLoading"
                      @confirm="handleConfirmDelete"
        />
        <dashboard-manage-variable-import-modal :visible.sync="state.importModalVisible" />
    </p-overlay-layout>
</template>

<style lang="postcss" scoped>
.dashboard-manage-variable-overlay {
    .content-wrapper {
        @apply bg-white border border-gray-200 rounded-md;
        width: 100%;
        height: fit-content;
        padding-bottom: 1.5rem;
        margin: 0 1.5rem;
    }
}
</style>
