import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { TokenGrantParameters } from '@/api-clients/identity/token/schema/api-verbs/grant';
import type { TokenIssueParameters } from '@/api-clients/identity/token/schema/api-verbs/issue';
import type { TokenIssueModel, TokenGrantModel } from '@/api-clients/identity/token/schema/model';


export const useTokenApi = () => {
    const actions = {
        issue: SpaceConnector.clientV2.identity.token.issue<TokenIssueParameters, TokenIssueModel>,
        grant: SpaceConnector.clientV2.identity.token.grant<TokenGrantParameters, TokenGrantModel>,
    };

    return {
        tokenAPI: actions,
    };
};
