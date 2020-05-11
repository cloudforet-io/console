export const cardItemProps = {
    icon: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    contents: {
        type: String,
        default: '',
    },
    defaultIcon: {
        type: String,
        default: 'ic_collector_tags',
    },
};

export interface CardItemProps {
    icon?: string;
    title: string;
    contents?: string;
    defaultIcon?: string;
}
