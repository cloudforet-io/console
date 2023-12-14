<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';


interface Props {
    visible?: boolean;
    dashboardId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboardId: undefined,
});
const emit = defineEmits<{(e: 'update:visible'): void,
}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    dashboardId: computed<string>(() => props.dashboardId),
    isProjectDashboard: computed<boolean>(() => state.dashboardId.startsWith('project')),
    loading: false,
});

const handleDeleteDashboardConfirm = async () => {
    try {
        state.loading = true;
        if (state.isProjectDashboard) {
            await SpaceConnector.clientV2.dashboard.projectDashboard.delete({
                project_dashboard_id: state.dashboardId,
            });
            await store.dispatch('dashboard/loadProjectDashboard');
        } else {
            await SpaceConnector.clientV2.dashboard.domainDashboard.delete({
                domain_dashboard_id: state.dashboardId,
            });
            await store.dispatch('dashboard/loadDomainDashboard');
        }
        await SpaceRouter.router.replace({ name: DASHBOARDS_ROUTE.ALL._NAME });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('DASHBOARDS.FORM.ALT_E_DELETE_DASHBOARD'));
    } finally {
        state.loading = false;
        state.proxyVisible = false;
    }
};
</script>

<template>
    <delete-modal :header-title="$t('DASHBOARDS.FORM.DELETE_TITLE')"
                  :visible.sync="state.proxyVisible"
                  :loading="state.loading"
                  @confirm="handleDeleteDashboardConfirm"
    />
</template>
