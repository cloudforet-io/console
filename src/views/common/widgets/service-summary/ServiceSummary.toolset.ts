import { Location } from 'vue-router';

export const serviceSummaryProps = {
    title: {
        type: String,
        default: '',
    },
    to: {
        type: [String, Object],
        default: '/dashboard',
    },
};

export interface ServiceSummaryPropsType {
    title: string;
    to: Location | string;
}
