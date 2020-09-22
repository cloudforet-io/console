import {
    ActionAPI, BaseResources,
} from '@/lib/fluent-api';

export abstract class DynamicAPI {}


interface GetDataAPI {
    getData: (...args: any[]) => void|any;
}

interface UpdateDataAPI {
    updateData: (...args: any[]) => void|any;
}

export abstract class ResourceAPIToolSet<
    parameter = any,
    resp = any,
    actions extends BaseResources<parameter, resp> = BaseResources<parameter, resp>,
    > extends DynamicAPI implements GetDataAPI, UpdateDataAPI {
    actions: actions;

    abstract getData: (...args: any[]) => void;

    abstract updateData: (...args: any[]) => void;

    protected constructor(actions: actions) { super(); this.actions = actions; }
}

export abstract class DynamicFluentAPIToolSet<
    parameter = any,
    resp = any,
    action extends ActionAPI = ActionAPI<parameter, resp>,
    > extends DynamicAPI implements GetDataAPI {
    action: action;

    abstract getData: (...args: any[]) => void|any;

    protected constructor(action: action) { super(); this.action = action; }

    abstract getAction: (...args: any[]) => action
}
