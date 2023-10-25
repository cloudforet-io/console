import ResourceNameVariableModel from '@/lib/variable-models/_base/resource-name-variable-model';
import type { VariableModelLabel } from '@/lib/variable-models/_base/types';

export default class ProviderVariableModel extends ResourceNameVariableModel {
    key = 'provider';

    name = 'Provider';

    labels: VariableModelLabel[] = ['cost'];

    resourceType = 'identity.Provider';

    idKey = 'provider';
}
