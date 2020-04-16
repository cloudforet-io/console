import { primary3, gray } from '@/styles/colors';

export const skeletonProps = {
    loading: {
        type: Boolean,
        default: true,
    },
    color: {
        type: String,
        default: primary3,
    },
    duration: {
        type: Number,
        default: 2,
    },
    highlight: {
        type: String,
        default: gray[100],
    },
    width: {
        type: String,
        default: '100%',
    },
    height: {
        type: String,
        default: '0.875rem',
    },
    tag: {
        type: String,
        default: 'span',
    },
    animation: {
        type: Boolean,
        default: true,
    },
};
