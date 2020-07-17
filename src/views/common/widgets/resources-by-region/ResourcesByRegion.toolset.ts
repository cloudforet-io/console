import { Stat } from '@/lib/fluent-api/statistics/resource';
import { initReactive, StateToolSet } from '@/lib/toolset';

export const resourceByRegionProps = {
    getAction: {
        type: Function,
        default: (action: Stat<any>) => action.setResourceType('identity.ServiceAccount'),
    },
    projectFilter: {
        type: String,
        default: '',
    },
    isServer: {
        type: Boolean,
        default: true,
    },
};

export interface ResourcesByRegionProps {
    getAction(api: Stat<any>): Stat<any>;
    projectFilter: string;
    isServer: boolean;
}

@StateToolSet<ResourcesByRegionProps>()
export class ServiceAccountsWidgetState {
    state: ResourcesByRegionProps;

    static initState(): { isServer: boolean; projectFilter: string; getAction: (action) => Stat<any> } {
        return {
            getAction: action => action.setResourceType('identity.ServiceAccount'),
            projectFilter: '',
            isServer: true,
        };
    }

    constructor(initData: ResourcesByRegionProps = {} as ResourcesByRegionProps, lazy = false) {
        this.state = initReactive<ResourcesByRegionProps>(lazy, ServiceAccountsWidgetState.initState(), initData);
    }
}
