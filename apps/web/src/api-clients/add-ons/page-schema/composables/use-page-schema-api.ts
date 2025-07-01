import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PageSchemaGetParameters } from '@/api-clients/add-ons/page-schema/schema/api-verbs/get';
import type { PageSchemaModel } from '@/api-clients/add-ons/page-schema/schema/model';

export const usePageSchemaApi = () => {
    const actions = {
        get: SpaceConnector.client.addOns.pageSchema.get<PageSchemaGetParameters, PageSchemaModel>,
    };
    return {
        pageSchemaAPI: actions,
    };
};
