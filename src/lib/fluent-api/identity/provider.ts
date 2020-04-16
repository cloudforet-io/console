/* eslint-disable camelcase */
import {
    GetAction, ListAction, Resource, ResourceActions,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';
import { JsonSchema } from '@/lib/type';

const idField = 'provider';
const idsField = 'providers';

interface IdParameter {
    [idField]: string;
}

export interface ProviderModel extends Tags, IdParameter{
    name: string;
    template: {
        service_account: {
            schema: JsonSchema<'object'>;
        };
    };
    capability: {
        supported_schema: string[];
    };
    created_at: TimeStamp;
}


export type ProviderListResp = ListType<ProviderModel>


class Get extends GetAction<IdParameter, ProviderModel> {
    protected idField = idField;
}
class List extends ListAction<any, ProviderListResp> {}
export default class Provider extends Resource implements ResourceActions<'get'|'list'> {
    protected name = 'provider';

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }
}
