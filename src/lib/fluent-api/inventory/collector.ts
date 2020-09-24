/* eslint-disable camelcase */
import {
    CollectAction,
    CreateAction, GetAction, ListAction, MultiDeleteAction, MultiDisableAction, MultiEnableAction, Resource,
    ResourceActions, ServiceResources, SingleDeleteAction, SingleDisableAction, SingleEnableAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    COLLECT_MODE, CollectorModel, CollectorUpdateParameter,
    CollectorCollectParameter, CollectorCreateParameter, CollectorListResp,
} from '@/lib/fluent-api/inventory/collector.type';

const idField = 'collector_id';

interface IdParameter {
    [idField]: string;
}


class Create extends CreateAction<CollectorCreateParameter, any> {}

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

class Delete extends MultiDeleteAction<IdParameter, any> {
    idsField = 'collectors';
}

class Get extends GetAction<IdParameter, CollectorModel> {
    idField = idField;
}

class List extends ListAction<any, CollectorListResp> {}

class Collect extends CollectAction<CollectorCollectParameter, any> {
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

    setSecretId(credentialId: string): this {
        const api = this.clone();
        api.apiState.parameter.secret_id = credentialId;
        return api;
    }

    setSecretGroupId(credentialGroupId: string): this {
        const api = this.clone();
        api.apiState.parameter.secret_group_id = credentialGroupId;
        return api;
    }

    setFilters(filters: any): this {
        const api = this.clone();
        api.apiState.parameter.filter = filters;
        return api;
    }
}

class Enable extends MultiEnableAction<IdParameter, CollectorModel> {
    idsField = 'collectors'
}

class Disable extends MultiDisableAction<IdParameter, CollectorModel> {
    idsField = 'collectors'
}

export default class Collector extends Resource implements
    ResourceActions<'create'|'update'|'delete'|'get'|'list'|'collect'|'enable'|'disable'> {
    protected name = 'collector';

    create(): Create { return new Create(this.api, this.baseUrl); }

    update(): Update { return new Update(this.api, this.baseUrl); }

    delete(): Delete { return new Delete(this.api, this.baseUrl); }

    get(): Get { return new Get(this.api, this.baseUrl); }

    list(): List { return new List(this.api, this.baseUrl); }

    collect(): Collect { return new Collect(this.api, this.baseUrl); }

    enable(): Enable { return new Enable(this.api, this.baseUrl); }

    disable(): Disable { return new Disable(this.api, this.baseUrl); }
}
