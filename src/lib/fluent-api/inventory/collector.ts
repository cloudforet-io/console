/* eslint-disable camelcase */
import {
    CollectAction,
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';
import { CollectorPluginModel } from '@/lib/fluent-api/inventory/collector-plugin';

const idField = 'collector_id';

export enum COLLECT_MODE {
    all = 'ALL',
    create = 'CREATE',
    update = 'UPDATE'
}

interface IdParameter {
    [idField]: string;
}

export enum COLLECTOR_STATE {
    enabled = 'ENABLED',
    disabled = 'DISABLED'
}

export interface CollectorModel extends IdParameter, Tags {
    name: string;
    state: COLLECTOR_STATE;
    provider: string;
    capability: object;
    plugin_info: CollectorPluginModel;
    priority: number;
    created_at: TimeStamp;
    last_collected_at: TimeStamp | null;
}

export type CollectorListResp = ListType<CollectorModel>

interface CreateParameter extends Tags {
    name: string;
}
export interface CollectorUpdateParameter extends Tags, IdParameter {
    name?: string;
    plugin_info?: CollectorPluginModel;
    priority?: number;
}

interface CollectParameter extends IdParameter {
    collect_mode?: string;
    filter?: any;
    credential_id?: string;
    credential_group_id?: string;
}


class Create extends CreateAction<CreateParameter, any> {}

class Update extends UpdateAction<CollectorUpdateParameter, any> {
    idField = idField;

    setParameter(parameter: CollectorUpdateParameter): this {
        const api = this.clone();
        api.apiState.parameter = parameter;
        return api;
    }

    setId(id: string): this {
        const api = this.clone();
        api.apiState.parameter[idField] = id;
        return api;
    }
}

class Delete extends SingleDeleteAction<IdParameter, any> {
    idField = idField;
}

class Get extends GetAction<IdParameter, CollectorModel> {
    idField = idField;
}

class List extends ListAction<any, CollectorListResp> {}

class Collect extends CollectAction<CollectParameter, any> {
    idField = idField;

    setId(id: string): this {
        const api = this.clone();
        api.apiState.parameter.collector_id = id;
        return api;
    }

    setCollectMode(mode: COLLECT_MODE): this {
        const api = this.clone();
        api.apiState.parameter.collect_mode = mode;
        return api;
    }

    setCredentialId(credentialId: string): this {
        const api = this.clone();
        api.apiState.parameter.credential_id = credentialId;
        return api;
    }

    setCredentialGroupId(credentialGroupId: string): this {
        const api = this.clone();
        api.apiState.parameter.credential_group_id = credentialGroupId;
        return api;
    }

    setFilters(...args: any): this {
        const api = this.clone();
        api.apiState.parameter.filter = args;
        return api;
    }
}

export default class Collector extends Resource implements ResourceActions<'create'|'update'|'delete'|'get'|'list'> {
    protected name = 'collector';

    create() { return new Create(this.api, this.baseUrl); }

    update() { return new Update(this.api, this.baseUrl); }

    delete() { return new Delete(this.api, this.baseUrl); }

    get() { return new Get(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }

    collect() { return new Collect(this.api, this.baseUrl); }
}
