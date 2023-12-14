import * as styles from '@/styles/colors';

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

export const APP_TABLE_FIELDS = [
    { name: 'name', label: 'App Name' },
    { name: 'state', label: 'State' },
    {
        name: 'app_id', label: 'App ID', sortable: false, disableCopy: false,
    },
    { name: 'role_id', label: 'Role ID' },
    // { name: 'tags', label: 'Tags', sortable: false },
    { name: 'last_accessed_at', label: 'Last Activity' },
    { name: 'expired_at', label: 'Expiration Date' },
    { name: 'created_at', label: 'Created' },
];
