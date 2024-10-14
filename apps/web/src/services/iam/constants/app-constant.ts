import * as styles from '@/styles/colors';

export const APP_STATE = {
    ENABLE: 'ENABLED',
    DISABLE: 'DISABLED',
    EXPIRED: 'EXPIRED',
} as const;
export const APP_DROPDOWN_MODAL_TYPE = {
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    REGENERATE: 'regenerate',
    ENABLE: 'enable',
    DISABLE: 'disable',
} as const;

export const APP_STATE_COLOR = {
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    EXPIRED: {
        iconColor: styles.coral[500],
        textColor: styles.coral[500],
    },
    DISABLED: {
        iconColor: styles.gray[400],
        textColor: styles.gray[400],
    },
} as const;
