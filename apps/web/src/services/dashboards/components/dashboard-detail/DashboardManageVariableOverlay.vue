<script setup lang="ts">
import {
    reactive,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    POverlayLayout, PToolbox, PButton,
} from '@cloudforet/mirinae';
import type { ToolboxOptions } from '@cloudforet/mirinae/src/navigation/toolbox/type';
import { getClonedName } from '@cloudforet/utils';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';

import DashboardManageVariableImportModal
    from '@/services/dashboards/components/dashboard-detail/DashboardManageVariableImportModal.vue';
import DashboardManageVariableTable
    from '@/services/dashboards/components/dashboard-detail/DashboardManageVariableTable.vue';
import DashboardVariablesFormModal
    from '@/services/dashboards/components/dashboard-detail/DashboardVariablesFormModal.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';



interface Props {
    visible: boolean;
}
const props = defineProps<Props>();
const dashboardStore = useDashboardStore();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;

const { getProperRouteLocation } = useProperRouteLocation();
const queryTagsHelper = useQueryTags({});
const state = reactive({
    selectedVariableKey: undefined as string|undefined,
    modalType: 'CREATE' as 'CREATE'|'UPDATE',
    formModalVisible: false,
    deleteModalVisible: false,
    deleteModalLoading: false,
    importModalVisible: false,
});

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

/* Event */
const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (options.queryTags !== undefined) queryTagsHelper.setQueryTags(options.queryTags);
    if (options.pageLimit !== undefined) {
        // state.pageLimit = options.pageLimit;
        // state.pageStart = 1;
    }
    if (options.pageStart !== undefined) {
        // state.pageStart = options.pageStart;
    }
};
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
        <div class="content-wrapper">
            <p-toolbox searchable
                       :page-size-options="[15, 30, 45]"
                       :page-size="15"
                       :this-page="1"
                       @change="handleChangeToolbox"
            >
                <template #left-area>
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
            </p-toolbox>
            <dashboard-manage-variable-table @delete="handleClickDeleteButton"
                                             @edit="handleClickEditButton"
                                             @clone="handleClickCloneButton"
            />
        </div>
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
        padding: 1.5rem;
        margin: 0 1.5rem;
    }
}
</style>
