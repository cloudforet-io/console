import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { RoleModel } from '@/schema/identity/role/model';
// eslint-disable-next-line import/no-cycle
import { store } from '@/store';

import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';


export type RoleItem = Required<Pick<ReferenceItem<RoleModel>, 'key'|'label'|'name'>>;
export type RoleReferenceMap = ReferenceMap<RoleItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useRoleReferenceStore = defineStore('reference-role', () => {
    const state = reactive({
        items: null as RoleReferenceMap | null,
    });

    const getters = reactive({
        roleItems: asyncComputed<RoleReferenceMap>(async () => {
            if (store.getters['user/getCurrentGrantInfo'].scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        roleTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.role.meta.key,
            key: MANAGED_VARIABLE_MODELS.role.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.role.meta.name,
            referenceMap: getters.roleItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: RoleListParameters = {
            query: {
                only: ['name', 'role_id', 'role_type'],
            },
        };

        const res = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>(params);

        const roleReferenceMap: RoleReferenceMap = {};

        res.results?.forEach((role) => {
            roleReferenceMap[role.role_id] = {
                key: role.role_id,
                label: role.name,
                name: role.name,
            };
        });

        state.items = roleReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (role: RoleModel) => {
        state.items = {
            ...state.items,
            [role.role_id]: {
                key: role.role_id,
                label: role.name,
                name: role.name,
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

