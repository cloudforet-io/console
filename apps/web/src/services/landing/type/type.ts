import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

export type WorkspaceBoardSet = BoardSet & WorkspaceModel;
