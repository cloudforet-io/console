import { primary3, gray } from '@/components/styles/colors';

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
        default: null,
    },
    height: {
        type: String,
        default: null,
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
