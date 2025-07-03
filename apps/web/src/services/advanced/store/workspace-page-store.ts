import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostReportConfigListParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/list';
import type { CostReportConfigModel } from '@/api-clients/cost-analysis/cost-report-config/schema/model';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface WorkspacePageState {
    loading: boolean;
    userLoading: boolean;
    workspaces: WorkspaceModel[];
    selectedWorkspace: WorkspaceModel;
    totalCount: number;
    selectedType: string,
    costReportConfig: CostReportConfigModel|null|undefined,
    // workspace users
    usersSearchfilters: ConsoleFilter[],
}

export const useWorkspacePageStore = defineStore('page-workspace', {
    state: (): WorkspacePageState => ({
        loading: false,
        userLoading: false,
        selectedWorkspace: {} as WorkspaceModel,
        workspaces: [] as WorkspaceModel[],
        totalCount: 0,
        selectedType: 'ALL',
        costReportConfig: null,
        // workspace users
        usersSearchfilters: [],
    }),
    getters: {
        currency: (state) => state.costReportConfig?.currency,
    },
    actions: {
        async fetchCostReportConfig() {
            if (this.costReportConfig !== null) return;
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>({
                    query: {
                        sort: [{ key: 'created_at', desc: false }],
                    },
                });
                this.costReportConfig = results?.[0];
            } catch (e) {
                ErrorHandler.handleError(e);
                this.costReportConfig = undefined;
            }
        },
    },
});
