import type { Store } from 'vuex';

import type { RoleStoreState } from '@/services/administration/store/role/type';
import type { UserStoreState } from '@/services/administration/store/user/type';

// eslint-disable-next-line  @typescript-eslint/no-empty-interface
export interface AdministrationState {}

export type AdministrationStore = Store<AdministrationState & {
    user: UserStoreState;
    role: RoleStoreState;
    policy: PolicyState;
}>;


/* policy */
export const POLICY_TYPE = {
    MANAGED: 'MANAGED',
    CUSTOM: 'CUSTOM',
    ALL: 'ALL',
} as const;
export type PolicyType = typeof POLICY_TYPE[keyof typeof POLICY_TYPE];

export const POLICY_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
export type PolicyState = typeof POLICY_STATE[keyof typeof POLICY_STATE];
