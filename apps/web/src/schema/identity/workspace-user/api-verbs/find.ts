import type { UserState } from '@/schema/identity/user/type';

interface Page {
    start: number;
    limit: number;
}
export interface FindWorkspaceUserParameters {
    keyword: string;
    state?: UserState;
    page?: Page;
    workspace_id?: string;
}
