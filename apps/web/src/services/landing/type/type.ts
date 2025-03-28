import type { BoardSet } from '@cloudforet/mirinae/types/data-display/board/type';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import type { BOARD_TYPE } from '@/services/landing/constants/landing-constants';

export type WorkspaceBoardSet = BoardSet & WorkspaceModel;

export type BoardType = typeof BOARD_TYPE[keyof typeof BOARD_TYPE];
