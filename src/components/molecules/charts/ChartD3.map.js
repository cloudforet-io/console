import styles from '@/styles/_variables.scss';
import chartStyles from '@/components/molecules/charts/Chart.styles.scss';

export const DATA_PROPERTIES = Object.freeze([
    'key', 'value', 'label',
]);

export const DEFAULT_SIZE = Object.freeze({
});

export const DEFAULT_OPTIONS = Object.freeze({
    scales: {
        display: false,
        y: {
        },
        x: {
        },
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

export const HOVER_COLORSET = Object.freeze([
    chartStyles.primary_op3,
    chartStyles.primary2_op3,
    chartStyles.other1_op3,
    chartStyles.secondary_op3,
    chartStyles.secondary1_op3,
    chartStyles.safe_op3,
    chartStyles.other4_op3,
    chartStyles.other3_op3,
    chartStyles.other2_op3,
    chartStyles.primary1_op3,
]);
