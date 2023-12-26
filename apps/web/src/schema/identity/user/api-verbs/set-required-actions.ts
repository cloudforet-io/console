import type { Action } from '@/schema/identity/user/type';


export interface UserSetRequiredActionsParameters {
    user_id: string;
    actions: Action[];
}
