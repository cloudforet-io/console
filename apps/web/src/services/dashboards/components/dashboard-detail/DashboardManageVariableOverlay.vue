<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { useMutation } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';

import {
    PButton, PIconButton, POverlayLayout, PToggleButton, PToolboxTable, PScopedNotification,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import { getClonedName } from '@cloudforet/utils';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import DashboardManageVariableImportModal
    from '@/services/dashboards/components/dashboard-detail/DashboardManageVariableImportModal.vue';
import DashboardVariablesFormModal
    from '@/services/dashboards/components/dashboard-detail/DashboardVariablesFormModal.vue';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import {
    DASHBOARD_VARS_SCHEMA_PRESET,
} from '@/services/dashboards/constants/dashboard-vars-schema-preset';
import { getOrderedGlobalVariables } from '@/services/dashboards/helpers/dashboard-global-variables-helper';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';



type DashboardModel = PrivateDashboardModel | PublicDashboardModel;
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
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
const userStore = useUserStore();

/* Query */
const {
    keys,
    functions,
    queryClient,
} = useDashboardQuery();

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
        const _orderedProperties = getOrderedGlobalVariables(_properties);
        return _orderedProperties.map((d) => ({
            ...d,
            type: d.method === 'manual' ? d.type : undefined,
            reference: d.method === 'dynamic' ? d?.reference?.resourceType : undefined,
        }));
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
    showDeleteWarning: computed<boolean>(() => {
        const _varsKeys = Object.keys(dashboardDetailGetters.dashboardInfo?.vars || {});
        return _varsKeys.includes(state.selectedVariableKey);
    }),
    actionType: 'DELETE' as 'DELETE'|'CLONE'|'UPDATE',
    successMessage: computed(() => {
        if (state.updateType === 'DELETE') return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_DELETE_DASHBOARD_VARS_SCHEMA');
        if (state.updateType === 'CLONE') return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_CLONE_DASHBOARD_VARS_SCHEMA');
        return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_S_UPDATE_DASHBOARD_VARS_SCHEMA');
    }),
    failMessage: computed(() => {
        if (state.updateType === 'DELETE') return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_DELETE_DASHBOARD_VARS_SCHEMA');
        if (state.updateType === 'CLONE') return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_CLONE_DASHBOARD_VARS_SCHEMA');
        return i18n.t('DASHBOARDS.DETAIL.VARIABLES.ALT_E_UPDATE_DASHBOARD_VARS_SCHEMA');
    }),
});

/* Util */
const getSlicedVariableItems = (items: GlobalVariableTableItem[], thisPage: number, pageSize: number): GlobalVariableTableItem[] => {
    const _startIndex = (thisPage - 1) * pageSize;
    const _endIndex = thisPage * pageSize;
    return items.slice(_startIndex, _endIndex);
};
const isPresetVarsSchemaProperty = (key: string): boolean => {
    const _presetKeys: string[] = Object.keys(DASHBOARD_VARS_SCHEMA_PRESET.properties);
    return _presetKeys.includes(key);
};

/* Api */
const deleteDashboardVarsSchema = async (dashboardId: string, variableKey: string) => {
    const _varsSchemaProperties = cloneDeep(dashboardDetailGetters.dashboardVarsSchemaProperties);
    delete _varsSchemaProperties[variableKey];
    const _vars = cloneDeep(dashboardDetailGetters.dashboardInfo?.vars || {});
    const _tempVars = cloneDeep(dashboardDetailState.vars);
    delete _vars[variableKey];
    delete _tempVars[variableKey];
    dashboardDetailStore.setVars(_tempVars);
    mutate({
        dashboard_id: dashboardId,
        vars_schema: {
            properties: _varsSchemaProperties,
        },
        vars: _vars,
    });
};
const cloneDashboardVarsSchema = async (dashboardId: string, variableKey: string) => {
    const _clonedProperty = cloneDeep(dashboardDetailGetters.dashboardVarsSchemaProperties[variableKey]);
    const _varsNameList: string[] = Object.values(dashboardDetailGetters.dashboardVarsSchemaProperties).map((d) => d.name);
    const _varsKeyList: string[] = Object.values(dashboardDetailGetters.dashboardVarsSchemaProperties).map((d) => d.key);
    _clonedProperty.key = getClonedName(_varsKeyList, _clonedProperty.key, 'clone_');
    _clonedProperty.name = getClonedName(_varsNameList, _clonedProperty.name);
    mutate({
        dashboard_id: dashboardId,
        vars_schema: {
            properties: {
                ...dashboardDetailGetters.dashboardVarsSchemaProperties,
                [_clonedProperty.key]: {
                    ..._clonedProperty,
                    use: false,
                    created_by: userStore.state.userId,
                },
            },
        },
    });
};
const updateUseDashboardVarsSchema = (dashboardId: string, variableKey: string, use: boolean) => {
    const _vars = cloneDeep(dashboardDetailGetters.dashboardInfo?.vars || {});
    const _tempVars = cloneDeep(dashboardDetailState.vars);
    delete _vars[variableKey];
    delete _tempVars[variableKey];
    dashboardDetailStore.setVars(_tempVars);
    mutate({
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
        vars: _vars,
    });
};

const { mutate } = useMutation(
    {
        mutationFn: functions.updateDashboardFn,
        onSuccess: (dashboard: DashboardModel) => {
            const isPrivate = dashboard.dashboard_id.startsWith('private');
            const dashboardListQueryKey = isPrivate ? keys.privateDashboardListQueryKey : keys.publicDashboardListQueryKey;
            queryClient.invalidateQueries({ queryKey: dashboardListQueryKey.value });
            showSuccessMessage(state.successMessage, '');
        },
        onError: (e) => {
            ErrorHandler.handleRequestError(e, state.failMessage);
        },
        onSettled() {
            if (state.actionType === 'DELETE') state.deleteModalVisible = false;
        },
    },
);

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
    state.actionType = 'CLONE';
    cloneDashboardVarsSchema(dashboardDetailState.dashboardId, variableKey);
};
const handleToggleUse = (variableKey: string, val: boolean) => {
    if (!dashboardDetailState.dashboardId) return;
    state.actionType = 'UPDATE';
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
    state.actionType = 'DELETE';
    deleteDashboardVarsSchema(dashboardDetailState.dashboardId, state.selectedVariableKey);
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
            <template #col-created_by-format="{ value }">
                {{ value || 'System' }}
            </template>
            <template #col-buttons-format="{ item }">
                <div class="button-wrapper">
                    <template v-if="!isPresetVarsSchemaProperty(item.key)">
                        <p-icon-button name="ic_edit"
                                       size="sm"
                                       @click="handleClickEditButton(item.key)"
                        />
                        <p-icon-button name="ic_delete"
                                       size="sm"
                                       style-type="negative-transparent"
                                       @click="handleClickDeleteButton(item.key)"
                        />
                    </template>
                    <p-icon-button name="ic_clone"
                                   size="sm"
                                   @click="handleClickCloneButton(item.key)"
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
        >
            <template #delete-modal-body>
                <p-scoped-notification v-if="state.showDeleteWarning"
                                       type="warning"
                                       icon="ic_warning-filled"
                                       layout="in-section"
                                       class="mt-4"
                >
                    {{ $t('DASHBOARDS.DETAIL.VARIABLES.DELETE_WARNING') }}
                </p-scoped-notification>
            </template>
        </delete-modal>
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
