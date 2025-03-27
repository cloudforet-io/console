import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { DomainConfigCreateParameters } from '@/api-clients/config/domain-config/schema/api-verbs/create';
import type { DomainConfigGetParameters } from '@/api-clients/config/domain-config/schema/api-verbs/get';
import type { DomainConfigListParameters } from '@/api-clients/config/domain-config/schema/api-verbs/list';
import type { DomainConfigSetParameters } from '@/api-clients/config/domain-config/schema/api-verbs/set';
import type { DomainConfigUpdateParameters } from '@/api-clients/config/domain-config/schema/api-verbs/update';
import type { DomainConfigModel } from '@/api-clients/config/domain-config/schema/model';

export const useDomainConfigApi = () => {
    const domainConfigQueryKey = useAPIQueryKey('config', 'domain-config', 'get');
    const domainConfigListQueryKey = useAPIQueryKey('config', 'domain-config', 'list');

    const actions = {
        create: SpaceConnector.clientV2.config.domainConfig.create<DomainConfigCreateParameters, DomainConfigModel>,
        update: SpaceConnector.clientV2.config.domainConfig.update<DomainConfigUpdateParameters, DomainConfigModel>,
        get: SpaceConnector.clientV2.config.domainConfig.get<DomainConfigGetParameters, DomainConfigModel>,
        list: SpaceConnector.clientV2.config.domainConfig.list<DomainConfigListParameters, ListResponse<DomainConfigModel>>,
        set: SpaceConnector.clientV2.config.domainConfig.set<DomainConfigSetParameters, DomainConfigModel>,
    };

    return {
        domainConfigQueryKey,
        domainConfigListQueryKey,
        domainConfigAPI: actions,
    };
};
