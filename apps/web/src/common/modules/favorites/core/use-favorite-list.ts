import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import { useUserConfigListQuery } from '@/common/modules/favorites/core/use-user-config-list-query';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';


const favoriteListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

export const useFavoriteList = () => {
    const userStore = useUserStore();
    const userWorkspaceStore = useUserWorkspaceStore();

    const userId = computed<string|undefined>(() => userStore.state.userId);
    const currentWorkspaceId = computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId);

    const { data: favoriteList } = useUserConfigListQuery({
        params: computed(() => {
            favoriteListApiQuery.setFilters([
                { k: 'user_id', v: userId.value || '', o: '=' },
                { k: 'name', v: 'console:favorite:', o: '' },
                { k: 'data.workspaceId', v: currentWorkspaceId.value || '', o: '=' },
            ]);
            return {
                query: favoriteListApiQuery.data,
            };
        }),
        enabled: computed(() => !!userId.value && !!currentWorkspaceId.value),
    });

    const favoriteMenuList = computed(() => (favoriteList.value?.results ?? []).map((item) => item.data));
    return {
        favoriteMenuList,
        menuItems: computed(() => favoriteMenuList.value?.filter((item) => item.itemType === FAVORITE_TYPE.MENU)),
        projectItems: computed(() => favoriteMenuList.value?.filter((item) => item.itemType === FAVORITE_TYPE.PROJECT)),
        projectGroupItems: computed(() => favoriteMenuList.value?.filter((item) => item.itemType === FAVORITE_TYPE.PROJECT_GROUP)),
        metricItems: computed(() => favoriteMenuList.value?.filter((item) => item.itemType === FAVORITE_TYPE.METRIC)),
        metricExampleItems: computed(() => favoriteMenuList.value?.filter((item) => item.itemType === FAVORITE_TYPE.METRIC_EXAMPLE)),
        dashboardItems: computed(() => favoriteMenuList.value?.filter((item) => item.itemType === FAVORITE_TYPE.DASHBOARD)),
        costAnalysisItems: computed(() => favoriteMenuList.value?.filter((item) => item.itemType === FAVORITE_TYPE.COST_ANALYSIS)),
        securityItems: computed(() => favoriteMenuList.value?.filter((item) => item.itemType === FAVORITE_TYPE.SECURITY)),
        serviceItems: computed(() => favoriteMenuList.value?.filter((item) => item.itemType === FAVORITE_TYPE.SERVICE)),
    };
};
