import { Store } from 'vuex';

import { PolicyState } from '@/services/administration/store/policy/type';
import { RoleStoreState } from '@/services/administration/store/role/type';
import { UserStoreState } from '@/services/administration/store/user/type';

// eslint-disable-next-line  @typescript-eslint/no-empty-interface
export interface AdministrationState {}

export type AdministrationStore = Store<AdministrationState & {
    user: UserStoreState;
    role: RoleStoreState;
    policy: PolicyState;
}>
