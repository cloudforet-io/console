import type { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';

export type UserGroupModalType = typeof USER_GROUP_MODAL_TYPE[keyof typeof USER_GROUP_MODAL_TYPE];
