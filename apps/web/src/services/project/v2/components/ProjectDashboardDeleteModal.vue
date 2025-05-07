<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router/composables';


import { i18n } from '@/translations';


import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useDashboardDeleteMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-delete-mutation';
import { useProjectDashboardQuery } from '@/services/project/v2/composables/queries/use-project-dashboard-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectDashboardModalStore } from '@/services/project/v2/stores/Project-dashboard-modal-store';

interface Props {
    projectGroupOrProjectId: string;
}
const props = defineProps<Props>();
const router = useRouter();
const projectDashboardModalStore = useProjectDashboardModalStore();
const visible = computed(() => projectDashboardModalStore.state.dashboardDeleteModalVisible);
const dashboardId = computed(() => projectDashboardModalStore.state.targetId);
const projectGroupOrProjectId = computed(() => props.projectGroupOrProjectId);
const { projectGroupId, projectId } = useProjectOrGroupId(projectGroupOrProjectId);
/* Query */
const {
    invalidateAllQueries: invalidateDashboardList,
} = useProjectDashboardQuery({
    projectId,
    projectGroupId,
});

const handleDeleteDashboardConfirm = async () => {
    if (!dashboardId.value) {
        throw new Error('Dashboard ID is not provided');
    }
    deleteDashboard({
        dashboard_id: dashboardId.value,
    });
};

/* Api */
const { mutate: deleteDashboard, isPending: loading } = useDashboardDeleteMutation({
    onSuccess: async () => {
        invalidateDashboardList();
        projectDashboardModalStore.closeDashboardDeleteModal();
        await router.replace({
            name: PROJECT_ROUTE_V2._NAME,
            params: {
                projectGroupOrProjectId: projectGroupOrProjectId.value,
            },
        }).catch(() => {});
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('DASHBOARDS.FORM.ALT_E_DELETE_DASHBOARD'));
    },
});

</script>

<template>
    <delete-modal :header-title="$t('DASHBOARDS.FORM.DELETE_TITLE')"
                  :visible="visible"
                  :loading="loading"
                  @confirm="handleDeleteDashboardConfirm"
                  @closed="projectDashboardModalStore.resetTarget"
                  @cancel="projectDashboardModalStore.closeDashboardDeleteModal"
                  @close="projectDashboardModalStore.closeDashboardDeleteModal"
    />
</template>
