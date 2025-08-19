import { computed } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { useUserStore } from '@/store/user/user-store';

import { useUserConfigListQuery } from '@/common/modules/favorites/core/use-user-config-list-query';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';


const workspaceFavoriteListApiQuery = new ApiQueryHelper().setSort('updated_at', true);

export const useWorkspaceFavoriteList = () => {
    const userStore = useUserStore();

    const userId = computed<string|undefined>(() => userStore.state.userId);

    const { data: workspaceFavoriteList } = useUserConfigListQuery({
        params: computed(() => {
            workspaceFavoriteListApiQuery.setFilters([
                { k: 'user_id', v: userId.value || '', o: '=' },
                { k: 'name', v: `console:favorite:${FAVORITE_TYPE.WORKSPACE}`, o: '' },
            ]);
            return {
                query: workspaceFavoriteListApiQuery.data,
            };
        }),
        enabled: computed(() => !!userId.value),
    });

    const workspaceFavoriteMenuList = computed(() => (workspaceFavoriteList.value?.results ?? []).map((item) => item.data));
    return {
        workspaceFavoriteMenuList,
    };
};
