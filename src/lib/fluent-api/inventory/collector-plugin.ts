/* eslint-disable camelcase */
const idField = 'plugin_id';

interface IdParameter {
    [idField]: string;
}

interface FilterFormat {
    name: string;
    type: string;
    change_key: string[];
    resource_type: string;
    object_key?: string;
}

interface PluginOptions {
    supported_resource_type: string[];
    filter_format: FilterFormat[];
}


export interface CollectorPluginModel extends IdParameter {
    version: string;
    options: PluginOptions;
    secret_id?: string;
    secret_group_id?: string;
    provider?: string;
}
