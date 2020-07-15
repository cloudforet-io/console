export const widgetLayoutProps = {
    title: {
        type: String,
        default: '',
    },
    help: {
        type: String,
        default: '',
    },
    titleStyle: {
        type: Object,
        default: () => ({}),
    },
    subTitle: {
        type: String,
        default: '',
    },
};

export interface WidgetLayoutPropsType {
    title: string;
    help?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    titleStyle?: any;
    subTitle?: string;
}
