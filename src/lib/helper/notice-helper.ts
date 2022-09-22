import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

const NOTICE_BOARD_NAME = 'Notice';

export const getNoticeBoardId = async (): Promise<undefined|string> => {
    try {
        const { results } = await SpaceConnector.client.board.board.list({
            name: NOTICE_BOARD_NAME,
        });
        if (results.length) return results[0].board_id;
        return undefined;
    } catch (e) {
        return undefined;
    }
};
