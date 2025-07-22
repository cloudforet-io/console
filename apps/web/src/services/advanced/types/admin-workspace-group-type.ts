import type { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';

export interface WorkspaceGroupFetchParameters {
    isGroupUser?: boolean;
    isWorkspace?: boolean;
}

export type WorkspaceGroupModalType = typeof WORKSPACE_GROUP_MODAL_TYPE[keyof typeof WORKSPACE_GROUP_MODAL_TYPE];
