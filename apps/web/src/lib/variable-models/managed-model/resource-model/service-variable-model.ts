import type { ServiceModel } from '@/api-clients/alert-manager/service/schema/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class ServiceVariableModel extends ResourceVariableModel<ServiceModel> {
    static meta = {
        key: 'service',
        name: 'Service',
        resourceType: 'alert_manager.Service',
        idKey: 'service_id',
        nameKey: 'name',
        _searchTargets: ['name'],
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = ServiceVariableModel.meta;
    }
}
