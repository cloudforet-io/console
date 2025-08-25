import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserConfigListParameters } from '@/api-clients/config/user-config/schema/api-verbs/list';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';
import type { FavoriteOptions } from '@/common/modules/user-config/favorite/favorite-button/type';

interface GnbStoreState {
    breadcrumbs: Breadcrumb[];
    selectedItem: Breadcrumb;
    id?: string;
    favoriteItem?: FavoriteOptions;
    isHideNavRail?: boolean;
    isMinimizeNavRail?: boolean;
}

export const useGnbStore = defineStore('gnb', () => {
    const state = reactive<GnbStoreState>({
        breadcrumbs: [],
        selectedItem: {} as Breadcrumb,
        id: '',
        favoriteItem: {} as FavoriteOptions,
        isHideNavRail: false,
        isMinimizeNavRail: false,
    });

    const getters = reactive({
        breadcrumbs: computed<Breadcrumb[]>(() => state.breadcrumbs),
        selectedItem: computed<Breadcrumb>(() => state.selectedItem),
        id: computed<string|undefined>(() => state.id),
        favoriteItem: computed<FavoriteOptions|undefined>(() => state.favoriteItem),
        isHideNavRail: computed<boolean|undefined>(() => state.isHideNavRail),
        isMinimizeNavRail: computed<boolean|undefined>(() => state.isMinimizeNavRail),
    });

    const mutations = {
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
    };

    const actions = {
        fetchNavRailStatus: async () => {
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    name: 'console:gnb:navRail',
                });
                if (!results) {
                    await actions.createNavRailInit();
                } else {
                    state.isMinimizeNavRail = results[0].data?.isMinimizeNavRail;
                    state.isHideNavRail = results[0].data?.isHideNavRail;
                }
            } catch (e: any) {
                await actions.createNavRailInit();
            }
        },
        createNavRailInit: async () => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set({
                    name: 'console:gnb:navRail',
                    data: { isMinimizeNavRail: false, isHideNavRail: false },
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        createMinimizeNavRail: async (isMinimizeNavRail?: boolean) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set({
                    name: 'console:gnb:navRail',
                    data: { isMinimizeNavRail },
                });
                state.isMinimizeNavRail = isMinimizeNavRail;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        createHideNavRail: async (isHideNavRail?: boolean) => {
            try {
                await SpaceConnector.clientV2.config.userConfig.set({
                    name: 'console:gnb:navRail',
                    data: { isHideNavRail },
                });
                state.isHideNavRail = isHideNavRail;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
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
        ...mutations,
        ...actions,
    };
});
