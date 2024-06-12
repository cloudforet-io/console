<script lang="ts" setup>
import { reactive } from 'vue';

import {
    PIconButton, PHeading, PSkeleton,
} from '@spaceone/design-system';

import DashboardCloneModal from '@/services/dashboards/components/DashboardCloneModal.vue';
import DashboardControlButtons from '@/services/dashboards/components/DashboardControlButtons.vue';
import DashboardDeleteModal from '@/services/dashboards/components/DashboardDeleteModal.vue';
import DashboardNameEditModal from '@/services/dashboards/components/DashboardNameEditModal.vue';
import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    dashboardId: string;
    templateName?: string;
}
const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;
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
    <div class="dashboard-detail-header">
        <p-heading :title="dashboardDetailState.name">
            <p-skeleton v-if="!dashboardDetailState.name"
                        width="20rem"
                        height="1.5rem"
            />
            <template v-if="dashboardDetailState.name"
                      #title-right-extra
            >
                <div class="title-right-extra">
                    <p-icon-button name="ic_edit-text"
                                   size="md"
                                   @click="handleVisibleNameEditModal"
                    />
                    <p-icon-button name="ic_duplicate"
                                   size="md"
                                   @click="handleVisibleCloneModal"
                    />
                    <p-icon-button name="ic_delete"
                                   size="md"
                                   class="delete-button"
                                   @click="handleVisibleDeleteModal"
                    />
                </div>
            </template>
            <template v-if="!dashboardDetailGetters.isDeprecatedDashboard"
                      #extra
            >
                <dashboard-control-buttons :dashboard-id="props.dashboardId"
                                           :name="dashboardDetailState.name"
                />
            </template>
        </p-heading>
        <p v-if="props.templateName"
           class="template-name"
        >
            {{ props.templateName }}
        </p>
        <dashboard-name-edit-modal :visible.sync="state.nameEditModalVisible"
                                   :dashboard-id="props.dashboardId"
                                   :name="dashboardDetailState.name"
                                   @confirm="handleNameUpdate"
        />
        <dashboard-delete-modal :visible.sync="state.deleteModalVisible"
                                :dashboard-id="props.dashboardId"
        />
        <dashboard-clone-modal :visible.sync="state.cloneModalVisible"
                               :dashboard="dashboardDetailState.dashboardInfo"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-detail-header {
    margin-bottom: 0.75rem;
    .p-heading {
        margin-bottom: 0;
    }
    .title-right-extra {
        @apply flex-shrink-0 inline-flex items-center;
        margin-bottom: -0.25rem;
        .favorite-button {
            margin: 0 0.25rem;
        }
    }
    .template-name {
        @apply text-paragraph-sm text-gray-500;
        margin-left: 2.5rem;
    }
}
</style>
