import type { Getter } from 'vuex';

import type { RoleStoreState } from './type';

export const isRoleSelected: Getter<RoleStoreState, any> = ({ selectedIndices }): boolean => selectedIndices.length > 0;
