import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserGroupListParameters } from '@/api-clients/identity/user-group/schema/api-verbs/list';
import type { UserGroupModel } from '@/api-clients/identity/user-group/schema/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceItem, ReferenceLoadOptions, ReferenceMap, ReferenceTypeInfo,
} from '@/store/reference/type';

import { MANAGED_VARIABLE_MODELS } from '@/lib/variable-models/managed-model-config/base-managed-model-config';

type UserGroupReferenceItem = Required<Pick<ReferenceItem<UserGroupModel>, 'key'|'label'|'name'|'data'>>;
export type UserGroupReferenceMap = ReferenceMap<UserGroupReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useUserGroupReferenceStore = defineStore('reference-user-group', () => {
    const authorizationStore = useAuthorizationStore();

    const state = reactive({
        items: null as UserGroupReferenceMap | null,
    });

    const getters = reactive({
        userGroupItems: asyncComputed<UserGroupReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        userGroupTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: MANAGED_VARIABLE_MODELS.user_group.meta.key,
            key: MANAGED_VARIABLE_MODELS.user_group.meta.idKey,
            name: MANAGED_VARIABLE_MODELS.user_group.meta.name,
            referenceMap: getters.userGroupItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();
        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: UserGroupListParameters = {
            query: {
                only: ['user_group_id', 'name', 'users'],
            },
        };

        const fetcher = SpaceConnector.clientV2.identity.userGroup.list;
        const { results } = await fetcher<UserGroupListParameters, ListResponse<UserGroupModel>>(params);

        const referenceMap: UserGroupReferenceMap = {};
        results?.forEach((userGroupInfo): void => {
            referenceMap[userGroupInfo.user_group_id] = {
                key: userGroupInfo.user_group_id,
                label: userGroupInfo.name,
                name: userGroupInfo.name,
                data: userGroupInfo,
            };
        });
        state.items = referenceMap;

        lastLoadedTime = currentTime;
    };

    const sync = async (userGroupInfo: UserGroupModel) => {
        state.items = {
            ...state.items,
            [userGroupInfo.user_group_id]: {
                key: userGroupInfo.user_group_id,
                label: userGroupInfo.name,
                name: userGroupInfo.name,
                data: userGroupInfo,
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

