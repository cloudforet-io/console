/* eslint-disable camelcase */
import {
    GetAction, Resource,
    ResourceActions,
} from '@/lib/fluent-api/toolset';

const idField = 'search';
interface IdParameter {
    [idField]: string;
}

export interface PageDiscoveryTypeModel extends IdParameter {
    id: string;
    name: string;
}

class Get extends GetAction<any, PageDiscoveryTypeModel> {
    idField = idField;

    setResourceType(resource: string) {
        this.apiState.parameter.resource_type = resource;
        return this.clone();
    }

    setLimit(limit: number): this {
        const api = this.clone();
        api.apiState.parameter.options.limit = limit;
        return api;
    }
}

export default class Autocomplete extends Resource implements ResourceActions<'get'> {
    protected name = 'autocomplete';

    get(): Get { return new Get(this.api, this.baseUrl); }
}
