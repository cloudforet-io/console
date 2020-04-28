import { Stat } from '@/lib/fluent-api/statistics/resource';
import { initReactive, StateToolSet } from '@/lib/toolset';

export const serviceAccountsProps = {
    title: {
        type: String,
        default: '',
    },
    reverse: {
        type: Boolean,
        default: false,
    },
    getAction: {
        type: Function,
        default: (action: Stat<any>) => action.setResourceType('identity.ServiceAccount'),
    },
};

export interface ServiceAccountsPropsType {
    title: string;
    reverse?: boolean;
    getAction(api: Stat<any>): Stat<any>;
}

@StateToolSet<ServiceAccountsPropsType>()
export class ServiceAccountsWidgetState {
    state: ServiceAccountsPropsType;

    static initState(): ServiceAccountsPropsType {
        return {
            title: '',
            reverse: false,
            getAction: action => action.setResourceType('identity.ServiceAccount'),
        };
    }

    constructor(initData: ServiceAccountsPropsType = {} as ServiceAccountsPropsType, lazy = false) {
        this.state = initReactive<ServiceAccountsPropsType>(lazy, ServiceAccountsWidgetState.initState(), initData);
    }
}
