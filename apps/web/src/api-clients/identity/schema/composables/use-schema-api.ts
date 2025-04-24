import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { SchemaCreateParameters } from '@/api-clients/identity/schema/schema/api-verbs/create';
import type { SchemaDeleteParameters } from '@/api-clients/identity/schema/schema/api-verbs/delete';
import type { SchemaGetParameters } from '@/api-clients/identity/schema/schema/api-verbs/get';
import type { SchemaListParameters } from '@/api-clients/identity/schema/schema/api-verbs/list';
import type { SchemaStatParameters } from '@/api-clients/identity/schema/schema/api-verbs/stat';
import type { SchemaUpdateParameters } from '@/api-clients/identity/schema/schema/api-verbs/update';
import type { SchemaModel } from '@/api-clients/identity/schema/schema/model';

export const useSchemaApi = () => {
    const actions = {
        create: SpaceConnector.clientV2.identity.schema.create<SchemaCreateParameters, SchemaModel>,
        update: SpaceConnector.clientV2.identity.schema.update<SchemaUpdateParameters, SchemaModel>,
        delete: SpaceConnector.clientV2.identity.schema.delete<SchemaDeleteParameters>,
        get: SpaceConnector.clientV2.identity.schema.get<SchemaGetParameters, SchemaModel>,
        list: SpaceConnector.clientV2.identity.schema.list<SchemaListParameters, ListResponse<SchemaModel>>,
        stat: SpaceConnector.clientV2.identity.schema.stat<SchemaStatParameters, any>,
    };

    return {
        schemaAPI: actions,
    };
};
