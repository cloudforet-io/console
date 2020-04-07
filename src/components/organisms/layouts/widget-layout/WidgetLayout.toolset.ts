export const widgetLayoutProps = {
    title: {
        type: String,
        default: '',
    },
    help: {
        type: String,
        default: '',
    },
    padding: {
        type: Boolean,
        default: true,
    },
};

export interface WidgetLayoutPropsType {
    title: string;
    help?: string;
    padding?: boolean;
}
