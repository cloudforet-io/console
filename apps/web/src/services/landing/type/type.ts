import type { BoardSet } from '@cloudforet/mirinae/types/data-display/board/type';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import type { BOARD_TYPE } from '@/services/landing/constants/landing-constants';

export type WorkspaceBoardSet = BoardSet & WorkspaceModel;

export type BoardType = keyof typeof BOARD_TYPE;
