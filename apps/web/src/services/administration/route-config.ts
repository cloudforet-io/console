import { MENU_ID } from '@/lib/menu/config';

export const ADMINISTRATION_ROUTE = Object.freeze({
    _NAME: MENU_ID.ADMINISTRATION,
    IAM: {
        _NAME: MENU_ID.ADMINISTRATION_IAM,
        USER: {
            _NAME: MENU_ID.ADMINISTRATION_USER,
        },
        ROLE: {
            _NAME: MENU_ID.ADMINISTRATION_ROLE,
            CREATE: {
                _NAME: `${MENU_ID.ADMINISTRATION_ROLE}.create`,
            },
            EDIT: {
                _NAME: `${MENU_ID.ADMINISTRATION_ROLE}.edit`,
            },
        },
        POLICY: {
            _NAME: MENU_ID.ADMINISTRATION_POLICY,
            CREATE: {
                _NAME: `${MENU_ID.ADMINISTRATION_POLICY}.create`,
            },
            DETAIL: {
                _NAME: `${MENU_ID.ADMINISTRATION_POLICY}.detail`,
            },
        },
    },
});
