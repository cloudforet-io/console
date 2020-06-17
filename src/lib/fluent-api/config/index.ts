/* eslint-disable camelcase */
import { BaseConfigActionAPI, Resource, ResourceActions } from '@/lib/fluent-api/toolset';
import { Tags, TimeStamp } from '@/lib/fluent-api/type';


export interface ConfigResp<T> {
    name: string;
    data: T;
    created_at: TimeStamp;
    tags: Tags;
}


class CreateConfigAction<parameter, resp> extends BaseConfigActionAPI<parameter, resp> {
    protected path = 'create'

    setParameter(parameter: parameter): this {
        const api = this.clone();
        api.apiState.parameter = parameter;
        return api;
    }
}

class UpdateConfigAction<parameter, resp> extends BaseConfigActionAPI<parameter, resp> {
    protected path = 'update'

    setParameter(parameter: parameter): this {
        const api = this.clone();
        api.apiState.parameter = parameter;
        return api;
    }
}


class DeleteConfigAction<parameter, resp> extends BaseConfigActionAPI<parameter, resp> {
    protected path = 'delete'
}

class GetConfigAction<parameter, resp> extends BaseConfigActionAPI<parameter, resp> {
    protected path = 'get'
}
export default abstract class Config<parameter, resp> extends Resource implements ResourceActions<'get'|'create'|'delete'> {
     protected abstract name = '';

     create(): CreateConfigAction<parameter, resp> { return new CreateConfigAction<parameter, resp>(this.api, this.baseUrl.substring(1, this.baseUrl.length - 1)); }

     update(): UpdateConfigAction<parameter, resp> { return new UpdateConfigAction<parameter, resp>(this.api, this.baseUrl.substring(1, this.baseUrl.length - 1)); }

     delete(): DeleteConfigAction<parameter, resp> { return new DeleteConfigAction<parameter, resp>(this.api, this.baseUrl.substring(1, this.baseUrl.length - 1)); }
     //
     // list(): ListSchedule { return new ListSchedule(this.api, this.baseUrl); }

     get(): GetConfigAction<parameter, ConfigResp<resp>> {
         return new GetConfigAction<parameter, ConfigResp<resp>>(this.api, this.baseUrl.substring(1, this.baseUrl.length - 1));
     }
}
