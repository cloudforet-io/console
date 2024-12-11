import type { TranslateResult } from 'vue-i18n';

export type UserGroupPageModalType = 'create' | 'update' | 'add_new_user';

export interface ModalSettingState {
    type: string;
    title: string | TranslateResult;
    themeColor: string;
    modalVisibleType?: UserGroupPageModalType;
}

export interface ModalState {
    type: string;
    title: string | TranslateResult;
    themeColor: string;
}
