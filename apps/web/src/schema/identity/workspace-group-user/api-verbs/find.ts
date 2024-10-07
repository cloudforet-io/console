import type { UserState } from '@/schema/identity/user/type';

export interface WorkspaceGroupUserFindParameters {
    workspace_group_id: string;
    keyword?: string;
    state?: UserState;
    page?: {
        start: number;
        limit: number;
    }
}
