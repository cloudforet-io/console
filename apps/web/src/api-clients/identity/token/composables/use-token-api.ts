import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAPIQueryKey } from '@/api-clients/_common/composables/use-api-query-key';
import type { TokenGrantParameters } from '@/api-clients/identity/token/schema/api-verbs/grant';
import type { TokenIssueParameters } from '@/api-clients/identity/token/schema/api-verbs/issue';
import type { TokenIssueModel, TokenGrantModel } from '@/api-clients/identity/token/schema/model';


export const useTokenApi = () => {
    const tokenQueryKey = useAPIQueryKey('identity', 'token', 'issue');
    const tokenGrantQueryKey = useAPIQueryKey('identity', 'token', 'grant');

    const actions = {
        issue: SpaceConnector.clientV2.identity.token.issue<TokenIssueParameters, TokenIssueModel>,
        grant: SpaceConnector.clientV2.identity.token.grant<TokenGrantParameters, TokenGrantModel>,
    };

    return {
        tokenQueryKey,
        tokenGrantQueryKey,
        tokenAPI: actions,
    };
};
