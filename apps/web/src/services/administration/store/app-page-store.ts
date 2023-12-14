import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { AppCreateParameters } from '@/schema/identity/app/api-verbs/create';
import type { AppListParameters } from '@/schema/identity/app/api-verbs/list';
import type { AppModel } from '@/schema/identity/app/model';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { RoleModel } from '@/schema/identity/role/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useAppPageStore = defineStore('app-page', {
    state: () => ({
        apps: [] as AppModel[],
        selectedApp: {} as AppModel,
        totalCount: 0,
        modal: {
            loading: false,
            type: '',
            title: '',
            themeColor: '',
            visible: {
                form: false,
                status: false,
            },
        },
    }),
    actions: {
        async listApps(params: AppListParameters) {
            try {
                const res = await SpaceConnector.clientV2.identity.app.list<AppListParameters, ListResponse<AppModel>>(params);
                this.apps = res.results || [];
                this.selectedApp = {} as AppModel;
                this.totalCount = res.total_count ?? 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                this.apps = [];
                this.totalCount = 0;
                throw e;
            }
        },
        async createApp(params: AppCreateParameters) {
            this.modal.loading = true;
            try {
                await SpaceConnector.clientV2.identity.app.create<AppCreateParameters, AppModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.modal.loading = false;
            }
        },
        //
        async listRoles(params: RoleListParameters) {
            try {
                const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>(params);
                return results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        },
    },
});
