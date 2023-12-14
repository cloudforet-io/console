import * as styles from '@/styles/colors';

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
