import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DomainGetParameters } from '@/api-clients/identity/domain/schema/api-verbs/get';
import type { DomainGetAuthInfoParams } from '@/api-clients/identity/domain/schema/api-verbs/get-auth-info';
import type { DomainListParameters } from '@/api-clients/identity/domain/schema/api-verbs/list';
import type { DomainModel } from '@/api-clients/identity/domain/schema/model';


export const useDomainApi = () => {
    const actions = {
        get: SpaceConnector.clientV2.identity.domain.get<DomainGetParameters, DomainModel>,
        list: SpaceConnector.clientV2.identity.domain.list<DomainListParameters, ListResponse<DomainModel>>,
        getAuthInfo: SpaceConnector.clientV2.identity.domain.getAuthInfo<DomainGetAuthInfoParams, any>,
    };

    return {
        domainAPI: actions,
    };
};
