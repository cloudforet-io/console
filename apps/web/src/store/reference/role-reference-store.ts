import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleListBasicRoleParameters } from '@/api-clients/identity/role/schema/api-verbs/list-basic-role';
import type { BasicRoleModel, RoleModel } from '@/api-clients/identity/role/schema/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';


export type RoleItem = Required<Pick<ReferenceItem<RoleModel|BasicRoleModel>, 'key'|'label'|'name'|'data'>>;
export type RoleReferenceMap = ReferenceMap<RoleItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useRoleReferenceStore = defineStore('reference-role', () => {
    const appContextStore = useAppContextStore();
    const state = reactive({
        items: null as RoleReferenceMap | null,
    });

    const getters = {
        roleItems: asyncComputed<RoleReferenceMap>(async () => {
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        roleTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.role.meta.key,
            key: MANAGED_VARIABLE_MODELS.role.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.role.meta.name,
            referenceMap: getters.roleItems.value,
        })),
    };

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
        let res: ListResponse<RoleModel|BasicRoleModel> | undefined;
        try {
            if (appContextStore.getters.isUserMode) {
                res = await SpaceConnector.clientV2.identity.role.listBasicRole<RoleListBasicRoleParameters, ListResponse<BasicRoleModel>>(params);
            } else {
                res = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>(params);
            }
        } catch (e) {
            ErrorHandler.handleError(e);
        }


        const roleReferenceMap: RoleReferenceMap = {};

        res?.results?.forEach((role) => {
            roleReferenceMap[role.role_id] = {
                key: role.role_id,
                label: role.name,
                name: role.name,
                data: role,
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
                data: role,
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

