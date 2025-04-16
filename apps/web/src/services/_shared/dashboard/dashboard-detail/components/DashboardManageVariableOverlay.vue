<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { cloneDeep } from 'lodash';

import {
    PButton, PIconButton, POverlayLayout, PToggleButton, PToolboxTable, PScopedNotification,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { getClonedName } from '@cloudforet/utils';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type {
    DashboardGlobalVariableSchemaProperties,
    DashboardModel,
} from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import DashboardVariablesFormModal
    from '@/services/_shared/dashboard/dashboard-detail/components/DashboardVariablesFormModal.vue';
import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import {
    DASHBOARD_VARS_SCHEMA_PRESET,
} from '@/services/_shared/dashboard/dashboard-detail/constants/dashboard-vars-schema-preset';
import { getOrderedGlobalVariables } from '@/services/_shared/dashboard/dashboard-detail/helpers/dashboard-global-variables-helper';
import { useDashboardDetailInfoStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-detail-info-store';


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
    dashboardId: string;
}
const props = defineProps<Props>();
const userStore = useUserStore();
const dashboardDetailInfoStore = useDashboardDetailInfoStore();
const router = useRouter();
const dashboardId = computed(() => props.dashboardId);

/* Query */
const {
    dashboard,
    keys,
    fetcher,
    isLoading,
} = useDashboardGetQuery({
    dashboardId,
});
const queryClient = useQueryClient();


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
    dashboardVarsSchemaProperties: computed<DashboardGlobalVariableSchemaProperties>(() => dashboard.value?.vars_schema?.properties ?? {}),
    globalVariablesTableItems: computed<GlobalVariableTableItem[]>(() => {
        const _properties: DashboardGlobalVariable[] = Object.values(state.dashboardVarsSchemaProperties);
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
        const _varsKeys = Object.keys(dashboard.value?.vars || {});
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
const deleteDashboardVarsSchema = async (_dashboardId: string, variableKey: string) => {
    const _varsSchemaProperties = cloneDeep(state.dashboardVarsSchemaProperties);
    delete _varsSchemaProperties[variableKey];
    const _vars = cloneDeep(dashboard.value?.vars || {});
    delete _vars[variableKey];
    mutate({
        dashboard_id: _dashboardId,
        vars_schema: {
            properties: _varsSchemaProperties,
        },
        vars: _vars,
    });
};
const cloneDashboardVarsSchema = async (_dashboardId: string, variableKey: string) => {
    const _clonedProperty = cloneDeep(state.dashboardVarsSchemaProperties[variableKey]);
    const _varsNameList: string[] = Object.values(state.dashboardVarsSchemaProperties).map((d) => d.name);
    const _varsKeyList: string[] = Object.values(state.dashboardVarsSchemaProperties).map((d) => d.key);
    _clonedProperty.key = getClonedName(_varsKeyList, _clonedProperty.key, 'clone_');
    _clonedProperty.name = getClonedName(_varsNameList, _clonedProperty.name);
    mutate({
        dashboard_id: _dashboardId,
        vars_schema: {
            properties: {
                ...state.dashboardVarsSchemaProperties,
                [_clonedProperty.key]: {
                    ..._clonedProperty,
                    use: false,
                    created_by: userStore.state.userId,
                },
            },
        },
    });
};
const updateUseDashboardVarsSchema = (_dashboardId: string, variableKey: string, use: boolean) => {
    const _vars = cloneDeep(dashboard.value?.vars || {});
    delete _vars[variableKey];
    mutate({
        dashboard_id: _dashboardId,
        vars_schema: {
            properties: {
                ...state.dashboardVarsSchemaProperties,
                [variableKey]: {
                    ...state.dashboardVarsSchemaProperties[variableKey],
                    use,
                },
            },
        },
        vars: _vars,
    });
};

const { mutate } = useMutation(
    {
        mutationFn: fetcher.updateDashboardFn,
        onSuccess: (_dashboard: DashboardModel) => {
            const isPrivate = _dashboard.dashboard_id.startsWith('private');
            const dashboardQueryKey = isPrivate ? keys.privateDashboardGetQueryKey : keys.publicDashboardGetQueryKey;
            queryClient.setQueryData(dashboardQueryKey.value, (oldDashboard) => {
                if (!oldDashboard) return oldDashboard;
                return {
                    ...oldDashboard,
                    vars_schema: _dashboard.vars_schema,
                    vars: _dashboard.vars,
                };
            });
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
    dashboardDetailInfoStore.setVariableImportModalVisible(true);
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
    if (!dashboardId.value) return;
    state.actionType = 'CLONE';
    cloneDashboardVarsSchema(dashboardId.value, variableKey);
};
const handleToggleUse = (variableKey: string, val: boolean) => {
    if (!dashboardId.value) return;
    state.actionType = 'UPDATE';
    updateUseDashboardVarsSchema(dashboardId.value, variableKey, val);
};
const handleCloseOverlay = () => {
    const _currentRoute = router.currentRoute;
    if (!_currentRoute.name) {
        console.error('currentRoute is not provided');
        return;
    }
    router.replace({
        name: _currentRoute.name,
        params: _currentRoute.params,
    }).catch(() => {});
};
const handleConfirmDelete = () => {
    if (!dashboardId.value || !state.selectedVariableKey) return;
    state.actionType = 'DELETE';
    deleteDashboardVarsSchema(dashboardId.value, state.selectedVariableKey);
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
                         :loading="isLoading"
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
                                        :dashboard-id="dashboardId"
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
