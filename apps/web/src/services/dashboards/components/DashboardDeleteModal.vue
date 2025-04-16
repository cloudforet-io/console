<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { useQueryClient } from '@tanstack/vue-query';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useRecentStore } from '@/common/modules/navigations/stores/recent-store';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import { useDashboardDeleteMutation } from '@/services/_shared/dashboard/core/composables/mutations/use-dashboard-delete-mutation';
import { useDashboardQuery } from '@/services/dashboards/composables/use-dashboard-query';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';

const recentStore = useRecentStore();

interface Props {
    visible?: boolean;
    dashboardId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    dashboardId: undefined,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void,
}>();

const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const router = useRouter();
/* Query */
const {
    keys,
} = useDashboardQuery();
const queryClient = useQueryClient();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
});

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    loading: false,
});

const handleDeleteDashboardConfirm = async () => {
    if (!props.dashboardId) {
        throw new Error('Dashboard ID is not provided');
    }
    deleteDashboard({
        dashboard_id: props.dashboardId,
    });
};

/* Api */
const { mutate: deleteDashboard, isPending: loading } = useDashboardDeleteMutation({
    onSuccess: async (_, params) => {
        const _isPrivate = params.dashboard_id.startsWith('private');
        const dashboardListQueryKey = _isPrivate ? keys.privateDashboardListQueryKey : keys.publicDashboardListQueryKey;
        await queryClient.invalidateQueries({ queryKey: dashboardListQueryKey.value });
        await recentStore.deleteRecent({
            type: RECENT_TYPE.DASHBOARD,
            itemId: props.dashboardId,
        });
        const isFavoriteItem = favoriteGetters.dashboardItems.find((item) => item.itemId === params.dashboard_id);
        if (isFavoriteItem) {
            await favoriteStore.deleteFavorite({
                itemType: FAVORITE_TYPE.DASHBOARD,
                workspaceId: storeState.currentWorkspaceId || '',
                itemId: params.dashboard_id,
            });
        }
        state.proxyVisible = false;
        const dashboardRouteName = storeState.isAdminMode
            ? ADMIN_DASHBOARDS_ROUTE._NAME
            : DASHBOARDS_ROUTE._NAME;
        await router.replace({ name: dashboardRouteName }).catch(() => {});
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('DASHBOARDS.FORM.ALT_E_DELETE_DASHBOARD'));
    },
});

</script>

<template>
    <delete-modal :header-title="$t('DASHBOARDS.FORM.DELETE_TITLE')"
                  :visible.sync="state.proxyVisible"
                  :loading="loading"
                  @confirm="handleDeleteDashboardConfirm"
    />
</template>
