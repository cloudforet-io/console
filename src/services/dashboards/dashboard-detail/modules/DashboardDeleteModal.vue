<template>
    <delete-modal :header-title="$t('DASHBOARDS.FORM.DELETE_TITLE')"
                  :visible.sync="proxyVisible"
                  :loading="loading"
                  @confirm="handleDeleteDashboardConfirm"
    />
</template>
<script lang="ts">
import type { SetupContext } from 'vue';
import { computed, reactive, toRefs } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';


export default {
    name: 'DashboardDeleteModal',
    components: {
        DeleteModal,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
            required: true,
        },
        dashboardId: {
            type: String,
            default: undefined,
            required: true,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            proxyVisible: useProxyValue('visible', props, emit),
            dashboardId: computed(() => props.dashboardId),
            isProjectDashboard: computed(() => state.dashboardId.startsWith('project')),
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

        return { ...toRefs(state), handleDeleteDashboardConfirm };
    },
};
</script>
