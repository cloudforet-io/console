import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';

export default class ProviderVariableModel extends ResourceNameVariableModel {
    key = 'provider';

    name = 'Provider';

    resourceType = 'identity.Provider';

    idKey = 'provider';
}
