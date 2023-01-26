<template>
    <overlay-page-layout :visible="visible"
                         class="dashboard-manage-variable-overay"
    >
        <p-page-title :title="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE')"
                      child
                      @goBack="handleClickGoBackButton"
        />
        <div class="content-wrapper">
            <p-panel-top :use-total-count="contentType === 'LIST'"
                         :total-count="variableSchema.order.length"
            >
                <template #default>
                    {{ titleSet[contentType] }}
                </template>
                <template #extra>
                    <div class="add-button-wrapper">
                        <p-button v-if="contentType === 'LIST'"
                                  icon-left="ic_plus"
                                  @click="handleChangeAddContent"
                        >
                            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD') }}
                        </p-button>
                        <p-button v-else-if="contentType === 'EDIT'"
                                  icon-left="ic_trashcan"
                                  style-type="negative-secondary"
                                  @click="handleOpenDeleteModal"
                        >
                            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE') }}
                        </p-button>
                    </div>
                </template>
            </p-panel-top>
            <dashboard-manage-variable-table v-if="contentType === 'LIST'"
                                             @delete="handleOpenDeleteModal"
                                             @edit="handleChangeEditContent"
            />
            <dashboard-manage-variable-form v-else
                                            :content-type.sync="contentType"
                                            :variable-names="variableNames"
                                            :selected-variable="variableSchema.properties[selectedVariable]"
                                            @save-click="handleSaveVariable"
                                            @cancel-click="handleClickCancel"
            />
        </div>
        <delete-modal :header-title="deleteModalState.headerTitle"
                      :contents="deleteModalState.contents"
                      :visible.sync="deleteModalState.visible"
                      :loading="deleteModalState.loading"
                      @confirm="handleConfirmModalAction"
        />
    </overlay-page-layout>
</template>

<script setup lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';


import {
    PPanelTop,
    PButton,
    PPageTitle,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { getUUID } from '@/lib/component-util/getUUID';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import OverlayPageLayout from '@/common/modules/page-layouts/OverlayPageLayout.vue';

import type { DashboardVariablesSchema, DashboardVariableSchemaProperty } from '@/services/dashboards/config';
import DashboardManageVariableForm from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/modules/DashboardManageVariableForm.vue';
import DashboardManageVariableTable
    from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/modules/DashboardManageVariableTable.vue';
import type {
    OverlayStatus,
} from '@/services/dashboards/dashboard-customize/modules/dashboard-manage-variable-overlay/type';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

interface Props {
    visible: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailOriginState = dashboardDetailStore.originState;

const state = reactive({
    contentType: 'LIST' as OverlayStatus,
    titleSet: computed<Record<OverlayStatus, TranslateResult>>(() => ({
        LIST: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SUB_TITLE'),
        ADD: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD'),
        EDIT: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SUB_TITLE_EDIT'),
    })),
    variableSchema: computed(() => dashboardDetailState.variablesSchema),
    selectedVariable: '' as string,
    variableNames: computed<string[]>(() => {
        const properties = state.variableSchema.properties;
        return state.variableSchema.order.map((d) => properties[d]?.name).filter((name) => name !== properties[state.selectedVariable]?.name);
    }),
});

const deleteModalState = reactive({
    type: 'DELETE' as 'DELETE' | 'ESCAPE' | 'CANCEL',
    headerTitle: computed<TranslateResult>(() => {
        if (deleteModalState.type === 'DELETE') return i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE_TITLE');
        return i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.CHECK_MODAL_DELETE_TITLE');
    }),
    contents: computed<TranslateResult>(() => {
        if (deleteModalState.type === 'DELETE') return '';
        return i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.CHECK_MODAL_CONTENTS');
    }),
    visible: false,
    loading: false,
});

/* Helper */
const deleteVariable = () => {
    const properties = cloneDeep(state.variableSchema.properties) as DashboardVariablesSchema['properties'];
    delete properties[state.selectedVariable];
    const order = state.variableSchema.order.filter((d) => d !== state.selectedVariable);
    dashboardDetailState.variablesSchema = { properties, order };
    delete dashboardDetailState.variables[state.selectedVariable];
};
const resetDeleteModalState = () => {
    deleteModalState.visible = false;
    state.selectedVariable = '';
    if (state.contentType !== 'LIST') state.contentType = 'LIST';
};

/* Event */
const handleChangeAddContent = () => {
    state.contentType = 'ADD';
};
const handleOpenDeleteModal = (propertyName: string) => {
    if (state.contentType === 'LIST') state.selectedVariable = propertyName;
    deleteModalState.type = 'DELETE';
    deleteModalState.visible = true;
};
const handleConfirmModalAction = () => {
    if (deleteModalState.type === 'DELETE') {
        deleteVariable();
    } else if (deleteModalState.type === 'ESCAPE') {
        SpaceRouter.router.go(-1);
    }
    resetDeleteModalState();
};
const handleChangeEditContent = (propertyName: string) => {
    state.selectedVariable = propertyName;
    state.contentType = 'EDIT';
};
const handleSaveVariable = (variable: DashboardVariableSchemaProperty) => {
    const properties = cloneDeep(state.variableSchema.properties) as DashboardVariablesSchema['properties'];
    if (state.contentType === 'ADD') {
        const variableKey = getUUID();
        properties[variableKey] = variable;
        dashboardDetailState.variablesSchema = { properties, order: [...state.variableSchema.order, variableKey] };
    } else {
        const selectedProperty = state.selectedVariable;
        properties[selectedProperty] = variable;
        dashboardDetailState.variablesSchema = { ...dashboardDetailState.variablesSchema, properties };
        delete dashboardDetailState.variables[selectedProperty];
    }
    state.selectedVariable = '';
    state.contentType = 'LIST';
};
const handleClickGoBackButton = () => {
    if (state.contentType !== 'LIST') {
        deleteModalState.type = 'ESCAPE';
        deleteModalState.visible = true;
        return;
    }
    SpaceRouter.router.replace({
        name: dashboardDetailOriginState.isProjectDashboard ? DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME : DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME,
        params: { dashboardId: dashboardDetailState.dashboardId ?? '' },
    });
};
const handleClickCancel = () => {
    deleteModalState.type = 'CANCEL';
    deleteModalState.visible = true;
};

const {
    contentType, titleSet, selectedVariable, variableNames, variableSchema,
} = toRefs(state);

</script>

<style lang="postcss" scoped>
.dashboard-manage-variable-overay {
    @apply bg-gray-100;

    .content-wrapper {
        @apply relative bg-white border border-gray-200 rounded-md ;

        .add-button-wrapper {
            @apply flex justify-end;
        }
        .list-wrapper {
            .variable-select-filter {
                @apply flex items-center;
                height: 2.875rem;
                gap: 1rem;
                padding: 0.75rem 1rem;

                .filter-header {
                    @apply text-gray-500;
                    font-size: 0.875rem;
                    line-height: 1.25;
                }
            }
        }
    }
}
</style>
