import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { AppListParameters } from '@/schema/identity/app/api-verbs/list';
import type { AppModel } from '@/schema/identity/app/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

export const useAppPageStore = defineStore('app-page', {
    state: () => ({
        loading: false,
        apps: [] as AppModel[],
        selectedApp: {} as AppModel,
        totalCount: 0,
        modal: {
            type: '',
            title: '',
            visible: {
                create: false,
                update: false,
                enable: false,
                disable: false,
                delete: false,
                regenerate: false,
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
    },
});
