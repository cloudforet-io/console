import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CostQuerySetCreateParameters } from '@/api-clients/cost-analysis/cost-query-set/schema/api-verbs/create';
import type { CostQuerySetDeleteParameters } from '@/api-clients/cost-analysis/cost-query-set/schema/api-verbs/delete';
import type { CostQuerySetListParameters } from '@/api-clients/cost-analysis/cost-query-set/schema/api-verbs/list';
import type { CostQuerySetUpdateParameters } from '@/api-clients/cost-analysis/cost-query-set/schema/api-verbs/update';
import type { CostQuerySetModel } from '@/api-clients/cost-analysis/cost-query-set/schema/model';

interface UseCostQuerySetApiReturn {
    costQuerySetAPI: {
        create: (params: CostQuerySetCreateParameters) => Promise<CostQuerySetModel>;
        list: (params: CostQuerySetListParameters) => Promise<ListResponse<CostQuerySetModel>>;
        update: (params: CostQuerySetUpdateParameters) => Promise<CostQuerySetModel>;
        delete: (params: CostQuerySetDeleteParameters) => Promise<void>;
    }
}

export const useCostQuerySetApi = (): UseCostQuerySetApiReturn => {
    const actions = {
        create: SpaceConnector.clientV2.costAnalysis.costQuerySet.create<CostQuerySetCreateParameters, CostQuerySetModel>,
        list: SpaceConnector.clientV2.costAnalysis.costQuerySet.list<CostQuerySetListParameters, ListResponse<CostQuerySetModel>>,
        update: SpaceConnector.clientV2.costAnalysis.costQuerySet.update<CostQuerySetUpdateParameters, CostQuerySetModel>,
        delete: SpaceConnector.clientV2.costAnalysis.costQuerySet.delete<CostQuerySetDeleteParameters, void>,
    };

    return {
        costQuerySetAPI: actions,
    };
};
