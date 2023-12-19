<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PI, PIconButton, PHeading, PSkeleton,
} from '@spaceone/design-system';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { gray } from '@/styles/colors';

import DashboardCloneModal from '@/services/dashboards/components/DashboardCloneModal.vue';
import DashboardControlButtons from '@/services/dashboards/components/DashboardControlButtons.vue';
import DashboardDeleteModal from '@/services/dashboards/components/DashboardDeleteModal.vue';
import DashboardNameEditModal from '@/services/dashboards/components/DashboardNameEditModal.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    dashboardId: string;
}
const props = defineProps<Props>();

const PUBLIC_ICON_COLOR = gray[500];

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;
const state = reactive({
    nameEditModalVisible: false,
    deleteModalVisible: false,
    cloneModalVisible: false,
});

/* Event */
const handleVisibleNameEditModal = () => {
    state.nameEditModalVisible = true;
};
const handleVisibleDeleteModal = () => {
    state.deleteModalVisible = true;
};
const handleVisibleCloneModal = () => {
    state.cloneModalVisible = true;
};
const handleNameUpdate = (name: string) => {
    dashboardDetailStore.setName(name);
    dashboardDetailStore.setOriginDashboardName(name);
};

</script>

<template>
    <div>
        <p-heading :title="dashboardDetailState.name">
            <p-skeleton v-if="!dashboardDetailState.name"
                        width="20rem"
                        height="1.5rem"
            />
            <template v-if="dashboardDetailState.name && dashboardDetailGetters.dashboardType === 'PUBLIC'"
                      #title-left-extra
            >
                <div class="title-left-extra">
                    <p-i name="ic_globe-filled"
                         width="1rem"
                         height="1rem"
                         :color="PUBLIC_ICON_COLOR"
                    />
                </div>
            </template>
            <template v-if="dashboardDetailState.name"
                      #title-right-extra
            >
                <div class="title-right-extra">
                    <div class="favorite-button-wrapper">
                        <favorite-button :item-id="props.dashboardId"
                                         :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                         scale="0.8"
                        />
                    </div>
                    <p-icon-button name="ic_edit-text"
                                   size="md"
                                   @click="handleVisibleNameEditModal"
                    />
                    <p-icon-button name="ic_delete"
                                   size="md"
                                   class="delete-button"
                                   @click="handleVisibleDeleteModal"
                    />
                </div>
            </template>
            <template #extra>
                <dashboard-control-buttons :dashboard-id="props.dashboardId"
                                           :name="dashboardDetailState.name"
                                           @update:visible-clone-modal="handleVisibleCloneModal"
                />
            </template>
        </p-heading>
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="props.dashboardId"
                                   :name="dashboardDetailState.name"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-delete-modal :visible.sync="state.deleteModalVisible"
                                :dashboard-id="props.dashboardId"
        />
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible"
                               :dashboard-detail-info="dashboardDetailState"
        />
    </div>
</template>

<style lang="postcss" scoped>
.p-heading {
    margin-bottom: 0.75rem;
}
.title-left-extra {
    @apply inline-block;
    height: 2rem;
    margin-top: 0.075rem;
}
.title-right-extra {
    @apply flex-shrink-0 inline-flex items-center;
    margin-bottom: -0.25rem;
    gap: 0.5rem;
    .favorite-button-wrapper {
        @apply flex items-center justify-center;
        width: 1.25rem;
        height: 1.25rem;
    }
}
</style>
