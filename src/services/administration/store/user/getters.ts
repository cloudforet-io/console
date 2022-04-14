import { Getter } from 'vuex';
import { UserStoreState } from './type';

export const isManagementModalVisible: Getter<UserStoreState, any> = ({ visibleManagementModal }): boolean => visibleManagementModal;
export const isCreateModalVisible: Getter<UserStoreState, any> = ({ visibleCreateModal }): boolean => visibleCreateModal;
export const isUpdateModalVisible: Getter<UserStoreState, any> = ({ visibleUpdateModal }): boolean => visibleUpdateModal;
export const isUserSelected: Getter<UserStoreState, any> = ({ selectedIndex }): boolean => selectedIndex.length > 0;
