import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AppListParameters } from '@/api-clients/identity/app/schema/api-verbs/list';
import type { AppModel } from '@/api-clients/identity/app/schema/model';
import { ROLE_STATE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useAppPageStore = defineStore('page-app', {
    state: () => ({
        apps: [] as AppModel[],
        roles: [] as RoleModel[],
        selectedIndex: [] as number[]|undefined,
        totalCount: 0,
        pageStart: 1,
        pageLimit: 15,
        modal: {
            loading: false,
            type: '',
            title: '',
            themeColor: 'primary',
            visible: {
                form: false,
                status: false,
                apiKey: false,
                doubleCheck: false,
            },
        },
    }),
    getters: {
        selectedApp: (state): AppModel => state.selectedIndex && state.apps[state.selectedIndex[0]] || {} as AppModel,
    },
    actions: {
        async listApps(params: AppListParameters) {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.identity.app.list<AppListParameters, ListResponse<AppModel>>(params);
                this.apps = (results ?? []).map((item) => ({
                    ...item,
                    tags: item.tags || {},
                }));
                this.selectedIndex = [];
                this.totalCount = total_count ?? 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                this.apps = [];
                this.totalCount = 0;
                throw e;
            }
        },
        //
        async listRoles() {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
                    query: {
                        filter: [
                            { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                        ],
                    },
                });
                this.roles = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.roles = [];
            }
        },
    },
});
