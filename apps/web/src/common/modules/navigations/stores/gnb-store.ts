import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

interface GnbStoreState {
    breadcrumbs: Breadcrumb[];
    selectedItem: Breadcrumb;
    id?: string;
    favoriteItem?: FavoriteOptions;
    isMinimizeGnb?: boolean;
}

export const useGnbStore = defineStore('gnb', () => {
    const state = reactive<GnbStoreState>({
        breadcrumbs: [],
        selectedItem: {} as Breadcrumb,
        id: '',
        favoriteItem: {} as FavoriteOptions,
        isMinimizeGnb: false,
    });

    const getters = reactive({
        breadcrumbs: computed<Breadcrumb[]>(() => state.breadcrumbs),
        selectedItem: computed<Breadcrumb>(() => state.selectedItem),
        id: computed<string|undefined>(() => state.id),
        favoriteItem: computed<FavoriteOptions|undefined>(() => state.favoriteItem),
        isMinimizeGnb: computed<boolean|undefined>(() => state.isMinimizeGnb),
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
        setFavoriteItemId: (favoriteItem?: FavoriteOptions) => {
            state.favoriteItem = favoriteItem;
        },
        setMinimizeGnb: (isMinimizeGnb?: boolean) => {
            state.isMinimizeGnb = isMinimizeGnb;
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
