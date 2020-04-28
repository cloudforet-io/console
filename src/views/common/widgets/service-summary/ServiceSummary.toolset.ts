import { Location } from 'vue-router';
import { colorset } from '@/lib/util';

import { Stat } from '@/lib/fluent-api/statistics/resource';
import {initReactive, StateToolSet} from "@/lib/toolset";


export const serviceSummaryProps = {
    title: {
        type: String,
        default: '',
    },
    to: {
        type: [String, Object],
        default: '/dashboard',
    },
    color: {
        type: String,
        default: colorset[0],
    },
    getAction: {
        type: Function,
        default: api => api,
    },
};

export interface ServiceSummaryPropsType {
    title: string;
    to: Location | string;
    color: string;
    getAction(api: Stat<any>): Stat<any>;
}


@StateToolSet<ServiceSummaryPropsType>()
export class ServiceSummaryWidgetState {
    state: ServiceSummaryPropsType;

    static initState(): ServiceSummaryPropsType {
        return {
            title: '',
            to: '/dashboard',
            color: colorset[0],
            getAction: action => action,
        };
    }

    constructor(initData: ServiceSummaryPropsType = {} as ServiceSummaryPropsType, lazy = false) {
        this.state = initReactive<ServiceSummaryPropsType>(lazy, ServiceSummaryWidgetState.initState(), initData);
    }
}
