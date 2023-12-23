import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import type { UserModel } from '@/schema/identity/user/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';

// eslint-disable-next-line import/no-cycle
import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { ReferenceLoadOptions, ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';
import type { ReferenceTypeInfo } from '@/store/reference/all-reference-store';

import { REFERENCE_TYPE_INFO } from '@/lib/reference/reference-config';


type PickedUserModel = Pick<UserModel|WorkspaceUserModel, 'user_id'|'name'>;
type UserReferenceItem = Required<Pick<ReferenceItem<PickedUserModel>, 'key'|'label'|'name'>>;
export type UserReferenceMap = ReferenceMap<UserReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useUserReferenceStore = defineStore('user-reference', () => {
    const appContextStore = useAppContextStore();
    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    });
    const state = reactive({
        items: null as UserReferenceMap | null,
    });

    const getters = reactive({
        userItems: asyncComputed<UserReferenceMap>(async () => {
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        userTypeInfo: computed<ReferenceTypeInfo>(() => ({
            ...REFERENCE_TYPE_INFO.user,
            referenceMap: getters.userItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();
        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const params: UserListParameters = {
            query: {
                only: ['user_id', 'name'],
            },
        };

        const fetcher = _state.isAdminMode
            ? SpaceConnector.clientV2.identity.user.list
            : SpaceConnector.clientV2.identity.workspaceUser.list;
        const { results } = await fetcher<UserListParameters|WorkspaceUserListParameters, ListResponse<UserModel|WorkspaceUserModel>>(params);

        const referenceMap: UserReferenceMap = {};
        results?.forEach((userInfo: any): void => {
            referenceMap[userInfo.user_id] = {
                key: userInfo.user_id,
                label: userInfo.name ? `${userInfo.user_id} (${userInfo.name})` : userInfo.user_id,
                name: userInfo.name,
            };
        });
        state.items = referenceMap;

        lastLoadedTime = currentTime;
    };

    const sync = async (user: UserModel|WorkspaceUserModel) => {
        state.items = {
            ...state.items,
            [user.user_id]: {
                key: user.user_id,
                label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
                name: user.name,
            },
        };
    };

    const actions = {
        load,
        sync,
        flush: () => { state.items = null; },
    };

    return {
        state,
        getters,
        ...actions,
    };
});

