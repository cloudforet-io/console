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
    url: any;
}

class Get extends GetAction<any, PageDiscoveryTypeModel> {
    idField = idField;

    setResourceType(resource: string) {
        this.apiState.parameter.resource_type = resource;
        return this.clone();
    }
}

export default class PageDiscovery extends Resource implements ResourceActions<'get'> {
    protected name = 'page-discovery';

    get(): Get { return new Get(this.api, this.baseUrl); }
}
