<script lang="ts" setup>
import { reactive } from 'vue';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

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

const dashboardStore = useDashboardStore();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
});

const handleDeleteDashboardConfirm = async () => {
    try {
        state.loading = true;
        await dashboardStore.deleteDashboard(props.dashboardId);
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
