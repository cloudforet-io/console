import { Store } from 'vuex';
import { UserStoreState } from '@/services/administration/store/user/type';
import { RoleStoreState } from '@/services/administration/store/role/type';
import { PolicyState } from '@/services/administration/store/policy/type';

// eslint-disable-next-line  @typescript-eslint/no-empty-interface
export interface AdministrationState {}

export type AdministrationStore = Store<AdministrationState & {
    user: UserStoreState;
    role: RoleStoreState;
    policy: PolicyState;
}>
