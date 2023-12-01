import type { Action } from '@/schema/identity/user/type';


export interface UserSetRequiredActionsRequestParameters {
    user_id: string;
    actions: Action[];
}
