import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AppCreateParameters } from '@/api-clients/identity/app/schema/api-verbs/create';
import type { AppDeleteParameters } from '@/api-clients/identity/app/schema/api-verbs/delete';
import type { AppDisableParameters } from '@/api-clients/identity/app/schema/api-verbs/disable';
import type { AppEnableParameters } from '@/api-clients/identity/app/schema/api-verbs/enable';
import type { AppGenerateApiKeyParameters } from '@/api-clients/identity/app/schema/api-verbs/generateApiKey';
import type { AppListParameters } from '@/api-clients/identity/app/schema/api-verbs/list';
import type { AppUpdateParameters } from '@/api-clients/identity/app/schema/api-verbs/update';
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
        async createApp(params: AppCreateParameters) {
            this.modal.loading = true;
            try {
                return await SpaceConnector.clientV2.identity.app.create<AppCreateParameters, AppModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.modal.loading = false;
            }
        },
        async updateApp(params: AppUpdateParameters) {
            this.modal.loading = true;
            try {
                await SpaceConnector.clientV2.identity.app.update<AppUpdateParameters, AppModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.modal.loading = false;
            }
        },
        async enableApp(params: AppEnableParameters) {
            this.modal.loading = true;
            try {
                await SpaceConnector.clientV2.identity.app.enable<AppEnableParameters, AppModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.modal.loading = false;
            }
        },
        async disableApp(params: AppDisableParameters) {
            this.modal.loading = true;
            try {
                await SpaceConnector.clientV2.identity.app.disable<AppDisableParameters, AppModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.modal.loading = false;
            }
        },
        async deleteApp(params: AppDeleteParameters) {
            this.modal.loading = true;
            try {
                await SpaceConnector.clientV2.identity.app.delete<AppDeleteParameters>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.modal.loading = false;
            }
        },
        async regenerateApp(params: AppGenerateApiKeyParameters) {
            this.modal.loading = true;
            try {
                return await SpaceConnector.clientV2.identity.app.generateClientSecret<AppGenerateApiKeyParameters, AppModel>(params);
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            } finally {
                this.modal.loading = false;
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
