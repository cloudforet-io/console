import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { WorkspaceUserGetParameters } from '@/schema/identity/workspace-user/api-verbs/get';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';

import ErrorHandler from '@/common/composables/error/errorHandler';


export const getWorkspaceUser = async (userId: string): Promise<WorkspaceUserModel|undefined> => {
    try {
        return await SpaceConnector.clientV2.identity.workspaceUser.get<WorkspaceUserGetParameters, WorkspaceUserModel>({
            user_id: userId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};
