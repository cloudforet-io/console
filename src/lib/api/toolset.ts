import Vue from 'vue';
import { AxiosResponse } from 'axios';
import { readonlyArgs } from '@/lib/type';
import { SearchQueryType } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { api } from './axios';

export abstract class DynamicAPI {
    public abstract vm: Vue;

    // eslint-disable-next-line class-methods-use-this
    get $http() {
        return api.instance;
    }

    protected abstract requestData(data?: any, ...args:any[]): Promise<AxiosResponse<any>>;
}

export abstract class getDataAPI extends DynamicAPI {
    public abstract getData(data?: any, ...args:any[]): void | any;
}

export abstract class fetchDataAPI extends DynamicAPI {
    public abstract fetchData(data?: any, ...args:any[]): void | any;
}


export interface BaseApiState {
    url: readonlyArgs<string>;
    only: readonlyArgs<string[]>;
    extraParams: readonlyArgs<any>;
    fixSearchQuery: SearchQueryType[];
}
