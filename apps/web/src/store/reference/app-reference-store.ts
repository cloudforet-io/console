import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AppListParameters } from '@/api-clients/identity/app/schema/api-verbs/list';
import type { AppModel } from '@/api-clients/identity/app/schema/model';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap,
    ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import { useAuthorizationStore } from '../authorization/authorization-store';

export type AppItem = Required<Pick<ReferenceItem<AppModel>, 'key'|'label'|'name'|'data'>>;
export type AppReferenceMap = ReferenceMap<AppItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useAppReferenceStore = defineStore('reference-app', () => {
    const authorizationStore = useAuthorizationStore();

    const state = reactive({
        items: null as AppReferenceMap | null,
    });

    const getters = reactive({
        appItems: asyncComputed<AppReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        appTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.app.meta.key,
            key: MANAGED_VARIABLE_MODELS.app.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.app.meta.name,
            referenceMap: getters.appItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: AppListParameters = {
            query: {
                only: ['name', 'app_id'],
            },
        };

        const { results } = await SpaceConnector.clientV2.identity.app.list<AppListParameters, ListResponse<AppModel>>(params);

        const appReferenceMap: AppReferenceMap = {};

        results?.forEach((app) => {
            appReferenceMap[app.app_id] = {
                key: app.app_id,
                label: app.name,
                name: app.app_id,
                data: app,
            };
        });

        state.items = appReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (app: AppModel) => {
        state.items = {
            ...state.items,
            [app.app_id]: {
                key: app.app_id,
                label: app.name,
                name: app.app_id,
                data: app,
            },
        };
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

