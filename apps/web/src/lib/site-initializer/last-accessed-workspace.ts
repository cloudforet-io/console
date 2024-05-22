import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigListParameters } from '@/schema/config/user-config/api-verbs/list';
import type { UserConfigSetParameters } from '@/schema/config/user-config/api-verbs/set';
import type { UserConfigModel } from '@/schema/config/user-config/model';

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
        if (!results) {
            return undefined;
        }
        return results[0].data.workspace_id;
    } catch (e) {
        // ErrorHandler.handleError(e);
        return undefined;
    }
};
