import Vue from 'vue';
import { AxiosResponse } from 'axios';
import { getCurrentInstance } from '@vue/composition-api';
import { readonlyArgs } from '@/lib/type';
import { SearchQueryType } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { api } from './axios';
import { responseData } from '@/lib/mock/toolset';

export abstract class DynamicAPI {
    public vm: any;

    // eslint-disable-next-line class-methods-use-this
    get $http() {
        return api.instance;
    }

    protected abstract async requestData(data?: any, ...args:any[]): Promise<any[]>;

    constructor() {
        this.vm = getCurrentInstance();
    }
}

export abstract class getDataAPI extends DynamicAPI {
    public abstract getData(data?: any, ...args:any[]): void | any;
}

export abstract class fetchDataAPI extends DynamicAPI {
    public abstract async fetchData(data?: any, ...args:any[]): Promise<void | any>;
}

export type transformHandlerType = (responseData:AxiosResponse) => AxiosResponse;

export interface BaseApiState {
    url: readonlyArgs<string>;
    only: readonlyArgs<string[]>;
    extraParams: readonlyArgs<any>;
    fixSearchQuery: SearchQueryType[];
    transformHandler:null|transformHandlerType;
}
