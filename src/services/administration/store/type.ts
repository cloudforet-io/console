import type { Store } from 'vuex';

import type { PolicyState } from '@/services/administration/store/policy/type';
import type { RoleStoreState } from '@/services/administration/store/role/type';
import type { UserStoreState } from '@/services/administration/store/user/type';

// eslint-disable-next-line  @typescript-eslint/no-empty-interface
export interface AdministrationState {}

export type AdministrationStore = Store<AdministrationState & {
    user: UserStoreState;
    role: RoleStoreState;
    policy: PolicyState;
}>;
