import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { PageSchemaGetParameters } from '@/api-clients/add-ons/page-schema/schema/api-verbs/get';
import type { PageSchemaUpdateParameters } from '@/api-clients/add-ons/page-schema/schema/api-verbs/update';
import type { PageSchemaModel } from '@/api-clients/add-ons/page-schema/schema/model';


export const usePageSchemaApi = () => {
    const actions = {
        get: SpaceConnector.client.addOns.pageSchema.get<PageSchemaGetParameters, PageSchemaModel>,
        update: SpaceConnector.client.addOns.pageSchema.update<PageSchemaUpdateParameters, PageSchemaModel>,
    };
    return {
        pageSchemaAPI: actions,
    };
};
