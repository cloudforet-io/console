import { Getter } from 'vuex';
import { RoleStoreState } from './type';

export const isRoleSelected: Getter<RoleStoreState, any> = ({ selectedIndices }): boolean => selectedIndices.length > 0;
