import styles from '@/styles/_variables.scss';

export const DEFAULT_OPTIONS = Object.freeze({
    scales: {
        display: false,
        y: {},
        x: {},
    },
    responsive: {
        width: true,
        height: true,
        preserveAspectRatio: {
            align: 'xMinYMin',
            meetOrSlice: 'meet',
        },
    },
});

export const PRIMARY_COLORSET = Object.freeze([
    styles.primary,
    styles.primary2,
    styles.other1,
    styles.secondary,
    styles.secondary1,
    styles.safe,
    styles.other4,
    styles.other3,
    styles.other2,
    styles.primary1,
]);
