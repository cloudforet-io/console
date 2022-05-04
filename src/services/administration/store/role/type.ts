import { RoleData } from '@/services/administration/iam/role/type';

export interface RoleStoreState {
    selectedIndices: number[];
    selectedRoles: RoleData[];
}
