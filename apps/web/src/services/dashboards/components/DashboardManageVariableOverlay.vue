<script setup lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PButton, PHeading,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';


import getRandomId from '@/lib/random-id-generator';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import OverlayPageLayout from '@/common/modules/page-layouts/OverlayPageLayout.vue';

import DashboardManageVariableForm from '@/services/dashboards/components/DashboardManageVariableForm.vue';
import DashboardManageVariableTable
    from '@/services/dashboards/components/DashboardManageVariableTable.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';
import type {
    DashboardVariableSchemaProperty,
    DashboardVariablesSchema,
} from '@/services/dashboards/types/dashboard-model-type';
import type { ManageVariableOverlayStatus } from '@/services/dashboards/types/manage-variable-type';

interface Props {
    visible: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const route = useRoute();

const state = reactive({
    contentType: 'LIST' as ManageVariableOverlayStatus,
    titleSet: computed<Record<ManageVariableOverlayStatus, TranslateResult>>(() => ({
        LIST: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.SUB_TITLE'),
        ADD: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD'),
        CLONE: i18n.t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD'),
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
    // variables schema
    const properties = cloneDeep(state.variableSchema.properties) as DashboardVariablesSchema['properties'];
    delete properties[state.selectedVariable];
    const order = state.variableSchema.order.filter((d) => d !== state.selectedVariable);
    dashboardDetailStore.setVariablesSchema({ properties, order });

    // variables
    const _variables = cloneDeep(dashboardDetailState.variables);
    delete _variables[state.selectedVariable];
    dashboardDetailStore.setVariables(_variables);
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
        state.contentType = 'LIST';
    }
    resetDeleteModalState();
};
const handleChangeEditContent = (propertyName: string) => {
    state.selectedVariable = propertyName;
    state.contentType = 'EDIT';
};
const handleChangeCloneContent = (propertyName: string) => {
    state.selectedVariable = propertyName;
    state.contentType = 'CLONE';
};
const handleSaveVariable = (variable: DashboardVariableSchemaProperty) => {
    const properties = cloneDeep(state.variableSchema.properties) as DashboardVariablesSchema['properties'];
    if (state.contentType === 'ADD' || state.contentType === 'CLONE') {
        const variableKey = getRandomId();
        properties[variableKey] = variable;
        dashboardDetailStore.setVariablesSchema({
            properties,
            order: [...state.variableSchema.order, variableKey],
        });
    } else {
        const selectedProperty = state.selectedVariable;
        properties[selectedProperty] = variable;
        dashboardDetailStore.setVariablesSchema({
            ...dashboardDetailState.variablesSchema,
            properties,
        });

        // variables
        const _variables = cloneDeep(dashboardDetailState.variables);
        delete _variables[selectedProperty];
        dashboardDetailStore.setVariables(_variables);
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
    if (route.name === DASHBOARDS_ROUTE.CREATE._NAME) {
        SpaceRouter.router.replace({
            name: DASHBOARDS_ROUTE.CREATE._NAME,
        });
    } else {
        SpaceRouter.router.replace({
            name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
            params: { dashboardId: dashboardDetailState.dashboardId ?? '' },
        });
    }
};
const handleClickCancel = () => {
    deleteModalState.type = 'CANCEL';
    deleteModalState.visible = true;
};

const {
    contentType, titleSet, selectedVariable, variableNames, variableSchema,
} = toRefs(state);

</script>

<template>
    <overlay-page-layout :visible="visible"
                         class="dashboard-manage-variable-overay"
    >
        <p-heading :title="$t('DASHBOARDS.CUSTOMIZE.VARIABLES.TITLE')"
                   show-back-button
                   @click-back-button="handleClickGoBackButton"
        />
        <div class="content-wrapper">
            <p-heading heading-type="sub"
                       :use-total-count="contentType === 'LIST'"
                       :total-count="variableSchema.order.length"
                       :title="titleSet[contentType]"
            >
                <template #extra>
                    <div class="add-button-wrapper">
                        <p-button v-if="contentType === 'LIST'"
                                  icon-left="ic_plus_bold"
                                  @click="handleChangeAddContent"
                        >
                            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.ADD') }}
                        </p-button>
                        <p-button v-else-if="contentType === 'EDIT'"
                                  icon-left="ic_delete"
                                  style-type="negative-secondary"
                                  @click="handleOpenDeleteModal"
                        >
                            {{ $t('DASHBOARDS.CUSTOMIZE.VARIABLES.DELETE') }}
                        </p-button>
                    </div>
                </template>
            </p-heading>
            <dashboard-manage-variable-table v-if="contentType === 'LIST'"
                                             @delete="handleOpenDeleteModal"
                                             @edit="handleChangeEditContent"
                                             @clone="handleChangeCloneContent"
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
