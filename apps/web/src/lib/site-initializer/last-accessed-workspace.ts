import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserConfigListParameters } from '@/api-clients/config/user-config/schema/api-verbs/list';
import type { UserConfigSetParameters } from '@/api-clients/config/user-config/schema/api-verbs/set';
import type { UserConfigModel } from '@/api-clients/config/user-config/schema/model';

const LAST_ACCESSED_WORKSPACE_KEY = 'console:last-accessed-workspace';

export const setCurrentAccessedWorkspaceId = async (workspaceId?: string): Promise<void> => {
    try {
        await SpaceConnector.clientV2.config.userConfig.set<UserConfigSetParameters, UserConfigModel>({
            name: LAST_ACCESSED_WORKSPACE_KEY,
            data: { workspace_id: workspaceId },
        });
    } catch (e) {
        console.error(`Workspace Set Error: ${e}`);
        // ErrorHandler.handleError(e);
    }
};

export const getLastAccessedWorkspaceId = async (): Promise<string | undefined> => {
    try {
        const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
            name: LAST_ACCESSED_WORKSPACE_KEY,
        });
        if (!results?.length) {
            return undefined;
        }
        return results[0].data.workspace_id;
    } catch (e) {
        // ErrorHandler.handleError(e);
        return undefined;
    }
};
