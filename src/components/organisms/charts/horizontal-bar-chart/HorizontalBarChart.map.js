import Chart from 'chart.js';
import styles from '@/styles/_variables.scss';

export const HORIZONTAL_CHART_OPTIONS = Object.freeze({
    barRadius: 20,
    scales: {
        xAxes: [{
            display: false,
            stacked: false,
            scaleLabel: { display: false },
            gridLines: {
                offsetGridLines: true,
            },
            ticks: {
                beginAtZero: true,
            },
        }],
        yAxes: [{
            categoryPercentage: 1,
            barPercentage: 1,
            barThickness: 8,
            categorySpacing: 0,
            display: false,
            stacked: false,
            scaleLabel: { display: false },
            gridLines: {
                offsetGridLines: true,
            },
            tooltips: {
                intersect: true,
                mode: 'dataset'
            }
        }],
    },
    legend: {
        display: false,
    },
});

export const HORIZONTAL_PRIMARY_COLORSET = Object.freeze([
    styles.primary1,
]);

export const HORIZONTAL_HOVER_COLORSET = Object.freeze([
    styles.primaryDark,
]);
