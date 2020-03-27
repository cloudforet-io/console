export const lazyImgProps = {
    height: {
        type: String,
        default: '2rem',
    },
    width: {
        type: String,
        default: '2rem',
    },
    imgUrl: {
        type: String,
        required: true,
    },
    errorIcon: {
        type: String,
        default: 'ic_collector_tags',
    },
};

export interface LazyImgPropsType {
    height?: string;
    width?: string;
    imgUrl: string;
    errorIcon?: string;
}
