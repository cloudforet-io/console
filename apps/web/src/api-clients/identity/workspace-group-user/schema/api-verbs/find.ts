import type { UserState } from '@/api-clients/identity/user/schema/type';

export interface WorkspaceGroupUserFindParameters {
    workspace_group_id: string;
    keyword?: string;
    state?: UserState;
    page?: {
        start: number;
        limit: number;
    }
}
