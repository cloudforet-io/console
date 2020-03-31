/* eslint-disable camelcase */
import {
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    DynamicFormItem,
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';

const idField = 'provider';

interface IdParameter {
    [idField]: string;
}

export interface ProviderModel extends Tags,IdParameter{
    name: string
    template: {
        service_account:{
            data: DynamicFormItem[]
        }
    },
    capability: {
        supported_schema:string[]
    },
    created_at: TimeStamp
}


export type ProviderListResp = ListType<ProviderModel>


class Get extends GetAction<IdParameter, ProviderModel> {
    protected idField = idField;
}
class List extends ListAction<any, ProviderListResp> {}
export default class Provider extends Resource implements ResourceActions<'get'|'list'> {
    protected name = 'provider';

    get() { return new Get(this.baseUrl); }

    list() { return new List(this.baseUrl); }
}
