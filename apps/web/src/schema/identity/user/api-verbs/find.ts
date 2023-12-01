import type { UserState } from '@/schema/identity/user/type';

interface Page {
    start: number;
    limit: number;
}
export interface FindUserParameters {
    keyword: string;
    state?: UserState;
    exclude_workspace_id?: string;
    page?: Page;
}
