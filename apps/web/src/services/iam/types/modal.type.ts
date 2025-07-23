import type { USER_MODAL_MAP } from '@/services/iam/constants/modal.constant';

export type UserModalType = typeof USER_MODAL_MAP[keyof typeof USER_MODAL_MAP];
