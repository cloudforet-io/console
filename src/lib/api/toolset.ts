import Vue from 'vue';
import { AxiosResponse } from 'axios';
import { getCurrentInstance } from '@vue/composition-api';
import { readonlyArgs } from '@/lib/type';
import { SearchQueryType } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { responseData } from '@/lib/mock/toolset';
import { ActionAPI, ListType, QueryAPI } from '@/lib/fluent-api';
import { ToolboxTableToolSet } from '@/components/organisms/tables/toolbox-table/toolset';
import { api } from './axios';

import functions = Casual.functions;

export abstract class DynamicAPI {}


interface GetDataAPI {
    getData: (...args: any[]) => void;

}

export abstract class DynamicFluentAPIToolSet<
    parameter = any,
    resp = any,
    action extends ActionAPI = ActionAPI<parameter, resp>,
    > extends DynamicAPI implements GetDataAPI {
    abstract getData: (...args: any[]) => void;

    setAction(action: action) {
        this.action = action;
    }

    protected constructor(protected action: action) { super(); }

    protected abstract getAction: () => action
}

export abstract class DynamicReactiveAPI extends DynamicAPI {
    vm: any;

    // eslint-disable-next-line class-methods-use-this
    get $http() {
        return api.instance;
    }

    protected abstract async requestData(data?: any, ...args: any[]): Promise<any[]>;

    constructor() {
        super();
        this.vm = getCurrentInstance();
    }
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export abstract class getDataAPI extends DynamicReactiveAPI {
    public abstract getData(data?: any, ...args: any[]): void | any;
}

// eslint-disable-next-line @typescript-eslint/class-name-casing
export abstract class fetchDataAPI extends DynamicReactiveAPI {
    public abstract async fetchData(data?: any, ...args: any[]): Promise<void | any>;
}

export type transformHandlerType = (responseData: AxiosResponse) => AxiosResponse;

export interface BaseApiState {
    url: readonlyArgs<string>;
    only: readonlyArgs<string[]>;
    extraParams: readonlyArgs<any>;
    fixSearchQuery: SearchQueryType[];
    transformHandler: null|transformHandlerType;
}
