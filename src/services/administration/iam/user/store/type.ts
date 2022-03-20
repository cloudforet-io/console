export interface UserStoreState {
    selectedIndex: number[];
    selectedUsers: any;
    visibleManagementModal: boolean;
    visibleCreateModal: boolean;
    visibleUpdateModal: boolean;
}

export const MODAL_TYPE = Object.freeze({
    MANAGEMENT: 'MANAGEMENT',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
} as const);

export type MODAL_TYPE = typeof MODAL_TYPE[keyof typeof MODAL_TYPE];
