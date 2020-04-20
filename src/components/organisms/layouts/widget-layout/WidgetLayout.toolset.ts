export const widgetLayoutProps = {
    title: {
        type: String,
        default: '',
    },
    help: {
        type: String,
        default: '',
    },
};

export interface WidgetLayoutPropsType {
    title: string;
    help?: string;
}
