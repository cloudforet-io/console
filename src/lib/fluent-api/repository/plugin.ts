/* eslint-disable camelcase */
import {
    CreateAction,
    GetAction,
    ListAction,
    RegisterAction,
    Resource,
    ResourceActions,
    SingleDeleteAction,
    SingleDeregisterAction,
    SingleDisableAction,
    SingleEnableAction,
    SingleItemAction,
    UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    ListType, Tags, TimeStamp,
} from '@/lib/fluent-api/type';
import { MONITORING_TYPE } from '@/lib/fluent-api/monitoring/type';

const idField = 'plugin_id';

interface IdParameter {
    [idField]: string;
}

export enum PLUGIN_STATE {
    enabled = 'ENABLED',
    disabled = 'DISABLED'
}

export interface PluginCapabilityModel {
    supported_schema: string[];
    use_resource_secret: boolean;
    monitoring_type: MONITORING_TYPE;
}

export interface PluginTemplateModel {
    [key: string]: {
        schema: object;
    };
}

export interface PluginRegisterParameter extends Tags {
    name: string;
    service_type: string;
    image: string;
    provider?: string;
    capability?: PluginCapabilityModel;
    template?: PluginTemplateModel;
    project_id?: string;
    labels?: string[];
}

export interface PluginModel extends Tags {
    plugin_id: string;
    name: string;
    state: PLUGIN_STATE;
    image: string;
    registry_url: string;
    service_type: string;
    provider: string;
    capability: PluginCapabilityModel;
    template: PluginTemplateModel;
    repository_info: any; // TODO: Specify repository info model
    project_id: string;
    labels: string[];
    created_at: TimeStamp;
}

export interface PluginUpdateParameter extends Tags, IdParameter {
    name: string;
    capability?: PluginCapabilityModel;
    template?: PluginTemplateModel;
    labels?: string[];
}

export interface PluginGetParameter extends IdParameter {
    repository_id?: string;
}

export type PluginVersionsResp = {
    results: string[];
    total_count: number;
};

export interface ListParameter {
    repository_id: string;
    plugin_id?: string;
    name?: string;
    state?: PLUGIN_STATE;
    service_type?: string;
    provider?: string;
    project_id?: string;
}

export type PluginListResp = ListType<PluginModel>

class Register extends RegisterAction<PluginRegisterParameter, PluginModel> {}
class Update extends UpdateAction<PluginUpdateParameter, PluginModel> {}
class Enable extends SingleEnableAction<IdParameter, PluginModel> {
    idField = idField;
}
class Disable extends SingleDisableAction<IdParameter, PluginModel> {
    idField = idField;
}
class Deregister extends SingleDeregisterAction<IdParameter, undefined> {
    idField = idField;
}
class Get extends GetAction<PluginGetParameter, PluginModel> {
    idField = idField;

    setRepositoryId(repositoryId: string): this {
        const api = this.clone();
        this.apiState.parameter.repository_id = repositoryId;
        return api;
    }
}

class GetVersions extends SingleItemAction<PluginGetParameter, PluginVersionsResp> {
    protected path = 'get-versions';

    idField = idField;

    setRepositoryId(repositoryId: string): this {
        const api = this.clone();
        this.apiState.parameter.repository_id = repositoryId;
        return api;
    }
}

class List extends ListAction<ListParameter, PluginListResp> {
    setRepositoryId(repositoryId: string): this {
        const api = this.clone();
        this.apiState.extraParameter.repository_id = repositoryId;
        return api;
    }

    setServiceType(type: string): this {
        const api = this.clone();
        this.apiState.extraParameter.service_type = type;
        return api;
    }
}

export default class Plugin extends Resource implements ResourceActions<
    'register'|'update'|'enable'|'disable'|'deregister'|'get'|'getVersions'|'list'> {
    protected name = 'plugin';

    register() { return new Register(this.api, this.baseUrl); }

    update() { return new Update(this.api, this.baseUrl); }

    enable() { return new Enable(this.api, this.baseUrl); }

    disable() { return new Disable(this.api, this.baseUrl); }

    deregister() { return new Deregister(this.api, this.baseUrl); }

    get() { return new Get(this.api, this.baseUrl); }

    getVersions() { return new GetVersions(this.api, this.baseUrl); }

    list() { return new List(this.api, this.baseUrl); }
}
