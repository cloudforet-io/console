import type { AppModel } from '@/api-clients/identity/app/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class AppVariableModel extends ResourceVariableModel<AppModel> {
    static meta = {
        key: 'app',
        name: 'App',
        resourceType: 'identity.App',
        idKey: 'app_id',
        nameKey: 'name',
        _searchTargets: ['name'],
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = AppVariableModel.meta;
    }
}
