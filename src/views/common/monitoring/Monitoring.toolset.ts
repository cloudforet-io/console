import {
    HelperToolSet, initReactive, StateToolSet,
} from '@/components/util/toolset-helpers';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { get } from 'lodash';
import { computed } from '@vue/composition-api';
import { forceRefArg } from '@/lib/type';
import { MonitoringProps } from '@/views/common/monitoring/type';

@StateToolSet<MonitoringProps>()
export class MonitoringState<D, S extends MonitoringProps = MonitoringProps> {
    state: UnwrapRef<S & D>;

    static initState(): MonitoringProps {
        return {
            resourceType: '',
            resources: [],
        };
    }

    constructor(initData: D = {} as D, lazy = false) {
        this.state = initReactive<UnwrapRef<S & D>>(lazy, MonitoringState.initState(), initData);
    }
}


@HelperToolSet()
export class MonitoringToolSet<D=any> extends MonitoringState<D> {
    // eslint-disable-next-line no-empty-function
    static initToolSet(_this: MonitoringToolSet, targetResources: forceRefArg<any[]>) {
        // @ts-ignore
        _this.state.resources = computed(() => targetResources.value.map(d => ({
            id: get(d, _this.idField),
            name: d.name,
        })));
    }

    constructor(public idField: string, resourceType: string, target: forceRefArg<any[]>, initData: D = {} as D) {
        super({ resourceType, ...initData });
        MonitoringToolSet.initToolSet(this, target);
    }
}
