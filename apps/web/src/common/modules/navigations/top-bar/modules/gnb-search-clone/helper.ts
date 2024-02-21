import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { SuggestionType } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/config';

export const createSearchRecent = async (type: SuggestionType, id: string, workspaceId: string) => {
    try {
        await SpaceConnector.client.addOns.recent.search.create({
            type,
            id,
            workspace_id: workspaceId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
