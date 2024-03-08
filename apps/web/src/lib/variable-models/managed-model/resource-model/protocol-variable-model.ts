import type { ProtocolModel } from '@/schema/notification/protocol/model';

import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';
import type { VariableModelConstructorConfig } from '@/lib/variable-models/_base/types';


export default class ProtocolVariableModel extends ResourceVariableModel<ProtocolModel> {
    static meta = {
        key: 'protocol',
        name: 'Protocol',
        resourceType: 'notification.Protocol',
        idKey: 'protocol_id',
        nameKey: 'name',
    };

    constructor(config: VariableModelConstructorConfig = {}) {
        super(config);
        this._meta = ProtocolVariableModel.meta;
    }
}
