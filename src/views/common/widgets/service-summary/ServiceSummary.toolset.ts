import { Location } from 'vue-router';
import {colorset} from "@/lib/util";

export const serviceSummaryProps = {
    title: {
        type: String,
        default: '',
    },
    to: {
        type: [String, Object],
        default: '/dashboard',
    },
    count: {
        type: Number,
        default: 0,
    },
    data: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: true,
    },
    color: {
        type: String,
        default: colorset[0],
    },
};

export interface ServiceSummaryPropsType {
    title: string;
    to: Location | string;
    count: number;
    data: number;
    loading: boolean;
    color: string;
}
