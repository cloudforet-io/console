<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';


import {
    POverlayLayout, PToolbox, PButton,
} from '@cloudforet/mirinae';
import type { ToolboxOptions } from '@cloudforet/mirinae/src/navigation/toolbox/type';

import { SpaceRouter } from '@/router';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';

import DashboardManageVariableTable
    from '@/services/dashboards/components/legacy/DashboardManageVariableTable.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    visible: boolean;
}
const props = defineProps<Props>();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;

const { getProperRouteLocation } = useProperRouteLocation();
const queryTagsHelper = useQueryTags({});
const state = reactive({
    variableSchema: computed(() => dashboardDetailGetters.refinedVariablesSchema),
    selectedVariable: '' as string,
    variableNames: computed<string[]>(() => {
        const properties = state.variableSchema.properties;
        return state.variableSchema?.order?.map((d) => properties[d]?.name).filter((name) => name !== properties[state.selectedVariable]?.name) ?? [];
    }),
    deleteModalVisible: false,
    deleteModalLoading: false,
});

/* Helper */

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
const handleClickAddButton = () => {
    //
};
const handleClickImportButton = () => {
    //
};
const handleClickDeleteButton = () => {
    //
};
const handleClickEditButton = (variableKey: string) => {
    state.selectedVariable = variableKey;
};
const handleClickCloneButton = (variableKey: string) => {
    state.selectedVariable = variableKey;
};
const handleCloseOverlay = () => {
    SpaceRouter.router.replace(getProperRouteLocation({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: { dashboardId: dashboardDetailState.dashboardId ?? '' },
    }));
};
const handleConfirmDelete = () => {
    //
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
                              @click="handleClickAddButton"
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
        <delete-modal :header-title="$t('DASHBOARDS.DETAIL.VARIABLES.DELETE_MODAL_TITLE')"
                      :visible.sync="state.deleteModalVisible"
                      :loading="state.deleteModalLoading"
                      @confirm="handleConfirmDelete"
        />
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
