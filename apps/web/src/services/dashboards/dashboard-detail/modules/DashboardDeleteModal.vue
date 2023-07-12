<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

interface Props {
    visible: boolean;
    dashboardId: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboardId: undefined,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const store = useStore();
const { t } = useI18n();
const router = useRouter();

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
        await router.replace({ name: DASHBOARDS_ROUTE.ALL._NAME });
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('DASHBOARDS.FORM.ALT_E_DELETE_DASHBOARD'));
    } finally {
        state.loading = false;
        state.proxyVisible = false;
    }
};

</script>

<template>
    <delete-modal v-model:visible="state.proxyVisible"
                  :header-title="t('DASHBOARDS.FORM.DELETE_TITLE')"
                  :loading="state.loading"
                  @confirm="handleDeleteDashboardConfirm"
    />
</template>
