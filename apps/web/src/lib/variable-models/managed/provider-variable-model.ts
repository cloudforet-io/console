import ResourceVariableModel from '@/lib/variable-models/_base/resource-variable-model';

export default class ProviderVariableModel extends ResourceVariableModel {
    key = 'provider';

    name = 'Provider';

    resourceType = 'identity.Provider';

    idKey = 'provider';
}
