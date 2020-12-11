import styles from '@/styles/colors';

export const userStateColor = Object.freeze({
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    DISABLED: {
        iconColor: styles.alert,
        textColor: styles.alert,
    },
    UNIDENTIFIED: {
        iconColor: styles.gray[500],
        textColor: styles.gray[500],
    },
});
