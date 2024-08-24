import type { UserState } from '@/schema/identity/user/type';

export interface WorkspaceGroupDetailsFindUsersParameters {
    workspace_group_id: string;
    keyword?: string;
    state?: UserState;
    page?: {
        start: number;
        limit: number;
    }
}
