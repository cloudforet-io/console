import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { BoardModel } from '@/schema/board/board/model';

export interface BoardListParameters {
    board_id?: string;
    name?: string;
}

export type BoardListResponse = ListResponse<BoardModel>;
