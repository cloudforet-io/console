import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { AppCreateParameters } from '@/schema/identity/app/api-verbs/create';
import type { AppDeleteParameters } from '@/schema/identity/app/api-verbs/delete';
import type { AppDisableParameters } from '@/schema/identity/app/api-verbs/disable';
import type { AppEnableParameters } from '@/schema/identity/app/api-verbs/enable';
import type { AppGenerateApiKeyParameters } from '@/schema/identity/app/api-verbs/generateApiKey';
import type { AppListParameters } from '@/schema/identity/app/api-verbs/list';
import type { AppUpdateParameters } from '@/schema/identity/app/api-verbs/update';
import type { AppModel } from '@/schema/identity/app/model';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import type { RoleModel } from '@/schema/identity/role/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useAppPageStore = defineStore('app-page', {
    state: () => ({
        apps: [] as AppModel[],
        selectedIndex: [] as number[]|undefined,
        totalCount: 0,
        modal: {
            loading: false,
            type: '',
            title: '',
            themeColor: 'primary',
            visible: {
                form: false,
                status: false,
                apiKey: false,
            },
        },
    }),
    getters: {
        selectedApp: (state): AppModel => state.selectedIndex && state.apps[state.selectedIndex[0]] || {} as AppModel,
    },
    actions: {
        async listApps(params: AppListParameters) {
            try {
                const res = await SpaceConnector.clientV2.identity.app.list<AppListParameters, ListResponse<AppModel>>(params);
                this.apps = res.results?.map((item) => ({
                    ...item,
                    tags: item.tags || {},
                })) || [];
                this.selectedIndex = [];
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
                return await SpaceConnector.clientV2.identity.app.generateApiKey<AppGenerateApiKeyParameters, AppModel>(params);
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
