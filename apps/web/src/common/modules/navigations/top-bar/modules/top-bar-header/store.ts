import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { FavoriteOptions } from '@/store/modules/favorite/type';

import type { Breadcrumb } from '@/common/modules/page-layouts/type';

interface TopBarHeaderStoreState {
    breadcrumbs: Breadcrumb[];
    selectedItem: Breadcrumb;
    id?: string;
    favoriteItem?: FavoriteOptions;
}

export const useTopBarHeaderStore = defineStore('top-bar-header', () => {
    const state = reactive<TopBarHeaderStoreState>({
        breadcrumbs: [],
        selectedItem: {} as Breadcrumb,
        id: '',
        favoriteItem: {} as FavoriteOptions,
    });

    const getters = reactive({
        breadcrumbs: computed<Breadcrumb[]>(() => state.breadcrumbs),
        selectedItem: computed<Breadcrumb>(() => state.selectedItem),
        id: computed<string|undefined>(() => state.id),
        favoriteItem: computed<FavoriteOptions|undefined>(() => state.favoriteItem),
    });

    const actions = {
        setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => {
            state.breadcrumbs = breadcrumbs;
        },
        setId: (id?: string) => {
            state.id = id;
        },
        setSelectedItem: (item: Breadcrumb) => {
            state.selectedItem = item;
        },
        setFavoriteItemId: (favoriteItem: FavoriteOptions) => {
            state.favoriteItem = favoriteItem;
        },
        initState: () => {
            state.breadcrumbs = [];
            state.selectedItem = {} as Breadcrumb;
            state.id = '';
            state.favoriteItem = {} as FavoriteOptions;
        },
    };


    return {
        state,
        getters,
        ...actions,
    };
});
