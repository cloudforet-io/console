import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleBindingListParameters } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';

import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

import ErrorHandler from '@/common/composables/error/errorHandler';

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export type RoleBindingItem = Required<Pick<ReferenceItem<RoleBindingModel>, 'key'|'label'|'name'|'data'>>;
export type RoleBindingReferenceMap = ReferenceMap<RoleBindingItem>;

export const useRoleBindingReferenceStore = defineStore('reference-role-binding', () => {
    const state = reactive({
        items: null as RoleBindingReferenceMap | null,
    });

    const getters = {
        roleBindingItems: asyncComputed<RoleBindingReferenceMap>(async () => {
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        roleBindingTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.role_binding.meta.key,
            key: MANAGED_VARIABLE_MODELS.role_binding.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.role_binding.meta.name,
            referenceMap: getters.roleBindingItems.value,
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
                only: ['role_binding_id', 'user_id', 'workspace_id'],
            },
        };
        let res: ListResponse<RoleBindingModel> | undefined;
        try {
            res = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, ListResponse<RoleBindingModel>>(params);
        } catch (e) {
            ErrorHandler.handleError(e);
        }

        const roleBindingReferenceMap: RoleBindingReferenceMap = {};

        res?.results?.forEach((roleBinding) => {
            roleBindingReferenceMap[roleBinding.role_binding_id] = {
                key: roleBinding.role_binding_id,
                label: roleBinding.role_binding_id,
                name: roleBinding.role_binding_id,
                data: roleBinding,
            };
        });
        state.items = roleBindingReferenceMap;
        lastLoadedTime = currentTime;
    };

    const sync = async (roleBinding: RoleBindingModel) => {
        state.items = {
            ...state.items,
            [roleBinding.role_binding_id]: {
                key: roleBinding.role_binding_id,
                label: roleBinding.role_binding_id,
                name: roleBinding.role_binding_id,
                data: roleBinding,
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
