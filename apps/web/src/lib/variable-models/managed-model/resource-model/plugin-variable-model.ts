import type { PluginModel } from '@/schema/repository/plugin/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class PluginVariableModel extends ResourceVariableModel<PluginModel> {
    static meta = {
        key: 'plugin',
        name: 'Plugin',
        resourceType: 'repository.Plugin',
        idKey: 'plugin_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = PluginVariableModel.meta;
    }
}
