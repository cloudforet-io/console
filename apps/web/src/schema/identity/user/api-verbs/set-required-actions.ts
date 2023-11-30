import type { Action } from '@/schema/identity/user/type';


export interface UserSetRequiredActionsRequestParams {
    user_id: string;
    actions: Action[];
}
