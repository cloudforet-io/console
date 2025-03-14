import type { UserState } from '@/api-clients/identity/user/schema/type';

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
